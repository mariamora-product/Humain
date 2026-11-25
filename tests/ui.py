"""UI behaviour tests: focus management, XSS through the real UI, review flow (send, ask for changes, approve, hire), reset, no dead controls.
Usage: python3 tests/ui.py"""
import os, sys
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index.html') + '?lang=es'
fails = []
def check(c, m):
    if not c: fails.append(m)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
    pg = b.new_page(viewport={'width': 1280, 'height': 800})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: (errs.append('dialog ' + d.message), d.dismiss()))
    pg.goto(URL, wait_until='load'); pg.wait_for_function("typeof D!=='undefined' && D && typeof seedData==='function'")
    pg.evaluate('seedData(); render()')
    # titles
    check(pg.title() == 'Inicio · HUMAIN', f'title {pg.title()}')
    pg.evaluate("D.as='board';render()"); pg.click('#side [data-nav=licenses]'); check(pg.title() == 'Software e IA · HUMAIN', 'title software e IA'); pg.evaluate("D.as='manager';render()")
    # notifications: opening the page clears the counter; rows are whole-row buttons; click marks read
    check(pg.evaluate("unread()") > 0, 'no unread before visiting notes')
    pg.click('#side [data-nav=notes]')
    check(pg.evaluate("unread()") == 0 and not pg.query_selector('#side .nbdg'), 'counter not cleared on opening notes')
    check(pg.query_selector('.nlist .nitem.new .ndot') is not None, 'new rows lost their dot during the visit')
    check(pg.query_selector('[data-readone],[data-readall]') is None, 'old read controls still present')
    pg.click('.nlist button.nmain'); check(pg.evaluate("D.notes.some(n=>n.r===1)"), 'row click did not mark read')
    pg.evaluate("V.view='home';render();V.view='notes';render()")
    check(pg.query_selector('.nlist .nitem.new') is None, 'rows still new on next visit')
    # focus: opener -> first field -> close returns
    pg.click('#side [data-nav=projects]')
    pg.focus('#app [data-new]'); pg.keyboard.press('Enter'); pg.wait_for_selector('#modal .sheet'); pg.wait_for_function("document.activeElement && document.activeElement.id==='pn'", timeout=2000)
    check(pg.evaluate('document.activeElement.id') == 'pn', 'modal does not focus first field')
    for i in range(30):
        pg.keyboard.press('Tab')
        if not pg.evaluate("!!document.activeElement.closest('#modal')"): fails.append('Tab escaped the modal'); break
    pg.evaluate("document.querySelector('[data-dset=size][data-v=l]').focus()")
    pg.keyboard.press('Enter'); pg.wait_for_function("document.activeElement && document.activeElement.dataset.v==='l' && document.activeElement.dataset.dset==='size'", timeout=2000)
    check(pg.evaluate("document.activeElement.dataset.v+document.activeElement.dataset.dset") == 'lsize', 'focus lost after re-render in modal')
    # required type + hint
    pg.click('[data-nstep="2"]'); pg.wait_for_timeout(80)
    check('Elige un tipo de proyecto' in pg.inner_text('#modal') and pg.evaluate("V.draft.step||1") == 1, 'Siguiente without type should stay and say why')
    pg.keyboard.press('Escape'); pg.wait_for_function("!document.querySelector('#modal .sheet') && document.activeElement.hasAttribute('data-new')", timeout=2000)
    check(pg.evaluate("document.activeElement.hasAttribute('data-new')"), 'focus not returned to opener')
    # XSS via the real UI
    pg.click('#app [data-new]'); pg.fill('#pn', '<img src=x onerror=alert(1)>'); pg.click('#ptype'); pg.click('.ddo[data-ddv="digital"]')
    pg.click('[data-nstep="2"]'); pg.click('[data-create]'); pg.wait_for_function("!document.querySelector('#modal .sheet')")
    for v in ['home', 'projects', 'licenses', 'notes', 'people']:
        pg.evaluate(f"V.view='{v}';render()")
        check(pg.evaluate("document.querySelectorAll('#app img[src=x]').length") == 0, f'xss img in {v}')
    pg.evaluate("D.notes.unshift({ic:'bell',t:D.projects[0].name,s:'x',ts:Date.now(),r:0});V.view='notes';render()")
    check('<img src=x' not in pg.inner_html('#app'), 'xss in notes')
    pg.evaluate("V.view='project';V.id=D.projects[0].id;render()")
    check('<img src=x' not in pg.inner_html('#app'), 'xss in project page')
    check('&lt;img src=x' in pg.inner_html('#app'), 'name not shown as literal text')
    # edit modal value attr
    pg.click('[data-edit]'); check(pg.evaluate("document.getElementById('pn').value") == '<img src=x onerror=alert(1)>', 'name in edit input')
    pg.keyboard.press('Escape')
    check(pg.evaluate("document.getElementById('toasts').getAttribute('aria-live')") == 'polite', 'toast region not live')
    # no enabled control without effect: no data-soon anywhere
    html = ''
    for v in ['home', 'notes', 'projects', 'people', 'licenses', 'settings']:
        pg.evaluate(f"V.view='{v}';render()"); html += pg.inner_html('body')
    check('data-soon' not in html, 'data-soon still present')
    # premium mentions
    prem = {}
    for v in ['home', 'notes', 'projects', 'people', 'licenses', 'billing', 'settings']:
        pg.evaluate(f"V.view='{v}';render()")
        prem[v] = pg.inner_text('#app').count('Premium')
    check(prem['licenses'] == 0 and prem['people'] == 0 and prem['home'] == 0, f'premium mentions {prem}')
    # --- estados: pie de tarjeta de puesto, menú de fila, segmentados, hover de primarios
    pg.evaluate("seedData();V.modal=null;V.view='project';V.id='p4';render()")
    check(pg.query_selector('.prow [data-pedit]') is not None, 'each person row opens the form')
    pg.click('.prow [data-pedit]'); pg.wait_for_timeout(150)
    check(pg.query_selector('#modal .pform #pf-fid') is not None and pg.query_selector('[data-pfp]') is not None and pg.query_selector('#modal [data-seatrm]') is None, 'person form with puesto and programs, no remove (the row has it)')
    pg.click('[data-pfp]'); pg.wait_for_timeout(100); n0 = pg.evaluate('V.draft.tools.length'); pg.click('.msopt[data-pft=miro_st]'); pg.click('.msopt[data-pft=chatgpt]'); pg.wait_for_timeout(80)
    check(pg.evaluate('V.draft.tools.length') == n0 + 2 and pg.query_selector('#pfpl .pill.ai') is not None, 'programs are multi-select and an AI shows the tag')
    pg.click('[data-pfsave]'); pg.wait_for_timeout(100); check(pg.evaluate("P().roles.some(r=>r.tools.miro_st&&r.tools.chatgpt&&r.ai===1)"), 'saving the person form')
    wr = pg.evaluate("[...document.querySelectorAll('.seg button')].filter(b=>b.getBoundingClientRect().height>b.parentElement.querySelector('button').getBoundingClientRect().height+2||b.scrollWidth>b.clientWidth+1).length")
    check(wr == 0, 'opción de segmentado partida')
    bg0 = pg.evaluate("getComputedStyle(document.querySelector('.btn-p')||document.body).backgroundColor")
    pg.evaluate("V.view='projects';render()"); pg.hover('[data-new]'); pg.wait_for_timeout(300)
    check(pg.evaluate("getComputedStyle(document.querySelector('[data-new]')).backgroundColor") == 'rgb(27, 83, 87)', 'hover de primario no es #1B5357')
    # --- origin of a seat: the dropdown changes the fill and the investment
    pg.evaluate("seedData();V.modal=null;V.view='project';V.id='p4';render()")
    inv0 = pg.evaluate("cost(P()).inv")
    ri = pg.evaluate("P().roles.findIndex(r=>r.fill[0]&&r.fill[0].src==='mine')")
    pg.evaluate(f"openPerson(P(),{ri})"); pg.evaluate("V.draft.who='new'"); pg.click('[data-pfsave]'); pg.wait_for_timeout(100)
    check(pg.evaluate("cost(P()).inv") > inv0, 'switching a person to a new hire did not raise the new investment')
    # a manager sees only her projects; the other team's profiles have no name
    pg.evaluate("D.as='manager';V.view='projects';V.pf='all';render()")
    # one Responsable in the demo: she sees every project of hers, including the one waiting for Dirección
    check('Campaña de lanzamiento' in pg.evaluate("[...document.querySelectorAll('.pcard h2')].map(e=>e.textContent).join()"), 'the single manager does not see all her projects')
    # --- review: Dirección asks for changes (comment required), the manager sees it, sends again, Dirección approves
    pg.evaluate("D.as='board';V.view='project';V.id='p2';render()")
    check(pg.query_selector('.pnl [data-approve]') and pg.query_selector('.pnl [data-askchg]') and pg.query_selector('.pnl [data-reject]'), 'review buttons')
    pg.click('[data-reject]'); pg.click('[data-reject]'); check(pg.query_selector('#rce') is not None and pg.evaluate("P().status") == 'pending', 'rejected without a comment')
    pg.fill('#rc', 'Ajusta el presupuesto de diseño.'); pg.click('[data-rcancel]'); pg.click('[data-askchg]'); pg.fill('#rc', 'Ajusta el presupuesto de diseño.'); pg.click('[data-askchg]'); pg.wait_for_timeout(80)
    check(pg.evaluate("P().status") == 'changes', 'changes not requested')
    pg.evaluate("D.me={name:'Emma Walker',role:'Responsable',team:'Producto digital'};D.as='manager';render()")
    check('Ajusta el presupuesto de diseño' in pg.inner_text('#app') and pg.query_selector('[data-send]') is not None, 'manager does not see the comment / cannot resend')
    check(pg.evaluate("myNotes().some(n=>n.p==='p2'&&/pide cambios/.test(n.t))"), 'no notification to the manager')
    pg.click('[data-send]'); pg.wait_for_selector('[data-resendok]'); pg.fill('#rsr','He ajustado el diseño.'); pg.click('[data-resendok]'); pg.wait_for_timeout(60); check(pg.evaluate("P().status==='pending' && P().reply==='He ajustado el diseño.'"), 'not sent again')
    check(pg.query_selector('[data-withdraw]') is not None, 'no Retirar on a pending proposal')
    pg.evaluate("D.me={name:'Emma Walker',role:'Responsable',team:'Producto digital'};D.as='board';render()")
    # Dirección covers the hire of the designer with a free person of another team, then approves
    if pg.query_selector('.sugg [data-asgq]'):
        pg.evaluate("document.querySelector('.sugg [data-asgq]').click()"); pg.wait_for_timeout(150)
    pg.click('.pnl [data-approve]'); pg.wait_for_timeout(80)
    check(pg.evaluate("P().status") == 'active', 'approval did not activate the project')
    hb = pg.query_selector('[data-hired]'); check(hb is not None, 'no «Marcar incorporada» on a seat being hired')
    if hb:
        hb.click(); pg.wait_for_selector('#hn'); pg.click('[data-hiredok]'); check('Escribe el nombre' in pg.inner_text('#modal'), 'hired name required')
        pg.fill('#hn', 'Rosa Prieto'); pg.click('[data-hiredok]'); pg.wait_for_timeout(80)
        check(pg.evaluate("D.people.some(x=>x.name==='Rosa Prieto'&&x.team==='Emma Walker')"), 'hired person not created in the register')
    # running project: areas fold into one line and open on click
    af = pg.query_selector('[data-afold]'); check(af is not None, 'running project areas do not fold')
    if af:
        af.click(); pg.wait_for_timeout(60); check(pg.query_selector('.afold.open .prow') is not None, 'folded area does not open')
    pg.evaluate("D.as='manager';render()")
    pg.evaluate("V.view='licenses';render()")
    check(pg.evaluate("[...document.querySelectorAll('.lnk')].every(l=>!l.matches('.prem'))"), 'ok')
    # reset
    pg.evaluate("document.querySelector('[data-demoreset]').click()"); pg.wait_for_timeout(200)
    check(pg.evaluate("D.projects.length") == 10 and pg.evaluate("D.requests.length") == 0, 'reset did not restore seed')
    # Añadir licencia: picking a tool from the dropdown keeps the rest of the form (seats, Añadir)
    pg.evaluate("D.as='board';go('licenses')"); pg.wait_for_timeout(120)
    pg.get_by_text('Registrar licencia').first.click(); pg.wait_for_timeout(120)
    pg.click('#licopt'); pg.wait_for_timeout(80); pg.locator('.ddl [role=option]').nth(3).click(); pg.wait_for_timeout(100)
    check(pg.query_selector('.sheet [data-savelic]') is not None and (pg.query_selector('.sheet .stp, .sheet [data-dseats]') is not None or pg.evaluate("(()=>{const o=opt(V.draft.opt);return !!o&&(o.unit==='plan'||!!o.once)})()")), 'licence form lost its fields after picking a tool')
    pg.keyboard.press('Escape'); pg.evaluate("V.modal=null;render()")
    check(not errs, f'errors {errs}')
    b.close()
if fails: print('\n'.join(fails)); sys.exit(1)
print('ui OK')
