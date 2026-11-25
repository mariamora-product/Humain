"""Interaction-state audit: contact sheets (rest/hover/focus/active/disabled) per component type, metrics, page screenshots.
Usage: python3 tests/states.py   -> tests/output/sheet_*.png, tests/output/findings.txt, tests/output/pages/*.png"""
import os, sys, math, re, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
URL = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index.html') + '?lang=es'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output'); PAGES = OUT + '/pages'
os.makedirs(PAGES, exist_ok=True)
for f in os.listdir(OUT):
    if f.startswith('sheet_') or f == 'findings.txt': os.remove(os.path.join(OUT, f))
findings = []
def F(m):
    if m not in findings: findings.append(m)

SEL = "button,a[href],[role=button],input,select,textarea,label:has(input)"
JS_COLLECT = """(sel)=>{
 const out=[];let n=0;
 document.querySelectorAll(sel).forEach(el=>{
  const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return;
  const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') return;
  if(el.closest('[hidden],.skip,.noprint')) return;
  if(el.tagName==='LABEL'&&el.querySelector('button')) return;
  const cls=[...el.classList].filter(c=>!['on','new','open','active','closed','sm','full','wide'].includes(c)).slice(0,2).join('.');
  const da=[...el.attributes].map(a=>a.name).find(a=>a.startsWith('data-')&&a!=='data-aud');const key=el.tagName.toLowerCase()+(el.type&&el.tagName==='INPUT'?'['+el.type+']':'')+(cls?'.'+cls:'')+(el.getAttribute('role')?'['+el.getAttribute('role')+']':'')+(da?'{'+da.replace('data-','')+'}':'');
  el.setAttribute('data-aud',n);out.push({n:n,key:key,sel:el.getAttribute('aria-checked')==='true'||el.getAttribute('aria-pressed')==='true'||el.getAttribute('aria-selected')==='true',dis:el.disabled===true,text:(el.textContent||'').trim().slice(0,30)});n++;});
 return out;}"""
JS_SNAP = """(n)=>{
 const el=document.querySelector('[data-aud="'+n+'"]'); if(!el) return null;
 const eff=(e)=>{let layers=[];let x=e;while(x&&x.nodeType===1){const c=getComputedStyle(x).backgroundColor;const m=c.match(/[\\d.]+/g);if(m){const a=m.length>3?+m[3]:1;if(a>0)layers.push([+m[0],+m[1],+m[2],a]);if(a>=1)break;}x=x.parentElement;}
  let base=[255,255,255];for(let i=layers.length-1;i>=0;i--){const l=layers[i];base=[0,1,2].map(k=>l[k]*l[3]+base[k]*(1-l[3]));}return base;};
 const cs=getComputedStyle(el);const r=el.getBoundingClientRect();
 return {bg:eff(el),color:cs.color,bd:cs.borderTopColor+cs.borderTopWidth,sh:cs.boxShadow,ol:cs.outlineStyle+cs.outlineWidth+cs.outlineColor,tf:cs.transform,td:cs.textDecorationLine,
  tr:cs.transitionDuration,op:cs.opacity,rect:[r.x,r.y,r.width,r.height],cur:cs.cursor,
  iconc:[...el.querySelectorAll('svg')].map(s=>getComputedStyle(s).color+getComputedStyle(s).fill).join('|')};}"""
JS_METRICS = """(n)=>{
 const el=document.querySelector('[data-aud="'+n+'"]'); if(!el) return null;
 const r=el.getBoundingClientRect();const res={w:r.width,h:r.height,wrap:false,align:null,ovf:false};
 const flag=el.matches('.btn,.btn-s,.btn-p,.chip,.ichip,.seg button,.pill,.tag,.lnk,.cd,.stp button,.rdel,.dtag,.cuse');
 if(flag){const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let t;let wr=false;
  while(t=tw.nextNode()){if(!t.textContent.trim())continue;const g=document.createRange();g.selectNodeContents(t);const tops=new Set();[...g.getClientRects()].forEach(q=>{if(q.width>0)tops.add(Math.round(q.top/5))});if(tops.size>1)wr=true;}
  res.wrap=wr;}
 if(el.matches('.seg button')){const s=el.parentElement;res.ovf=s.scrollWidth>s.clientWidth+1;}
 const p=el.parentElement;if(p){const ps=getComputedStyle(p);
  if(ps.display.includes('flex')&&ps.flexDirection.startsWith('row')&&ps.flexWrap==='nowrap'&&p.children.length>1&&!el.matches('input[type=checkbox],input[type=radio]')){
   const pr=p.getBoundingClientRect();const top=pr.top+parseFloat(ps.paddingTop)+parseFloat(ps.borderTopWidth),bot=pr.bottom-parseFloat(ps.paddingBottom)-parseFloat(ps.borderBottomWidth);
   if(r.height<bot-top-2){res.align=((r.top+r.bottom)/2)-((top+bot)/2);}}}
 res.sw=document.documentElement.scrollWidth;
 return res;}"""

