"""Smoke test: first run (no SRC/Emma, welcome + empty states, both paths), then every page in both views (manager and
Dirección), an active and a draft proposal, export, Equipo, and the whole flow: new project in 2 steps -> proposal with new
investment -> send to Dirección -> switch to Dirección -> approve -> in progress, at desktop and mobile sizes.
Fails on any JS error / console error / dialog.
Usage: python3 tests/smoke.py"""
import os, sys
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index.html') + '?lang=es'
PAGES = ['home', 'projects', 'people', 'licenses', 'settings']
errors = []
def need(c, m):
    if not c: errors.append(m)
def fresh(pg, w):
    pg.evaluate("D.as='board';save();V.view='settings';V.nav=false;V.menu=false;render()")
    pg.click('#app [data-fresh]')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
    for tag, (w, h) in {'desktop': (1280, 800), 'mobile': (390, 844)}.items():
        ctx = b.new_context(viewport={'width': w, 'height': h})
        pg = ctx.new_page()
        pg.on('pageerror', lambda e, t=tag: errors.append(f'[{t}] pageerror: {e}'))
        pg.on('console', lambda m, t=tag: m.type == 'error' and 'fonts.g' not in m.text and 'ERR_' not in m.text and errors.append(f'[{t}] console: {m.text}'))
        pg.on('dialog', lambda d, t=tag: (errors.append(f'[{t}] dialog: {d.message}'), d.dismiss()))
        # ---- first run
        pg.goto(URL); pg.wait_for_timeout(300)
        # first visit loads the example data and shows the tour
        need(pg.evaluate("D.demo===true && D.org==='SRC'"), f'[{tag}] first visit is not demo')
        # home: tasks, team availability and project cards; no tour, KPIs or forecast
        need(all(x in pg.inner_text('#app') for x in ['Tareas pendientes','Tu equipo','Tus proyectos']) and 'Qué ver primero' not in pg.inner_text('#app') and 'Previsión de coste' not in pg.inner_text('#app'), f'[{tag}] home blocks')
        pg.click('#app .hproj .pcard'); pg.wait_for_timeout(100); need(pg.evaluate("V.view")=='project', f'[{tag}] project card did not open')
        pg.evaluate("V.view='home';render()")
        fresh(pg,w); pg.click('[data-freshok]'); pg.wait_for_timeout(100)
        need('primer proyecto' in pg.inner_text('#app'), f'[{tag}] empezar de cero from first visit failed')
        pg.click('[data-loadseed]'); pg.wait_for_timeout(100)
        fresh(pg,w); pg.click('[data-freshok]'); pg.wait_for_timeout(100)
        pg.reload(); pg.wait_for_timeout(200)
        need('primer proyecto' in pg.inner_text('#app'), f'[{tag}] empty state not kept after reload')
        full = lambda: pg.inner_text('body') + pg.inner_html('#side')
        need('SRC' not in full() and 'Emma' not in full(), f'[{tag}] SRC/Emma on first run')
        need('Empieza por tu primer proyecto' in pg.inner_text('#app') and 'Restaurar datos' in pg.inner_text('#app'), f'[{tag}] welcome missing')
        for v in PAGES + ['notes']:
            pg.evaluate(f"V.view='{v}';V.nav=false;render()")
            t = pg.inner_text('#app')
            need('SRC' not in t and 'Emma' not in t, f'[{tag}] SRC/Emma in empty {v}')
        for v in ['projects', 'people', 'licenses']:
            pg.evaluate(f"V.view='{v}';render()")
            need(pg.query_selector('#app .empty') is not None, f'[{tag}] no empty state in {v}')
        pg.evaluate("V.view='home';render()")
        pg.click('[data-setup]'); pg.fill('#sn', 'Estudio Norte'); pg.click('[data-setupok]'); pg.wait_for_timeout(100)
        need(pg.query_selector('#pn') is not None, f'[{tag}] setup did not open new-project modal')
        pg.keyboard.press('Escape')
        need('Estudio Norte' in pg.inner_text('#side') or w < 900, f'[{tag}] company name not set')
        # ---- example data path
        ctx.clear_cookies(); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(200)
        need(pg.evaluate("D.demo===true"), f'[{tag}] cleared storage does not give demo')
        fresh(pg,w); pg.click('[data-freshok]'); pg.wait_for_timeout(100)
        pg.click('[data-loadseed]'); pg.wait_for_timeout(100)
        need('SRC' in pg.inner_text('body') + pg.inner_html('#side'), f'[{tag}] seed not loaded')
        need(pg.evaluate("!document.querySelector('.demo')"), f'[{tag}] top banner still present')
        need('ejemplo' not in pg.inner_text('body').lower() and not pg.query_selector('[data-demotag]'), f'[{tag}] demo wording visible')
        pg.evaluate("go('home')"); pg.wait_for_timeout(100)
        need('ejemplo' not in pg.inner_text('#app').lower(), f'[{tag}] tour footer wording')
        fresh(pg,w); pg.click('[data-freshok]'); pg.wait_for_timeout(100)
        need('primer proyecto' in pg.inner_text('#app'), f'[{tag}] empezar de cero failed')
        pg.click('[data-loadseed]')
        # ---- pages
        for n in PAGES:
            if w < 600 or not pg.query_selector(f'#side [data-nav={n}]'): pg.evaluate(f"V.view='{n}';V.nav=false;render()")
            else: pg.click(f'#side [data-nav={n}]')
            pg.wait_for_timeout(60)
            assert pg.inner_text('#app').strip(), f'{n} empty'
        pg.click('#side [data-nav=notes]' if w >= 900 else '#top [data-bell]'); pg.wait_for_timeout(60)
        need(pg.evaluate("V.view") == 'notes', f'[{tag}] bell does not open notifications')
        if w >= 900:
            need(pg.evaluate("[...document.querySelectorAll('#side nav .nv')].map(b=>b.textContent.replace(/\\d+$/,'').trim()).join(',')") in ('Inicio,Notificaciones,Proyectos,Personas,Software e IA,Ajustes', 'Inicio,Notificaciones,Proyectos,Personas,Ajustes'), f'[{tag}] sidebar nav order')
            need(pg.query_selector('#side .procard') is None and pg.query_selector('[data-nav=plans]') is None, f'[{tag}] Premium card / Planes still present')
            need(pg.evaluate("!document.querySelector('#side .bell') && !document.querySelector('#side .accbtn > .i') && document.querySelector('#side .accbtn').getAttribute('aria-haspopup')==='menu'"), f'[{tag}] account row has bell/chevron')
        body = lambda: pg.inner_text('body').lower()
        for who in ('manager', 'board'):
            pg.evaluate(f"D.as='{who}';render()")
            for n in PAGES + ['notes']:
                pg.evaluate(f"V.view='{n}';V.nav=false;render()")
                need('cliente' not in pg.inner_text('#app').lower().replace('portal de clientes', '').replace('los clientes', '') and 'margen' not in pg.inner_text('#app').lower(), f'[{tag}] client/margin wording in {n} ({who})')
            for st in ('active', 'draft', 'pending'):
                pid = pg.evaluate(f"(D.projects.find(p=>p.status==='{st}'&&canSee(p))||{{}}).id")
                if not pid: continue
                pg.evaluate(f"V.view='project';V.id='{pid}';render()")
                assert pg.inner_text('#app').strip(), f'project {st} empty'
                t = pg.inner_text('#app')
                need('Coste del proyecto' in t.title() or 'COSTE DEL PROYECTO' in t.upper(), f'[{tag}] {who}/{st}: no project cost')
                need('INVERSIÓN NUEVA' in t.upper() and 'Ya lo pagáis' in t, f'[{tag}] {who}/{st}: no investment split')
                need('cobras' not in t and 'margen' not in t.lower(), f'[{tag}] {who}/{st}: price/margin in proposal')
                pg.evaluate("document.querySelectorAll('[data-ropen]').forEach(b=>b.click())")
                pg.evaluate("document.querySelectorAll('[data-radv]').forEach(b=>b.click())")
        pg.evaluate("D.as='manager';render()")
        # draft proposal: AI card, assumptions, export, the manager cannot send without a reason
        pg.evaluate("V.view='project';V.id=D.projects.find(p=>p.status==='draft'&&canSee(p)).id;V.ropen=null;render()")
        pg.evaluate("V.rx={};P().roles.forEach((r,i)=>V.rx[P().id+':'+i]=true);render()")
        need(pg.query_selector('.prow [data-pedit]') is not None, f'[{tag}] one row per person with edit')
        pg.click('.asmc [data-assume]'); need(pg.query_selector('.asm') is not None and 'si la IA no ahorrara' in pg.inner_text('.asm'), f'[{tag}] assumptions panel (AI gain is informative)')
        pg.click('.pact [data-pmenu]'); pg.click('[data-pexp]'); need(pg.query_selector('.paper') is not None, f'[{tag}] export view')
        need('margen' not in pg.inner_text('.paper').lower() and 'inversión nueva' in pg.inner_text('.paper').lower(), f'[{tag}] export figures')
        # Equipo: add a person (name required)
        pg.evaluate("V.view='people';render()")
        pg.evaluate("document.querySelector('#app [data-addperson]').click()"); pg.click('[data-savep]'); need('Escribe el nombre' in pg.inner_text('#modal'), f'[{tag}] person name required')
        if pg.locator('#askrn').count():
            pg.fill('#askrn', 'Amy Clarke'); pg.click('#askfid'); pg.locator('.ddl [role=option]').first.click(); pg.click('[data-sendask]')
        else:
            pg.fill('#psn', 'Amy Clarke'); pg.click('[data-savep]')
        pg.wait_for_timeout(60)
        need('Amy Clarke' in pg.inner_text('#app'), f'[{tag}] person not listed')
        # ---- whole flow: 2-step new project -> proposal -> send -> Dirección approves
        pg.evaluate("go('projects')"); pg.evaluate("document.querySelector('#app [data-new]').click()"); pg.wait_for_selector('#pn')
        need('Paso 1 de 2' in pg.inner_text('#modal'), f'[{tag}] no step indicator')
        pg.fill('#pn', 'Web de empleo'); pg.click('#ptype'); pg.click('.ddo[data-ddv="web"]')
        pg.click('[data-nstep="2"]'); pg.wait_for_timeout(60)
        need('Paso 2 de 2' in pg.inner_text('#modal') and pg.query_selector('[data-create]') is not None, f'[{tag}] step 2 missing')
        pg.click('[data-nadv]'); pg.click('[data-dset=startFrom][data-v=new]'); pg.click('[data-create]'); pg.wait_for_timeout(100)
        need(pg.evaluate("V.view==='project' && P().name==='Web de empleo' && P().status==='draft'"), f'[{tag}] proposal not created')
        need(pg.evaluate("cost(P()).inv > 0 && P().roles.every(r=>r.fill.every(f=>f.src==='new'))"), f'[{tag}] «Todo nuevo» proposal has no new investment')
        pg.click('[data-send]'); pg.wait_for_timeout(60)
        need(pg.evaluate("P().status") == 'draft' and pg.query_selector('#pje') is not None, f'[{tag}] sent without a reason')
        pg.fill('#pj', 'Necesitamos captar talento sin pagar a agencias.'); pg.click('[data-send]'); pg.wait_for_timeout(60)
        need(pg.evaluate("P().status") == 'pending' and 'Enviada a Dirección' in pg.inner_text('#app'), f'[{tag}] not sent')
        pid = pg.evaluate("P().id")
        pg.evaluate("document.querySelector('#demo [data-demo]').click()"); pg.evaluate("document.querySelector('#demo [data-as=board]').click()"); pg.wait_for_timeout(60)
        need(pg.evaluate("D.as") == 'board' and 'Demo · Dirección' in pg.inner_html('#demo') and 'Vista de Dirección' not in pg.inner_html('#side') + pg.inner_html('#top'), f'[{tag}] switch to Dirección')
        pg.evaluate(f"go('project','{pid}')")
        pg.click('[data-askchg]'); pg.click('[data-askchg]'); need(pg.query_selector('#rce') is not None and pg.evaluate("P().status") == 'pending', f'[{tag}] changes without comment'); pg.click('[data-rcancel]')
        pg.click('[data-approve]'); pg.wait_for_timeout(60)
        need(pg.evaluate("P().status") == 'active' and 'En curso' in pg.inner_text('#app'), f'[{tag}] approve did not put it in progress')
        need(pg.evaluate("P().roles.every(r=>r.fill.every(f=>f.src!=='new'||f.hiring))"), f'[{tag}] new seats not «En contratación»')
        pg.evaluate("D.as='manager';V.modal=null;V.view='home';render()")
        ctx.close()
    b.close()
if errors:
    print('\n'.join(errors)); sys.exit(1)
print('smoke OK')
