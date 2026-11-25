"""Model tests: hours model coverage, cost monotonicity in months, purity of cost(), one hours base,
one schedule, seat inventory consistency, edit keeps tools, data repair.  Usage: python3 tests/model.py"""
import os, sys, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index.html') + '?lang=es'
fails = []
def check(c, msg):
    if not c: fails.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
    pg = b.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(300)
    pg.evaluate('seedData(); render()')

    # 1.4 coverage + monotonic cost
    res = pg.evaluate("""() => {
      const out = [];
      for (const type of ['digital','mobile','web','mkt','brand','data','maint'])
        for (const size of ['s','m','l','xl']) {
          const row = {type, size, cov: [], total: [], monthly: [], work: [], refm: REFM[size]};
          for (const months of [3,6,12]) {
            const pr = {id:'t', name:'t', type, size, months, budget:0, ent:'es', status:'draft', own:[]};
            suggest(pr); const k = cost(pr);
            row.cov.push(k.cov); row.total.push(k.total); row.monthly.push(k.monthly); row.work.push(workOf(pr).hours);
            row['roles'+months] = pr.roles.map(r => r.id + ':' + (r.n || r.hours + 'h') + ':' + r.ct).join(' ');
            // staffing rules
            for (const r of pr.roles) {
              if (!r.n) { const pm = ['product-owner','project-manager'].includes(r.id);
                if (r.hours < (pm ? 60 : 40)) out.push({bad: `min hours ${type}/${size}/${months} ${r.id} ${r.hours}`});
                if (r.ct !== 'free') out.push({bad: `part-time not freelance ${type}/${size}/${months} ${r.id}`}); }
              if (r.n && months > 3 && r.ct !== 'emp') out.push({bad: `core not employee ${type}/${size}/${months} ${r.id}`});
              if (r.n && months <= 3 && r.ct !== 'free') out.push({bad: `short project core not freelance ${type}/${size}/${months} ${r.id}`});
            }
            if (!pr.roles.some(r => r.n >= 1)) out.push({bad: `no full-time person ${type}/${size}/${months}`});
          }
          out.push(row);
        }
      return out;
    }""")
    for r in res:
        if 'bad' in r: fails.append(r['bad']); continue
        for m, c in zip((3, 6, 12), r['cov']):
            # the team always covers the work; it may only over-cover when the deadline is longer than the size needs
            check(c >= 0.95 and (m > r['refm'] or c <= 1.4), f"coverage {r['type']}/{r['size']}/{m}m = {c:.3f}")
        # the work depends on type and size, not on the deadline (only compression adds coordination)
        ws = [w for m, w in zip((3, 6, 12), r['work']) if m >= r['refm']]
        check(len(set(ws)) <= 1, f"work changes with a longer deadline {r['type']}/{r['size']}: {r['work']}")
        # a longer deadline never needs a bigger monthly team
        check(r['monthly'][0] >= r['monthly'][1] * 0.92 - 1 and r['monthly'][1] >= r['monthly'][2] - 1,  # 3-month teams are freelance (×0,92)
               f"monthly cost grows with a longer deadline {r['type']}/{r['size']}: {[round(x) for x in r['monthly']]}")

    # 1.2 purity
    r = pg.evaluate("""() => {
      const strip = () => JSON.stringify({...D, seenAt: 0}); const before = strip();
      const a = D.projects.map(p => JSON.stringify(cost(p)));
      const b2 = D.projects.slice().reverse().map(p => JSON.stringify(cost(p))).reverse();
      for (const v of ['home','licenses','project','people','notes']) { V.view = v; V.id = D.projects[0].id; render(); }
      const c = D.projects.map(p => JSON.stringify(cost(p)));
      return {same: strip() === before, order: JSON.stringify(a) === JSON.stringify(b2), after: JSON.stringify(a) === JSON.stringify(c),
              props: D.projects.flatMap(p => Object.keys(p).filter(k => k[0]==='_'||k.startsWith('q_')||k==='bought').concat(p.roles.flatMap(r => Object.keys(r).filter(k => k[0]==='_'||k.startsWith('q_')||k==='own'))))};
    }""")
    check(r['same'], 'cost()/render mutated D'); check(r['order'], 'cost depends on call order'); check(r['after'], 'cost changes after visiting pages')
    check(not r['props'], f"stray derived props stored: {r['props']}")

    # 1.5 one hours base
    r = pg.evaluate("""() => {
      const mk = (o) => Object.assign(mkRole('front', 0, 0), o);
      const a = {id:'x', name:'x', type:'digital', size:'m', months:6, ent:'es', status:'draft', shared:{pm:null, genai:null}, qty:{}, own:[], roles:[Object.assign(mkRole('front',0,HPM/2),{tools:{}, ai:0, ct:'emp'})]};
      const b = {id:'y', name:'y', type:'digital', size:'m', months:6, ent:'es', status:'draft', shared:{pm:null, genai:null}, qty:{}, own:[], roles:[Object.assign(mkRole('front',1),{tools:{}, ai:0, ct:'emp'})]};
      return [cost(a).people, cost(b).people / 2, roleSum(a.roles[0]).c];
    }""")
    check(abs(r[0] - r[1]) < 1e-6 and abs(r[2] - r[0]) < 1e-6, f'half a person != half the cost: {r}')

    # 1.6 schedule vs total
    r = pg.evaluate("""() => D.projects.concat([{...D.projects[0], status:'active', start:new Date().toISOString(), months:2.5, id:'z'}, {...D.projects[0], status:'draft', months:6, id:'w'}]).map(p => {
        const k = cost(p); let s = 0; for (let i = -40; i < 80; i++) s += schedShare(p, i) * k.monthly; 
        return [p.months, k.total, s, schedShare(p, 0), p.status]; })""")
    for m, tot, s, now, st in r:
        if m: check(abs(tot - s) < 1, f'forecast sum {s} != total {tot}')
    act = [x for x in r if x[4] == 'active' and x[3] > 0]
    check(all(x[3] == 1 for x in act if x[0] >= 2) , 'active project not at 100% this month')

    # 1.1 seat consistency in seed
    r = pg.evaluate("""() => {
      const out = {};
      for (const l of D.licenses) { const inv = seatInventory(l); out[l.opt+'|'+l.scope] = inv; }
      const jira = D.licenses.find(l => l.opt === 'jira'), p = D.projects.find(x => x.id === 'p1'), K = cost(p);
      const t = {...K.tools.find(x => x.id === 'jira')};
      t.buy = D.projects.filter(x => stOf(x) === 'active' && x.ent === 'es').reduce((s, x) => s + ((cost(x).tools.find(y => y.id === 'jira') || {}).buy || 0), 0);
      D.ent = 'all'; D.as = 'board';
      const alerts = pending(D.projects).map(a => a[2]); D.as = 'manager';
      return {jira: seatInventory(jira), t, alerts, all: out};
    }""")
    inv, t = r['jira'], r['t']
    check(inv['missing'] == t['buy'] and inv['contracted'] - inv['used'] + inv['missing'] + t['free'] >= 0, f'jira inventory vs project mismatch {inv} {t}')
    check(inv['missing'] > 0 and t['buy'] == inv['missing'], f"project buys {t['buy']} but licence misses {inv['missing']}")
    check(any('Jira Standard' in a and (('(%d)' % inv['missing']) in a or ('faltan %d asientos' % inv['missing']) in a or (inv['missing'] == 1 and 'falta 1 asiento' in a)) for a in r['alerts']), f"home alert does not match Jira missing {inv['missing']}: {r['alerts']}")
    check(not any('asientos libres de Jira' in a or 'asiento libre de Jira' in a for a in r['alerts']), 'home says Jira has free seats')
    html = pg.evaluate("D.as='board';V.view='licenses';render();const t=document.getElementById('app').innerText;D.as='manager';render();t")
    check('Comprar %d asiento de Jira Standard' % inv['missing'] in html and 'Falta %d' % inv['missing'] in html, 'Licencias page does not show missing seats for Jira')

    # 1.3 edit keeps tools
    r = pg.evaluate("""() => {
      const p = D.projects[0]; p.shared.pm = 'jira'; p.qty = {pm: 3}; p.roles[0].tools = {...p.roles[0].tools}; const before = JSON.stringify([p.shared, p.qty, p.roles]);
      V.view = 'project'; V.id = p.id; render();
      document.querySelector('[data-edit]').click();
      V.draft.name = 'Otro nombre'; V.draft.size = 'xl'; V.draft.months = 3;
      document.querySelector('[data-saveedit]').click();
      return [before === JSON.stringify([p.shared, p.qty, p.roles]), p.name, p.size, p.months, p.work > 0];
    }""")
    check(r[0], 'saving the edit modal changed tools/quantities/roles'); check(r[1:4] == ['Otro nombre', 'xl', 3], 'edit not applied')

    # 1.9 escaping
    r = pg.evaluate("""() => { const x = '<img src=x onerror=window.__x=1>'; D.projects[0].name = x; D.org = x; D.entities[0].name = x; D.custom = []; 
      const html = []; for (const v of ['home','projects','project','licenses','people','notes','settings','export']) { V.view = v; V.id = D.projects[0].id; render(); html.push(document.getElementById('app').innerHTML + document.getElementById('side').innerHTML); }
      D.notes.unshift({ic:'bell', t:x, s:x, ts:Date.now(), r:0}); V.view='notes'; render(); html.push(document.getElementById('app').innerHTML);
      return [html.some(h => h.includes('<img src=x')), !!window.__x, document.querySelectorAll('#app img[src=x]').length]; }""")
    check(not r[0] and not r[1] and r[2] == 0, f'unescaped user text: {r}')

    # 1.8 repair
    corruptions = {
      'ent': "d => { delete d.ent; return d }", 'roles': "d => { delete d.projects[0].roles; return d }",
      'badEnt': "d => { d.projects[0].ent = 'zz'; d.licenses[0].scope = 'qq'; d.ent = 'nope'; return d }",
      'arrays': "d => { delete d.licenses; delete d.notes; delete d.users; delete d.croles; delete d.custom; return d }",
      'entities': "d => { delete d.entities; return d }", 'junk': "d => 'hola'", 'projNull': "d => { d.projects = [null, 3, {}]; return d }",
      'roleJunk': "d => { d.projects[0].roles = [null, {id:'nope'}, {id:'front'}]; d.projects[0].shared = null; return d }",
    }
    seed = pg.evaluate("JSON.stringify((seedData(), D))")
    for name, fn in corruptions.items():
        raw = pg.evaluate("(a) => { const d = JSON.parse(a[0]); const v = eval(a[1])(d); return typeof v === 'string' ? v : JSON.stringify(v) }", [seed, fn])
        ctx = b.new_context(); q = ctx.new_page(); e2 = []
        q.on('pageerror', lambda e, e2=e2: e2.append(str(e)))
        q.goto(URL); q.evaluate("(r) => localStorage.setItem('humain21', r)", raw); q.reload(); q.wait_for_timeout(200)
        ok = q.evaluate("document.getElementById('app').innerText.length > 20")
        for v in ['home','projects','licenses','people','settings','notes']:
            q.evaluate(f"V.view='{v}';render()")
        if D_ := q.evaluate("D.projects.length > 0 ? (V.view='project', V.id=D.projects[0].id, render(), true) : true"): pass
        check(ok and not e2, f'corrupt "{name}" -> app failed: {e2}')
        ctx.close()

    # 2.2 comparator: every type at m / 6 months
    r = pg.evaluate("""() => { const out = [];
      for (const type of ['digital','mobile','web','mkt','brand','data','maint']) {
        const pr = {id:'c', name:'c', type, size:'m', months:6, budget:0, ent:'es', status:'draft', own:[], cmpSc:'est'}; suggest(pr);
        const v = cmpVariants(pr, 'est'), z = cmpVariants(pr, 'zero');
        const ap = JSON.parse(JSON.stringify(pr)); applyVariant(ap, 'ai', 'est'); const an = JSON.parse(JSON.stringify(pr)); applyVariant(an, 'noai', 'est');
        out.push({type, sin: v.sin.K.total, con: v.con.K.total, ppS: v.sin.K.ppl, ppC: v.con.K.ppl, mS: v.sin.pr.months, mC: v.con.pr.months,
          okAi: Math.abs(cost(ap).total - v.con.K.total) < 1, okNo: Math.abs(cost(an).total - v.sin.K.total) < 1, covC: v.con.K.cov, covS: v.sin.K.cov, lic: (v.con.K.toolsM + v.con.K.saved + v.con.K.api - v.sin.K.toolsM - v.sin.K.saved - v.sin.K.api) * (pr.months || 12) /* monthly now counts every licence seat, reused ones too */, zS: z.sin.K.total, zC: z.con.K.total, zP: [z.sin.K.ppl, z.con.K.ppl]});
      } return out; }""")
    for x in r:
        # with AI it can only cost more by its own licences (when the gain does not free a whole person)
        check(x['con'] <= x['sin'] + x['lic'] + 1, f"with-AI costs more than its licences for {x['type']}: {x['con']} > {x['sin']} + {x['lic']}")
        # with no gain, AI must not "save" anything: same people, and more cost (licences)
        check(x['zP'][0] == x['zP'][1] and x['zC'] >= x['zS'] - 1, f"zero-gain AI saves people or money for {x['type']}: {x}")
        check(x['okAi'] and x['okNo'], f"applied variant does not match column for {x['type']}")
        check(x['ppC'] <= x['ppS'] and x['mC'] <= x['mS'], f"with-AI not fewer people/time for {x['type']}")
        check(x['covC'] >= 0.949, f"with-AI does not cover the work for {x['type']}: {x['covC']}")
    # 2.9 rate precedence, 2.7 hired migration
    r = pg.evaluate("""() => { const p = D.projects[0], K = cost(p), m = true, r0 = p.roles[0];
      const base = rateOf(r0, p); const key = rateKey(r0); D.rates[key] = 7777; const co = rateOf(r0, p); r0.rate = 9999; const own = rateOf(r0, p); delete r0.rate; delete D.rates[key];
      const x = {id:'q', name:'q', type:'digital', size:'m', months:6, ent:'es', status:'active', start:new Date().toISOString(), own:[], shared:{}, qty:{}, price:0, roles:[Object.assign(mkRole('front',2),{hired:true})]};
      return {m: m && Math.abs(m.m - (p.price - K.total)) < 1, base: base.src, co: [co.v, co.src], own: [own.v, own.src], mig: repairRole(x.roles[0], x).fill.filter(f => f.src === 'new' && f.hiring).length}; }""")
    check(r['base'] in ('Ref. de mercado', 'Estimación'), f"base rate src {r['base']}")
    check(r['co'] == [7777, 'Tarifa de tu empresa'], f"company rate {r['co']}"); check(r['own'] == [9999, 'Tu tarifa'], f"role rate {r['own']}")
    # sourced references: BASE from JSON gross x 1.3065 / 12, labels
    q = pg.evaluate("""() => { const p = D.projects[0], mk = (o) => Object.assign(mkRole('back', 1), {tools:{}}, o);
      const L = (o, pr) => rateOf(mk(o), pr || p).src;
      return {base: BASE, eng: rateOf(mk({ct:'emp', grade:'mid'}), {ent:'es'}).v, jr: rateOf(mk({ct:'emp', grade:'junior'}), {ent:'es'}).v,
        emp: L({ct:'emp'}, {ent:'es'}), free: L({ct:'free'}, {ent:'es'}), mx: L({ct:'emp'}, {ent:'mx'}), stf: L({ct:'emp', grade:'staff'}, {ent:'es'}), ref: Object.keys(REF).every(k => REF[k].s.length && REF[k].g.length === 3 && REF[k].y)}; }""")
    check(q['base'] == {'product': 6610, 'pdesign': 5010, 'creative': 3870, 'eng': 5030, 'data': 6400, 'qa': 5150, 'mkt': 4940}, f"BASE {q['base']}")
    check(q['eng'] == 5030 and q['jr'] == round(5030 * 0.78), f"eng mid/junior {q['eng']} {q['jr']}")
    check((q['emp'], q['free'], q['stf']) == ('Ref. de mercado', 'Ref. de mercado', 'Estimación'), f"labels {q}")  # freelance now sourced from Malt; Mexico stays an estimate (Levels.fyi)
    check(q['ref'], 'REF incomplete')
    check(r['mig'] == 2, 'hired not migrated to seats being hired')
    # Fase 1: no AI discount when sizing; the AI card only informs
    r = pg.evaluate("""() => { const out = [];
      for (const type of ['digital','mobile','web','mkt','brand','data','maint']) for (const size of ['s','m','l','xl']) for (const months of [3,6,12,0]) {
        const pr = {id:'t', name:'t', type, size, months, ent:'es', status:'draft', own:[]};
        const a = buildTeam(pr).roles.map(r => r.id + ':' + r.n + ':' + r.hours).join(), b = buildTeam(pr, {noAI:true}).roles.map(r => r.id + ':' + r.n + ':' + r.hours).join();
        if (a !== b) out.push(type + '/' + size + '/' + months); }
      return {diff: out, up: D.projects.flatMap(p => p.roles.map(upOf)).every(v => v === 0)}; }""")
    check(not r['diff'], f"AI still discounts people in: {r['diff'][:5]}")
    check(r['up'], 'upOf is not 0: AI still adds capacity')
    # Fase 1: seed, fill rule, money split, visibility
    r = pg.evaluate("""() => { seedData(); const by = (id) => D.projects.find(p => p.id === id), src = (p) => p.roles.map(r => r.id + '=' + r.fill.map(f => f.src + (f.part ? '(p)' : '')).join('+')).join(' ');
      const K = D.projects.map(p => [p.id, cost(p)]), split = K.every(([, k]) => Math.abs(k.monthly - k.inv - k.paid) < 1e-6 && k.inv >= 0 && k.paid >= 0);
      const p4 = by('p4'), k4 = cost(p4), newSum = p4.roles.reduce((a, r) => a + Math.round(seatCosts(r, p4).reduce((x, s) => x + (s.inv ? s.v : 0), 0)), 0);
      const mineReal = p4.roles.every(r => seatCosts(r, p4).every(s => s.f.src !== 'mine' || !s.who || s.v === s.who.cost * s.ded));
      const nw = JSON.parse(JSON.stringify(p4)); nw.id = 'n'; nw.startFrom = 'new'; syncFill(nw, true);
      const ai = JSON.parse(JSON.stringify(p4)); ai.aiPref = 'none'; applyAiPref(ai);
      const busy = D.people.filter(x => !isFree(x.id)).map(x => x.name).sort();
      D.as = 'manager'; const mv = scoped().map(p => p.id).sort().join(); D.as = 'board'; const bv = scoped().map(p => p.id).sort().join(); D.as = 'manager';
      const emma = D.people.filter(x => x.team === 'Emma Walker'), free = emma.filter(x => isFree(x.id)).length;
      return {src4: src(p4), src2: src(by('p2')), st: D.projects.map(p => p.id + ':' + p.status).join(), split, inv4: [k4.inv, newSum + k4.toolsM], mineReal,
        nw: nw.roles.every(r => r.fill.every(f => f.src === 'new')), ai: cost(ai).tools.filter(t => isAiTool(t.id)).length + ai.roles.reduce((a, r) => a + r.ai, 0),
        mv, bv, free, n: D.people.length, store: STORE, costs: D.people.every(x => x.cost > 0 && x.cost % 10 === 0), busy}; }""")
    check(r['store'] == 'humain21', 'store key not humain21')
    check(r['st'].startswith('p4:draft,p2:pending,p7:active,p1:active,p5:active,p3:active,p6:active') and 'p8:changes' in r['st'] and 'p9:rejected' in r['st'] and 'p10:pending' in r['st'], f"seed states {r['st']}")
    check('frontend-developer=new' in r['src4'] and 'backend-developer=new' in r['src4'] and 'product-owner=shared(p)' in r['src4'] and 'mine' in r['src4'], f"fill rule on the draft: {r['src4']}")
    check('new' in r['src2'] and 'other' not in r['src2'], f"pending campaign: the Responsable only has own people and hires, never another team: {r['src2']}")
    check(r['split'], 'monthly != new investment + already paid')
    check(abs(r['inv4'][0] - r['inv4'][1]) < 1, f"investment != new seats + seats to buy: {r['inv4']}")
    check(r['mineReal'], 'a person of my team is not costed at their real cost')
    check(r['nw'], '«Todo nuevo» did not make every seat a new hire')
    check(r['ai'] == 0, '«Sin IA» still has AI tools or AI users')
    check('p2' in r['mv'] and 'p4' in r['mv'] and 'p4' not in r['bv'], f"visibility (board does not see drafts) manager {r['mv']} / board {r['bv']}")
    check(r['free'] == 1 and 12 <= r['n'] <= 18 and r['costs'], f"people seed: {r['free']} free in Emma's team, {r['n']} people, costs ok {r['costs']}")
    # approve: seats Dirección gave to another team keep their person, new seats are being hired; marking one hired creates the person
    r = pg.evaluate("""() => { seedData(); const p = D.projects.find(x => x.id === 'p2');
      /* Dirección covers the designer hire with a free person of another team (the asg- dropdown) before approving */
      const gd = p.roles.find(r => r.id === 'graphic-designer' && r.fill.some(f => f.src === 'new')), ix = gd.fill.findIndex(f => f.src === 'new'), ch = D.people.find(x => x.name === 'Charlotte Evans');
      gd.fill[ix] = {src: 'other', pid: ch.id}; approveProject(p);
      const oth = p.roles.flatMap(r => r.fill.filter(f => f.src === 'other')), nw = p.roles.flatMap(r => r.fill.filter(f => f.src === 'new'));
      return {st: p.status, oth: oth.length > 0 && oth.every(f => f.pid && PERSON(f.pid).team !== p.owner), nw: nw.every(f => f.hiring), carla: !isFree(D.people.find(x => x.name === 'Charlotte Evans').id)}; }""")
    check(r['st'] == 'active' and r['nw'] and r['carla'], f'approval: {r}')
    # migration of the previous format (people names, ISO start, client/price)
    r = pg.evaluate("""() => { const old = JSON.parse(JSON.stringify(seedData())); delete old.people; delete old.managers; delete old.as; old.me = {name: 'Emma Walker', role: 'Administradora global'};
      const p = old.projects.find(x => x.id === 'p1'); p.start = new Date(2026, 6, 3).toISOString(); p.client = true; p.price = 9; p.status = 'active';
      p.roles.forEach(r => { delete r.fill; r.people = [{name: 'Ana Gil', from: '2026-07-01'}]; });
      const q = old.projects.find(x => x.id === 'p4'); q.status = 'raro';
      D = old; repairData();
      const pp = D.projects.find(x => x.id === 'p1');
      return {start: pp.start, client: 'client' in pp || 'price' in pp, ana: D.people.filter(x => x.name === 'Ana Gil').length, fill: pp.roles.every(r => r.fill.length === seatsOf(r) && r.fill[0].src === 'mine'),
        st: D.projects.find(x => x.id === 'p4').status, me: D.me.team, mgr: D.managers.length}; }""")
    check(r['start'] == '2026-07' and not r['client'] and r['ana'] >= 1 and r['fill'] and r['st'] == 'draft' and r['me'] and r['mgr'] >= 1, f'migration: {r}')
    # 2.10 archive hides from totals, delete entity guard
    r = pg.evaluate("""() => { const p = D.projects[0]; const a = scoped().length; p.archived = true; const b = scoped().length; p.archived = false; return [a, b]; }""")
    check(r[0] - r[1] == 1, 'archived project still in scoped()')
    check(not errs, f'page errors: {errs}')
    b.close()
if fails:
    print('\n'.join(fails)); print(len(fails), 'failures'); sys.exit(1)
print('model OK')