def lab(rgb):
    def f(c):
        c = c / 255
        return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
    r, g, b = [f(c) for c in rgb]
    y = .2126 * r + .7152 * g + .0722 * b
    return 116 * (y ** (1 / 3) if y > .008856 else 7.787 * y + 16 / 116) - 16

crops = {}   # key -> dict(state->Image, scen)
order = []
def font(sz=11):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
CW, CH = 240, 80
def crop(pg, rect):
    x, y, w, h = rect
    vw, vh = pg.viewport_size['width'], pg.viewport_size['height']
    px = 10
    x0, y0 = max(0, x - px), max(0, y - px)
    x1, y1 = min(vw, x + w + px), min(vh, y + h + px)
    if x1 - x0 < 4 or y1 - y0 < 4: return None
    x1 = min(x1, x0 + 360); y1 = min(y1, y0 + 120)
    import io
    im = Image.open(io.BytesIO(pg.screenshot(clip={'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0}))).convert('RGB')
    sc = min(1, CW / im.width, CH / im.height)
    if sc < 1: im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.LANCZOS)
    return im

seen = set(); touch = {}
def audit(pg, scen, vw, states):
    els = pg.evaluate(JS_COLLECT, SEL)
    for e in sorted(els, key=lambda e: e['sel']):
        n, key = e['n'], e['key']
        m = pg.evaluate(JS_METRICS, n)
        if not m: continue
        if m['wrap']: F(f'[{scen}@{vw}] {key} "{e["text"]}": texto partido en varias líneas')
        if m['ovf']: F(f'[{scen}@{vw}] {key}: segmentado desborda su contenedor')
        if m['align'] is not None and abs(m['align']) > 1.5 and not key.startswith('input[checkbox') :
            F(f'[{scen}@{vw}] {key} "{e["text"]}": no centrado verticalmente en su fila ({m["align"]:+.1f}px)')
        if vw < 600:
            if (m['h'] < 43.5 or m['w'] < 43.5) and not key.startswith(('input[checkbox', 'input[radio')) and not e['dis']:
                touch.setdefault(key, []).append(f'{scen} {m["w"]:.0f}x{m["h"]:.0f}')
            if m['sw'] > vw: F(f'[{scen}@{vw}] desbordamiento horizontal scrollWidth={m["sw"]}')
        if not states: continue
        sk = key + (':disabled' if e['dis'] else '')
        if sk in seen: continue
        seen.add(sk)
        try:
            pg.evaluate("(n)=>document.querySelector('[data-aud=\"'+n+'\"]').scrollIntoView({block:'center'})", n)
        except Exception: continue
        pg.mouse.move(2, 2); pg.wait_for_timeout(120)
        s0 = pg.evaluate(JS_SNAP, n)
        if not s0: continue
        rect = s0['rect']
        st = {}
        st['rest'] = crop(pg, rect)
        if e['dis']:
            if s0['cur'] not in ('default', 'not-allowed'): F(f'[{scen}] {sk}: deshabilitado sin cursor default ({s0["cur"]})')
            pg.mouse.move(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2); pg.wait_for_timeout(260)
            s1 = pg.evaluate(JS_SNAP, n)
            if s1 and (s1['bg'] != s0['bg'] or s1['color'] != s0['color']): F(f'[{scen}] {sk}: tiene hover estando deshabilitado')
            st['disabled'] = crop(pg, rect)
        else:
            pg.mouse.move(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2); pg.wait_for_timeout(300)
            s1 = pg.evaluate(JS_SNAP, n)
            st['hover'] = crop(pg, rect)
            if s1:
                dl = abs(lab(s1['bg']) - lab(s0['bg']))
                changed_fill = dl > .4 or s1['color'] != s0['color'] or s1['td'] != s0['td'] or s1['op'] != s0['op'] or s1['iconc'] != s0['iconc']
                outline_only = (not changed_fill) and (s1['bd'] != s0['bd'] or s1['sh'] != s0['sh'])
                if outline_only: F(f'[{scen}] {sk}: hover solo con borde/sombra (sin relleno)')
                if s1['ol'] != s0['ol'] and 'none' not in s1['ol']: F(f'[{scen}] {sk}: hover con outline')
                if s1['sh'] != s0['sh'] and s1['sh'] != 'none' and 'inset' in s1['sh']: F(f'[{scen}] {sk}: hover con anillo inset')
                btnfam = key.startswith('button') and re.search(r'\.(btn|chip|ichip|ib|cd)\b|\[radio\]|\[tab\]', key)
                if btnfam:
                    F(f'[ΔL] {sk}: ΔL hover = {dl:.1f}  ({"OK" if dl >= 6 else "BAJO <6"})')
                if not changed_fill and not outline_only and s1['tf'] == s0['tf']:
                    F(f'[{scen}] {sk}: el hover no cambia nada visible')
                if s1['tr'] in ('0s', '') and key.startswith('button'): F(f'[{scen}] {sk}: sin transición')
            # focus-visible (keyboard)
            pg.mouse.move(2, 2); pg.keyboard.press('Shift'); pg.wait_for_timeout(60)
            pg.evaluate("(n)=>document.querySelector('[data-aud=\"'+n+'\"]').focus({focusVisible:true})", n); pg.wait_for_timeout(260)
            st['focus'] = crop(pg, pg.evaluate(JS_SNAP, n)['rect'])
            pg.evaluate("document.activeElement&&document.activeElement.blur()")
            # active (mouse down)
            pg.mouse.move(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2)
            pg.mouse.down(); pg.wait_for_timeout(200)
            st['active'] = crop(pg, pg.evaluate(JS_SNAP, n)['rect'])
            pg.mouse.move(2, 2); pg.mouse.up(); pg.wait_for_timeout(80)
        crops[sk] = (scen, st); order.append(sk)

def new_page(b, w, h):
    ctx = b.new_context(viewport={'width': w, 'height': h})
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: F(f'JS error: {e}'))
    pg.goto(URL, wait_until='load'); pg.wait_for_function("typeof D!=='undefined' && D && typeof seedData==='function'")
    pg.evaluate("seedData(); D.tourHidden=false; render()")
    return ctx, pg

def reset(pg, view):
    pg.keyboard.press('Escape')
    pg.evaluate(f"V.modal=null;V.menu=false;V.nav=false;V.ropen=null;V.radv={{}};V.view='{view}';render()")
    pg.wait_for_timeout(120)

def proj(st): return f"D.projects.find(p=>p.status==='{st}'&&!p.archived).id"
def to_project(pg, st):
    pg.evaluate(f"V.modal=null;V.menu=false;V.view='project';V.id={proj(st)};V.ropen=null;V.radv={{}};render()"); pg.wait_for_timeout(100)

def scenarios():
    S = []
    S.append(('home', lambda pg: reset(pg, 'home')))
    S.append(('notificaciones', lambda pg: reset(pg, 'notes')))
    S.append(('proyectos', lambda pg: reset(pg, 'projects')))
    def pa(pg):
        to_project(pg, 'active'); pg.click('[data-ropen]'); pg.wait_for_timeout(150)
    S.append(('proyecto_activo_puesto', pa))
    def pa2(pg):
        pa(pg)
        if pg.query_selector('[data-radv]'): pg.click('[data-radv]'); pg.wait_for_timeout(150)
    S.append(('proyecto_activo_avanzado', pa2))
    def pd(pg):
        to_project(pg, 'draft'); pg.click('[data-ropen]'); pg.wait_for_timeout(150)
        if pg.query_selector('[data-radv]'): pg.click('[data-radv]'); pg.wait_for_timeout(150)
    S.append(('proyecto_borrador_puesto', pd))
    S.append(('proyecto_borrador', lambda pg: to_project(pg, 'draft')))
    S.append(('personas', lambda pg: reset(pg, 'people')))
    def rm(pg):
        reset(pg, 'people'); pg.click('[data-rmenu]'); pg.wait_for_timeout(150)
    S.append(('personas_menu_fila', rm))
    def unc(pg):
        rm(pg); pg.click('[data-uncover]'); pg.wait_for_timeout(150)
    S.append(('modal_quitar_del_puesto', unc))
    S.append(('licencias', lambda pg: reset(pg, 'licenses')))
    S.append(('ajustes', lambda pg: reset(pg, 'settings')))
    def intg(pg):
        reset(pg, 'settings'); pg.evaluate("D.intg=D.intg||{};D.intg['Google Workspace']=true;render()"); pg.click('[data-imenu]'); pg.wait_for_timeout(150)
    S.append(('ajustes_integraciones_menu', intg))
    S.append(('planes', lambda pg: reset(pg, 'plans')))
    def new(pg):
        reset(pg, 'projects'); pg.evaluate("V.draft={name:'',type:null,size:'m',months:6,budget:0,ent:'es'};V.modal='new';render()"); pg.wait_for_timeout(150)
    S.append(('modal_nuevo_proyecto', new))
    def newf(pg):
        new(pg); pg.focus('#pn'); pg.keyboard.type('Ap'); pg.wait_for_timeout(250)
    S.append(('modal_nuevo_proyecto_campo_foco', newf))
    def edit(pg):
        to_project(pg, 'draft'); pg.click('[data-edit]'); pg.wait_for_timeout(150)
    S.append(('modal_editar_proyecto', edit))
    def cmp_(pg):
        to_project(pg, 'draft'); pg.click('[data-cmp]'); pg.wait_for_timeout(200)
    S.append(('modal_comparador', cmp_))
    def conf(pg):
        reset(pg, 'projects'); pg.evaluate(f"V.draft={proj('draft')};V.modal='del';render()"); pg.wait_for_timeout(150)
    S.append(('modal_confirmacion', conf))
    def exp(pg):
        to_project(pg, 'draft'); pg.click('[data-expo]'); pg.wait_for_timeout(200)
    S.append(('exportar', exp))
    def con(pg):
        reset(pg, 'plans'); pg.click('[data-contact]'); pg.wait_for_timeout(150)
    S.append(('modal_contacto', con))
    def cov(pg):
        reset(pg, 'people'); pg.click('[data-cover]'); pg.wait_for_timeout(150)
    S.append(('modal_cubrir_persona', cov))
    def src(pg):
        to_project(pg, 'draft'); pg.click('[data-ropen]'); pg.wait_for_timeout(100)
        if pg.query_selector('[data-src]'): pg.click('[data-src]'); pg.wait_for_timeout(150)
    S.append(('modal_fuente_coste', src))
    def role(pg):
        to_project(pg, 'draft'); pg.click('[data-addrole]'); pg.wait_for_timeout(150)
    S.append(('modal_selector_puestos', role))
    def acct(pg):
        reset(pg, 'home'); pg.click('#side .accbtn' if pg.viewport_size['width'] > 900 else '#top .av'); pg.wait_for_timeout(150)
    S.append(('menu_cuenta', acct))
    def pm(pg):
        reset(pg, 'projects'); pg.click('[data-pmenu]'); pg.wait_for_timeout(150)
    S.append(('menu_proyecto', pm))
    def go(pg):
        to_project(pg, 'draft'); pg.click('[data-hire]'); pg.wait_for_timeout(150)
    S.append(('modal_poner_en_marcha', go))
    return S

def sheets():
    f = font(11); fb = font(10)
    LW = 250; COLS = ['rest', 'hover', 'focus', 'active', 'disabled']
    RH = CH + 22
    rows = []
    for k in order:
        scen, st = crops[k]
        im = Image.new('RGB', (LW + len(COLS) * (CW + 4), RH), (255, 255, 255))
        d = ImageDraw.Draw(im)
        d.text((6, 6), k[:40], fill=(0, 0, 0), font=f); d.text((6, 22), scen, fill=(110, 110, 110), font=fb)
        for i, c in enumerate(COLS):
            x = LW + i * (CW + 4)
            d.rectangle([x, 0, x + CW + 2, RH - 1], outline=(225, 225, 225))
            d.text((x + 3, 1), c, fill=(150, 20, 20), font=fb)
            if st.get(c) is not None: im.paste(st[c], (x + 3, 14))
        rows.append(im)
    per = 1600 // RH; n = 0
    for i in range(0, len(rows), per):
        chunk = rows[i:i + per]
        sh = Image.new('RGB', (chunk[0].width, RH * len(chunk)), (255, 255, 255))
        for j, r in enumerate(chunk): sh.paste(r, (0, j * RH))
        sh.save(f'{OUT}/sheet_{n + 1:02d}.png'); n += 1
    return n

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
    for vw, vh in ((1280, 800), (390, 844)):
        ctx, pg = new_page(b, vw, vh)
        for name, fn in scenarios():
            try:
                fn(pg)
            except Exception as ex:
                F(f'[{name}@{vw}] el escenario falló: {str(ex)[:90]}'); continue
            pg.mouse.move(2, 2)
            pg.screenshot(path=f'{PAGES}/{name}_{vw}.png', full_page=(vw < 600 or name.startswith(('home', 'proyecto', 'personas', 'licencias', 'ajustes', 'planes', 'notif'))))
            audit(pg, name, vw, states=(vw == 1280))
        ctx.close()
    b.close()
for k, v in sorted(touch.items()):
    F(f'[táctil 390] {k}: objetivo <44px en {len(v)} sitio(s), p. ej. {v[0]}')
n = sheets()
dl = sorted(x for x in findings if x.startswith('[ΔL]')); rest = [x for x in findings if not x.startswith('[ΔL]')]
open(OUT + '/findings.txt', 'w').write('\n'.join(rest + [''] + dl) + '\n')
print(f'{len(rest)} hallazgos, {len(dl)} medidas ΔL, {n} hojas')
