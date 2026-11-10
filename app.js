/* app.js – Rupali Fashion Studio (cloud version: Supabase login + shared database + photo storage) */
'use strict';

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN');
const iso = d => { const x = new Date(d); return new Date(x - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const today = () => iso(new Date());
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const total = w => (+w.basic + +w.extra) * +w.qty;           // Total = (Basic + Extra) x Quantity
const toast = m => { const t = $('#toast'); t.textContent = T(m); t.className = 'show'; setTimeout(() => t.className = '', 3000); };
const showImg = u => { $('#big').src = u; $('#ov').hidden = false; };
const urlOf = b => URL.createObjectURL(b);
const errMsg = e => (e && (e.message || e.error_description)) || String(e);
function download(name, mime, text) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; a.click();
}
async function shrink(file) {                                    // resize to 1280px + JPEG compress before upload
  try {
    const u = URL.createObjectURL(file);
    const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
    const k = Math.min(1, 1280 / Math.max(im.naturalWidth, im.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
    return (await new Promise(r => c.toBlob(r, 'image/jpeg', .75))) || file;
  } catch (e) { return file; }
}

/* ---------- theme ---------- */
const CFG = JSON.parse(localStorage.getItem('rfs_cfg') || '{"mode":"auto","accent":"#6b2d5c"}');
function applyTheme() {
  const d = document.documentElement; d.style.setProperty('--pri', CFG.accent);
  CFG.mode === 'auto' ? d.removeAttribute('data-theme') : d.dataset.theme = CFG.mode;
  localStorage.setItem('rfs_cfg', JSON.stringify(CFG));
}

/* ---------- language: English templates are translated to Marathi on screen ---------- */
if (!CFG.lang) CFG.lang = 'mr';
const MR = {
 'Measure':'मापे','Calculator':'कॅल्क्युलेटर','Add work':'काम जोडा','My work':'माझे काम','Good morning':'शुभ प्रभात','Good afternoon':'शुभ दुपार','Good evening':'शुभ संध्याकाळ',
 '📏 Measurements':'📏 मापे','🧮 Calculator':'🧮 कॅल्क्युलेटर','+ New measurement':'+ नवे माप','Search by name or phone…':'नाव किंवा फोनने शोधा…','New measurement':'नवे माप','Edit measurement':'माप बदला',
 'Garment':'कपडा प्रकार','Unit':'एकक','inch':'इंच','cm':'सेमी','Blouse':'ब्लाउज','Dress':'ड्रेस','Pant':'पँट','Other':'इतर','Length':'लांबी','Chest':'छाती','Waist':'कंबर','Shoulder':'खांदा',
 'Sleeve length':'बाहीची लांबी','Sleeve round':'बाहीचा घेर','Armhole':'आर्महोल','Front neck':'पुढचा गळा','Back neck':'मागचा गळा','Bust':'बस्ट','Hip':'हिप','Neck':'गळा','Thigh':'मांडी','Knee':'गुडघा',
 'Bottom':'तळ','Crotch':'क्रॉच','Width':'रुंदी','Round':'घेर','Height':'उंची','Use for work':'कामासाठी वापरा','No measurements yet.':'अजून मापे नाहीत.','Inch ↔ cm converter':'इंच ↔ सेमी',
 'Inches':'इंच','Centimetres':'सेंटिमीटर','Bill calculator':'बिल कॅल्क्युलेटर','Rate':'दर','Extra':'अतिरिक्त','Qty':'संख्या','(Rate + Extra) × Qty':'(दर + अतिरिक्त) × संख्या',

 'Top employees (this month)':'सर्वाधिक काम करणारे (या महिन्यात)','All employees →':'सर्व कर्मचारी →','No approved work this month.':'या महिन्यात मंजूर काम नाही.','Employees – work & amount':'कर्मचारी – काम आणि रक्कम','Search employee (name, ID, phone)…':'कर्मचारी शोधा (नाव, ID, फोन)…','Month':'महिना','Sort':'क्रम','Amount (high to low)':'रक्कम (जास्त ते कमी)','Pieces (high to low)':'नग (जास्त ते कमी)','Name (A–Z)':'नाव (अ ते ज्ञ)','Include employees with no work':'काम न केलेले कर्मचारीही दाखवा','This month':'या महिन्यात','All time':'सर्व काळ','Employees':'कर्मचारी','Show more':'आणखी दाखवा',
 'All employees':'सर्व कर्मचारी','Custom dates':'स्वतःची तारीख','From':'पासून','To':'पर्यंत','Pending only':'फक्त प्रलंबित','Employee summary':'कर्मचारी सारांश','Filter':'फिल्टर','Clear filters':'फिल्टर काढा','Search customer, bill, cloth, employee…':'ग्राहक, बिल, कपडा, कर्मचारी शोधा…',
 'More details (optional)':'अधिक माहिती (ऐच्छिक)','Customer (optional)':'ग्राहक (ऐच्छिक)',
 'Home':'मुख्य','Work':'काम','Prices':'किमती','Team':'कर्मचारी','Reports':'अहवाल','More':'अधिक','↻ Refresh':'↻ ताजे करा','admin':'अ‍ॅडमिन','employee':'कर्मचारी',
 "Today's work":'आजचे काम','Completed':'पूर्ण','Pending':'प्रलंबित','Pending approval':'मंजुरी बाकी','Due today':'आज द्यायचे','Overdue':'उशीर झालेले','Monthly earnings':'महिन्याची कमाई','Pieces this month':'या महिन्याचे नग',
 '+ Daily work':'+ रोजचे काम','Price list':'किंमत यादी','Employee work (this month)':'कर्मचारी काम (या महिन्यात)','Recent registrations':'अलीकडील नोंदी','Last 7 days (approved)':'शेवटचे 7 दिवस (मंजूर)',
 'Due & overdue':'देय आणि उशीर','Waiting for approval':'मंजुरीची वाट पाहणारे','Approve all':'सर्व मंजूर करा','Due':'देय','Delivered':'दिले','Mark delivered':'दिले म्हणून नोंदवा','No records yet.':'अजून नोंदी नाहीत.',
 'Nothing due. Good job!':'काही बाकी नाही. छान!','Search bill, customer, cloth, phone…':'बिल, ग्राहक, कपडा, फोन शोधा…','+ Add':'+ जोडा','Edit':'बदला','Delete':'काढा','Approve':'मंजूर','Reject':'नाकारा',
 'No work records.':'काम नोंदी नाहीत.','Approved':'मंजूर','Rejected':'नाकारले','💬 WhatsApp':'💬 WhatsApp','New daily work':'नवे रोजचे काम','Edit daily work':'काम बदला',
 'Price item (auto-fills prices)':'किंमत निवडा (आपोआप भरते)','Manual entry':'हाताने भरा','Select…':'निवडा…','Date':'तारीख','Bill no.':'बिल क्र.','Customer':'ग्राहक','Customer phone':'ग्राहक फोन',
 'Delivery date':'देय तारीख','Clothing':'कपडा','Design':'डिझाइन','Colour':'रंग','Quantity':'संख्या','Basic price':'मूळ किंमत','Extra design':'अतिरिक्त डिझाइन','(Basic + Extra) × Qty':'(मूळ + अतिरिक्त) × संख्या',
 'Notes':'टिपा','Photos':'फोटो','📷 Camera':'📷 कॅमेरा','🖼️ Choose images':'🖼️ फोटो निवडा','No photos added':'फोटो नाहीत','Save':'सेव्ह','Cancel':'रद्द','Saving…':'सेव्ह होत आहे…',
 '+ Add price':'+ किंमत जोडा','Search prices…':'किमती शोधा…','No prices yet.':'अजून किमती नाहीत.','New price':'नवी किंमत','Edit price':'किंमत बदला','Clothing type':'कपड्याचा प्रकार','Design name':'डिझाइनचे नाव',
 'Basic price ₹':'मूळ किंमत ₹','Extra design charge ₹':'अतिरिक्त डिझाइन शुल्क ₹','+ Add employee':'+ कर्मचारी जोडा','Search employee (name, ID, phone, address)…':'कर्मचारी शोधा (नाव, ID, फोन, पत्ता)…',
 'Active':'सुरू','Off':'बंद','Deactivate':'बंद करा','Activate':'सुरू करा','View':'पहा','New employee':'नवा कर्मचारी','Edit employee':'कर्मचारी बदला','No employees found.':'कर्मचारी सापडले नाहीत.',
 'Login ID (letters/numbers, e.g. emp01)':'लॉगिन ID (अक्षरे/आकडे, उदा. emp01)','Name':'नाव','Role':'भूमिका','Phone':'फोन','Address':'पत्ता','Joined':'रुजू तारीख','Pay % of approved work value':'मंजूर कामाच्या किमतीचा पगार %',
 'New password (leave blank to keep)':'नवीन पासवर्ड (तसाच ठेवायचा तर रिकामे सोडा)','Password (6+ characters)':'पासवर्ड (6+ अक्षरे)','← Back':'← मागे','📞 Call':'📞 कॉल','Work history':'कामाचा इतिहास',
 'Payable this month':'या महिन्याची देय रक्कम','Total approved (all time)':'एकूण मंजूर (सर्व काळ)','Pieces (all time)':'एकूण नग','Login ID':'लॉगिन ID',
 'Period':'कालावधी','Group by':'गट','Status':'स्थिती','Today':'आज','This week':'या आठवड्यात','This month':'या महिन्यात','All time':'सर्व काळ','None (list)':'काही नाही (यादी)','Employee':'कर्मचारी',
 'Approved only':'फक्त मंजूर','All except rejected':'नाकारलेले वगळून सर्व','🖨️ Print':'🖨️ प्रिंट','Total amount':'एकूण रक्कम','Rupali Fashion Studio – Report':'रुपाली फॅशन स्टुडिओ – अहवाल',
 'Bill':'बिल','Qty':'संख्या','Total':'एकूण','Entries':'नोंदी','Pieces':'नग','Payable':'देय','No records':'नोंदी नाहीत','Appearance':'दिसणे','Mode':'मोड','Theme colour':'थीम रंग','Language':'भाषा',
 'My account':'माझे खाते','My profile':'माझी माहिती','Change my password':'माझा पासवर्ड बदला','Backup':'बॅकअप','Download data backup':'डेटा बॅकअप डाउनलोड करा','Edit history':'बदलांचा इतिहास',
 'Danger zone':'धोक्याची जागा','⚠️ Delete all work records and photos':'⚠️ सर्व काम नोंदी आणि फोटो काढा','Log out':'लॉग आउट','Loading…':'लोड होत आहे…','auto':'ऑटो','light':'उजळ','dark':'गडद',
 '👤 Employee':'👤 कर्मचारी','👑 Admin':'👑 अ‍ॅडमिन','Employee login: use the ID and password given by the admin':'कर्मचारी लॉगिन: अ‍ॅडमिनने दिलेला ID आणि पासवर्ड वापरा','Admin login':'अ‍ॅडमिन लॉगिन',
 'Admin ID':'अ‍ॅडमिन ID','Employee ID':'कर्मचारी ID','Password':'पासवर्ड','Log in':'लॉगिन','Report':'अहवाल','Saved':'सेव्ह झाले','Updated':'अपडेट झाले','Backup downloaded':'बॅकअप डाउनलोड झाला',
 'Enter ID and password':'ID आणि पासवर्ड टाका','ID or password is wrong':'ID किंवा पासवर्ड चुकीचा आहे','Enter a name':'नाव टाका','Enter clothing type':'कपड्याचा प्रकार टाका','Password changed':'पासवर्ड बदलला',
 'This is an employee ID. Use the Employee tab.':'हा कर्मचारी ID आहे. Employee टॅब वापरा.','This is an admin ID. Use the Admin tab.':'हा अ‍ॅडमिन ID आहे. Admin टॅब वापरा.','Keep at least one active admin':'किमान एक अ‍ॅडमिन सुरू ठेवा'
};
const T = s => (CFG.lang === 'mr' && MR[s]) || s;
function tr(n) {
  if (n.nodeType === 3) { const k = n.nodeValue.trim(); if (MR[k]) n.nodeValue = n.nodeValue.replace(k, MR[k]); return; }
  if (n.nodeType !== 1) return;
  if (n.placeholder && MR[n.placeholder]) n.placeholder = MR[n.placeholder];
  n.childNodes.forEach(tr);
}
new MutationObserver(ms => { if (CFG.lang === 'mr') ms.forEach(m => m.addedNodes.forEach(tr)); }).observe(document.body, { childList: true, subtree: true });
const addD = n => iso(Date.now() + n * 864e5);
const waUrl = (phone, msg) => { let n = String(phone || '').replace(/\D/g, ''); if (n.length === 10) n = '91' + n; return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`; };

/* ---------- state ---------- */
const S = { user: null, hasAdmin: true, tab: 'home', works: [], prices: [], emps: [], form: null, pf: null, ef: null, ev: null, meas: [], mt: 'list', mf: null, ms: '', cx: { e: '', r: '' }, es: { month: new Date().toISOString().slice(0, 7), q: '', sort: 'amount', n: 30, zero: false }, q: '',
            rep: { range: 'month', by: 'none', st: 'approved', emp: 'all', q: '', from: '', to: '' } };
const urls = {};
const isA = () => S.user.role === 'admin';
const mine = () => isA() ? S.works : S.works.filter(w => w.emp === S.user.id);
const ename = id => (S.emps.find(e => e.id === id) || { name: '(deleted)' }).name;
const canEdit = w => isA() || (w.emp === S.user.id && w.status === 'Pending');
async function fetchAll(mk) {                                   // Supabase gives max 1000 rows per request, so read in pages
  let all = [], from = 0;
  for (;;) { const d = await ok(mk().range(from, from + 999)); all = all.concat(d); if (d.length < 1000) return all; from += 1000; }
}
async function load() {
  const [w, p, e] = await Promise.all([
    fetchAll(() => sb.from('works').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }).order('id')),
    fetchAll(() => sb.from('prices').select('*').order('cloth').order('id')), fetchAll(() => sb.from('profiles').select('*').order('created_at').order('id'))]);
  S.works = w; S.prices = p; S.emps = e;
  try { S.meas = await fetchAll(() => sb.from('measurements').select('*').order('created_at', { ascending: false }).order('id')); } catch (x) { S.meas = []; }
}
async function log(action, detail) { try { await sb.from('history').insert({ user_name: S.user.name, action, detail }); } catch (e) {} }
const go = t => { S.tab = t; S.form = S.pf = S.ef = S.ev = S.mf = null; render(); };
async function refresh() { try { await load(); render(); toast('Updated'); } catch (e) { toast('Offline? ' + errMsg(e)); } }

/* ---------- auth ---------- */
async function enter(id) {
  const p = await ok(sb.from('profiles').select('*').eq('id', id).single());
  if (!p.active) { await sb.auth.signOut(); throw new Error('This account is not active. Contact the admin.'); }
  S.user = p; await load();
}
function setupView() {
  $('#app').innerHTML = `<div class="hero"><div class="logo">R</div><h1>Rupali Fashion Studio</h1><p class="sub">First time: create the Admin account.</p>
  <div class="card"><label>Admin ID (letters/numbers, e.g. admin)</label><input id="i" autocapitalize="none"><label>Admin name</label><input id="n">
  <label>Password (6+ characters)</label><input id="p" type="password"><button class="btn" style="width:100%" onclick="doSetup()">Create admin</button></div></div>`;
}
async function doSetup() {
  const id = $('#i').value.trim(), name = $('#n').value.trim(), pw = $('#p').value;
  if (!/^[a-z0-9._-]{3,20}$/i.test(id) || !name || pw.length < 6) return toast('Valid ID (3-20 letters/numbers), name and 6+ character password');
  try {
    const { data, error } = await sb.auth.signUp({ email: mail(id), password: pw, options: { data: { name } } });
    if (error) throw error;
    if (!data.session) throw new Error('In Supabase turn OFF "Confirm email" (Authentication → Providers → Email)');
    await enter(data.user.id); S.hasAdmin = true; render();
  } catch (e) { toast(errMsg(e)); }
}
function loginView() {
  const m = S.lm || 'employee', on = k => m === k ? '' : ' sec';
  $('#app').innerHTML = `<div class="hero"><button class="btn sm sec" style="position:absolute;top:14px;right:14px" onclick="CFG.lang=CFG.lang==='mr'?'en':'mr';applyTheme();loginView()">मराठी / English</button><div class="logo">R</div><h1>Rupali Fashion Studio</h1>
  <div class="card"><div class="fx"><button class="btn${on('employee')}" onclick="S.lm='employee';loginView()">👤 Employee</button><button class="btn${on('admin')}" onclick="S.lm='admin';loginView()">👑 Admin</button></div>
  <p class="sub" style="margin:12px 0 0">${m === 'admin' ? 'Admin login' : 'Employee login: use the ID and password given by the admin'}</p>
  <label>${m === 'admin' ? 'Admin ID' : 'Employee ID'}</label><input id="i" autocapitalize="none" autocomplete="username"><label>Password</label>
  <input id="p" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"><button class="btn" style="width:100%" onclick="doLogin()">Log in</button></div></div>`;
}
async function doLogin() {
  const id = $('#i').value.trim(), pw = $('#p').value; if (!id || !pw) return toast('Enter ID and password');
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email: mail(id), password: pw });
    if (error) throw new Error('ID or password is wrong');
    await enter(data.user.id);
    if ((S.lm === 'admin') !== (S.user.role === 'admin')) {          // wrong login tab for this account
      await sb.auth.signOut(); S.user = null;
      throw new Error(S.lm === 'admin' ? 'This is an employee ID. Use the Employee tab.' : 'This is an admin ID. Use the Admin tab.');
    }
    S.tab = 'home'; render();
  } catch (e) { toast(errMsg(e)); }
}
async function logout() { await sb.auth.signOut(); S.user = null; S.works = S.prices = S.emps = []; S.hasAdmin = await ok(sb.rpc('has_admin')); render(); }

/* ---------- shell ---------- */
const TABS = {
  admin: [['home', '🏠', 'Home'], ['work', '🧵', 'Work'], ['measure', '📏', 'Measure'], ['team', '👥', 'Team'], ['more', '⚙️', 'More']],
  employee: [['home', '🏠', 'Home'], ['work', '🧵', 'Work'], ['measure', '📏', 'Measure'], ['reports', '📊', 'Reports'], ['more', '⚙️', 'More']]
};
const hello = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const bubbles = () => `<div class="bubbles noprint">${[['➕', 'Add work', 'newWork()', 'b1'], ['📏', 'Measure', "S.mt='list';go('measure')", 'b2'], ['🧮', 'Calculator', "S.mt='calc';go('measure')", 'b3'],
  ['🏷️', 'Prices', "go('prices')", 'b4'], ['📊', 'Reports', "go('reports')", 'b5'], isA() ? ['👥', 'Team', "go('team')", 'b6'] : ['🧵', 'My work', "go('work')", 'b6']]
  .map(b => `<button class="bub" onclick="${b[2]}"><i class="${b[3]}">${b[0]}</i><span>${b[1]}</span></button>`).join('')}</div>`;
function render() {
  if (!CONFIGURED) return void ($('#app').innerHTML = '<div class="hero"><div class="card"><h3>Setup needed</h3><p>Open <b>config.js</b> and paste your Supabase URL and anon key. Also check the internet connection.</p></div></div>');
  if (!S.user) return S.hasAdmin ? loginView() : setupView();
  $('#app').innerHTML = `<nav class="noprint"><b class="brand">Rupali Studio</b>${TABS[S.user.role].map(t =>
    `<button class="${S.tab === t[0] ? 'on' : ''}" onclick="go('${t[0]}')"><i>${t[1]}</i><span>${t[2]}</span></button>`).join('')}</nav>
    <main><header class="banner noprint"><div><small><span>${hello()}</span> 👋</small><h2>${esc(S.user.name)}</h2><span class="rolechip">${S.user.role}</span></div><button class="rf" onclick="refresh()" aria-label="Refresh">↻</button></header><div id="v">${V[S.tab]()}</div></main>`;
  if (S.form) { drawPhotos(); calc(); }
  if (S.tab === 'more') moreInfo();
  thumbs();
}
async function thumbs() {                                        // fetch private photo links for <img data-pid>
  await Promise.all([...document.querySelectorAll('img[data-pid]')].map(async i => {
    const id = i.dataset.pid;
    if (!urls[id]) { try { urls[id] = await PH.url(id); } catch (e) { return; } }
    i.src = urls[id]; i.onclick = () => showImg(urls[id]);
  }));
}

/* ---------- views ---------- */
const st = (v, l, c) => `<div class="stat ${c || ''}"><b>${v}</b><span>${l}</span></div>`;
const prof = e => [['Name', e.name], ['Login ID', e.login_id], ['Phone', e.phone], ['Address', e.address], ['Joined', e.joined], ['Notes', e.notes]].filter(r => r[1]).map(r => `<div class="row"><span class="sub">${r[0]}</span><span class="r">${esc(r[1])}</span></div>`).join('');
const row = x => `<div class="row"><div><b>${esc(x.cloth)}</b> × ${x.qty}<div class="sub">${x.date} · ${esc(x.customer)}${isA() ? ' · ' + esc(ename(x.emp)) : ''}</div></div>
  <div class="r"><b>${inr(total(x))}</b><br><span class="tag ${x.status}">${x.status}</span></div></div>`;
const V = {
  home() {
    const w = mine(), t = today(), m = t.slice(0, 7), ok_ = w.filter(x => x.status === 'Approved'), sum = a => a.reduce((s, x) => s + total(x), 0);
    const open = w.filter(x => !x.delivered && x.status !== 'Rejected' && x.due), over = open.filter(x => x.due < t),
      soon = open.filter(x => x.due >= t && x.due <= addD(7)).sort((a, b) => a.due.localeCompare(b.due)),
      pend = w.filter(x => x.status === 'Pending'), days = [...Array(7)].map((_, i) => addD(i - 6)),
      vals = days.map(d => sum(ok_.filter(x => x.date === d))), mx = Math.max(...vals, 1), mo = ok_.filter(x => x.date.startsWith(m));
    const dueRow = x => `<div class="row"><div><b>${esc(x.customer)}</b> · ${esc(x.cloth)} × ${x.qty}<div class="sub"><span class="tag ${x.due < t ? 'Rejected' : 'Pending'}"><span>Due</span> ${x.due}</span></div></div>
      <div class="fx2 noprint">${x.phone ? `<button class="btn sm sec" onclick="wa('${x.id}')">💬</button>` : ''}${isA() ? `<button class="btn sm ok" onclick="setDelivered('${x.id}')">Delivered</button>` : ''}</div></div>`;
    return `${bubbles()}<div class="grid">${st(w.filter(x => x.date === t).length, "Today's work")}${st(pend.length, 'Pending approval')}${st(open.filter(x => x.due === t).length, 'Due today')}
      ${st(over.length, 'Overdue', over.length ? 'red' : '')}${st(inr(sum(mo)), 'Monthly earnings')}${st(mo.reduce((s, x) => s + +x.qty, 0), 'Pieces this month')}</div>
      ${isA() && pend.length ? `<div class="card"><div class="row" style="padding-top:0"><h3>Waiting for approval</h3><button class="btn sm ok" onclick="approveAll()">Approve all</button></div>
        ${pend.slice(0, 5).map(x => `<div class="row"><div><b>${esc(x.cloth)}</b> × ${x.qty}<div class="sub">${esc(ename(x.emp))} · ${x.date} · ${esc(x.customer)}</div></div>
        <div class="fx2"><button class="btn sm ok" onclick="setStatus('${x.id}','Approved')">Approve</button><button class="btn sm bad" onclick="setStatus('${x.id}','Rejected')">Reject</button></div></div>`).join('')}</div>` : ''}
      <div class="card"><h3>Due &amp; overdue</h3>${[...over, ...soon].slice(0, 6).map(dueRow).join('') || '<p class="sub">Nothing due. Good job!</p>'}</div>
      <div class="card"><div class="row" style="padding-top:0"><h3>Last 7 days (approved)</h3><b class="big" style="font-size:22px">${inr(vals.reduce((a, b) => a + b, 0))}</b></div>
        <div class="bars">${days.map((d, i) => `<div class="bc"><div class="bb" style="height:${vals[i] / mx * 100}%"></div><span>${d.slice(8)}</span></div>`).join('')}</div></div>
      ${isA() ? `<div class="card"><div class="row" style="padding-top:0"><h3>Top employees (this month)</h3><button class="btn sm sec" onclick="S.es.month='${m}';go('reports')">All employees →</button></div>
        ${empRows({ month: m, q: '', sort: 'amount', zero: false }).slice(0, 5).map(erow).join('') || '<p class="sub">No approved work this month.</p>'}</div>` : ''}
      <div class="card"><h3>Recent registrations</h3>${w.slice(0, 5).map(row).join('') || '<p class="sub">No records yet.</p>'}</div>`;
  },
  measure() { return measureView(); },
  work() { return S.form ? formView() : `<div class="fx noprint"><input placeholder="Search bill, customer, cloth, phone…" value="${esc(S.q)}"
      oninput="S.q=this.value;$('#wl').innerHTML=wlist();thumbs()"><button class="btn" style="flex:0 0 auto" onclick="newWork()">+ Add</button></div><div id="wl">${wlist()}</div>`; },
  prices() {
    return `${isA() ? '<button class="btn noprint" onclick="S.pf={};render()">+ Add price</button>' : ''}${S.pf ? pform() : ''}
      <input placeholder="Search prices…" style="margin-top:12px" oninput="$('#pl').innerHTML=plist(this.value)"><div class="card" id="pl">${plist('')}</div>`;
  },
  team() {
    if (S.ev) return empDetail();
    return `<button class="btn" onclick="S.ef={};render()">+ Add employee</button>${S.ef ? eform() : ''}
      <input placeholder="Search employee (name, ID, phone, address)…" style="margin-top:12px" oninput="$('#el').innerHTML=elist(this.value)"><div id="el">${elist('')}</div>`;
  },
  reports() { return reportView(); },
  more() {
    return `<div class="card"><h3>My profile</h3>${prof(S.user)}</div>
      <div class="card"><h3>Language</h3><select onchange="CFG.lang=this.value;applyTheme();render()"><option value="mr"${CFG.lang === 'mr' ? ' selected' : ''}>मराठी</option><option value="en"${CFG.lang === 'en' ? ' selected' : ''}>English</option></select></div>
      <div class="card"><h3>Appearance</h3><label>Mode</label><select onchange="CFG.mode=this.value;applyTheme()">
      ${['auto', 'light', 'dark'].map(m => `<option value="${m}"${CFG.mode === m ? ' selected' : ''}>${m}</option>`).join('')}</select><label>Theme colour</label>
      ${['#6b2d5c', '#1f6f78', '#a23b3b', '#2f5d9e', '#3f7d4e', '#8a5a14'].map(c => `<span class="sw" style="background:${c}" onclick="CFG.accent='${c}';applyTheme()"></span>`).join('')}</div>
      <div class="card"><h3>My account</h3><button class="btn sec" onclick="changePw()">Change my password</button></div>
      ${isA() ? `<div class="card"><h3>Backup</h3><p class="sub">All data and photos are stored online in your Supabase project. This downloads a copy of the records (without photos).</p>
      <button class="btn" onclick="backup()">Download data backup</button></div>
      <div class="card"><h3>Edit history</h3><div id="hist" class="sub">Loading…</div></div>
      <div class="card"><h3>Danger zone</h3><button class="btn bad" onclick="resetAll()">⚠️ Delete all work records and photos</button></div>` : ''}
      <button class="btn sec" onclick="logout()">Log out</button>`;
  }
};

/* ---------- daily work ---------- */
function wlist() {
  const q = S.q.toLowerCase(), t = today();
  return mine().filter(x => !q || [x.bill, x.customer, x.cloth, x.design, x.color, x.phone].join(' ').toLowerCase().includes(q)).map(x => `<div class="card">
    <div class="row" style="padding-top:0"><div><b>${esc(x.cloth)}</b> ${esc(x.design)} × ${x.qty}<div class="sub">Bill ${esc(x.bill)} · ${x.date} · ${esc(x.customer)}${x.color ? ' · ' + esc(x.color) : ''}</div>
    ${x.phone ? `<div class="sub">📞 <a href="tel:${esc(x.phone)}">${esc(x.phone)}</a></div>` : ''}
    <div class="sub">By ${esc(ename(x.emp))} · ${inr(x.basic)} + ${inr(x.extra)}</div>
    ${x.due || x.delivered ? `<div class="sub"><span class="tag ${x.delivered ? 'Approved' : x.due < t ? 'Rejected' : 'Pending'}">${x.delivered ? '<span>Delivered</span>' : '<span>Due</span> ' + x.due}</span></div>` : ''}
    ${x.notes ? `<div class="sub">${esc(x.notes)}</div>` : ''}</div>
    <div class="r"><b>${inr(total(x))}</b><br><span class="tag ${x.status}">${x.status}</span></div></div>
    <div class="phs">${(x.photos || []).map(p => `<img class="th" data-pid="${esc(p)}" alt="">`).join('')}</div>
    <div class="fx2 noprint" style="flex-wrap:wrap">${canEdit(x) ? `<button class="btn sm sec" onclick="editWork('${x.id}')">Edit</button><button class="btn sm bad" onclick="delWork('${x.id}')">Delete</button>` : ''}
    ${x.phone ? `<button class="btn sm sec" onclick="wa('${x.id}')">💬 WhatsApp</button>` : ''}
    ${isA() && x.status !== 'Approved' ? `<button class="btn sm ok" onclick="setStatus('${x.id}','Approved')">Approve</button>` : ''}
    ${isA() && x.status === 'Pending' ? `<button class="btn sm bad" onclick="setStatus('${x.id}','Rejected')">Reject</button>` : ''}
    ${isA() && !x.delivered && x.status !== 'Rejected' ? `<button class="btn sm ok" onclick="setDelivered('${x.id}')">Mark delivered</button>` : ''}</div></div>`).join('') || '<p class="sub">No work records.</p>';
}
function wa(id) {                                                   // open WhatsApp with a ready message to the customer
  const x = S.works.find(w => w.id === id); if (!x || !x.phone) return;
  const mr = CFG.lang === 'mr', ready = x.status === 'Approved';
  const msg = mr ? `नमस्कार ${x.customer}, रुपाली फॅशन स्टुडिओ कडून. तुमचे ${x.cloth} (बिल ${x.bill}) ${ready ? 'तयार आहे. कृपया घेऊन जा.' : 'तयार होत आहे.'}${x.due ? ' देय तारीख: ' + x.due + '.' : ''} धन्यवाद!`
    : `Hello ${x.customer}, from Rupali Fashion Studio. Your ${x.cloth} (bill ${x.bill}) ${ready ? 'is ready. Please collect it.' : 'is being prepared.'}${x.due ? ' Delivery date: ' + x.due + '.' : ''} Thank you!`;
  window.open(waUrl(x.phone, msg), '_blank');
}
async function setDelivered(id) {
  const w = S.works.find(x => x.id === id);
  try { await ok(sb.from('works').update({ delivered: true }).eq('id', id)); await log('Delivered', `${w.bill} ${w.customer}`); await load(); render(); } catch (e) { toast(errMsg(e)); }
}
async function approveAll() {
  if (!confirm('सर्व प्रलंबित कामे मंजूर करायची?')) return;
  try { await ok(sb.from('works').update({ status: 'Approved' }).eq('status', 'Pending')); await log('Approved all pending', ''); await load(); render(); } catch (e) { toast(errMsg(e)); }
}
function newWork() {
  S.form = { w: { id: null, date: today(), bill: 'B' + String(S.works.length + 1).padStart(4, '0'), customer: '', cloth: '', design: '', color: '', qty: 1, basic: 0, extra: 0, notes: '', phone: '', due: null }, ph: [], rm: [] };
  S.tab = 'work'; render();
}
async function editWork(id) {
  const w = { ...S.works.find(x => x.id === id) }, ph = [];
  for (const p of w.photos || []) { try { ph.push({ id: p, url: urls[p] || (urls[p] = await PH.url(p)) }); } catch (e) {} }
  S.form = { w, ph, rm: [] }; S.tab = 'work'; render();
}
function formView() {
  const w = S.form.w, ro = isA() ? '' : 'readonly', f = (k, t = 'text', x = '') => `id="f_${k}" type="${t}" value="${esc(w[k])}" ${x}`;
  return `<div class="card"><h3>${w.id ? 'Edit' : 'New'} daily work</h3>
  <label>Price item (auto-fills prices)</label><select id="pi" onchange="pickPrice(this.value)"><option value="">${isA() ? 'Manual entry' : 'Select…'}</option>
  ${S.prices.map(p => `<option value="${p.id}">${esc(p.cloth)} – ${esc(p.design || 'Plain')}</option>`).join('')}</select>
  <div class="fx"><div><label>Quantity</label><input ${f('qty', 'number', 'min="1" oninput="calc()"')}></div><div><label>Customer (optional)</label><input ${f('customer')}></div></div>
  <div class="row"><span class="sub">(Basic + Extra) × Qty</span><b class="big" id="tt"></b></div>
  <label>Photos</label><div class="fx">
  <div class="btn sec" style="position:relative;overflow:hidden;text-align:center">📷 Camera<input type="file" accept="image/*" capture="environment" onchange="addFiles(this)" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0"></div>
  <div class="btn sec" style="position:relative;overflow:hidden;text-align:center">🖼️ Choose images<input type="file" accept="image/*" multiple onchange="addFiles(this)" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0"></div></div>
  <div id="ph" class="phs"></div>
  <details style="margin-top:14px"><summary style="cursor:pointer;font-weight:600">More details (optional)</summary>
  <div class="fx"><div><label>Date</label><input ${f('date', 'date')}></div><div><label>Bill no.</label><input ${f('bill')}></div></div>
  <label>Customer phone</label><input ${f('phone', 'tel')}><label>Delivery date</label><input ${f('due', 'date')}>
  <div class="fx"><div><label>Clothing</label><input ${f('cloth', 'text', ro)}></div><div><label>Design</label><input ${f('design', 'text', ro)}></div></div>
  <div class="fx"><div><label>Colour</label><input ${f('color')}></div><div><label>Basic price</label><input ${f('basic', 'number', ro + ' oninput="calc()"')}></div></div>
  <label>Extra design</label><input ${f('extra', 'number', ro + ' oninput="calc()"')}>
  <label>Notes</label><textarea id="f_notes" rows="2">${esc(w.notes)}</textarea></details>
  <div class="fx"><button class="btn" id="sv" onclick="saveWork()">Save</button><button class="btn sec" onclick="S.form=null;render()">Cancel</button></div></div>`;
}
function pickPrice(id) {
  const p = S.prices.find(x => x.id === id); if (!p) return;
  $('#f_cloth').value = p.cloth; $('#f_design').value = p.design; $('#f_basic').value = p.basic; $('#f_extra').value = p.extra; calc();
}
function calc() { const g = k => +$('#f_' + k).value || 0; $('#tt').textContent = inr((g('basic') + g('extra')) * (g('qty') || 1)); }
function drawPhotos() {
  $('#ph').innerHTML = S.form.ph.map((p, i) => `<div class="pw"><img class="th" src="${p.url}" onclick="showImg(this.src)" alt=""><button onclick="rmPhoto(${i})">×</button></div>`).join('') || '<span class="sub">No photos added</span>';
}
async function addFiles(inp) {
  const files = [...inp.files]; inp.value = ''; if (!S.form) return;
  for (const f of files) {
    try { const blob = await shrink(f); S.form.ph.push({ id: uid(), blob, url: urlOf(blob), isNew: 1 }); drawPhotos(); }
    catch (e) { toast('Image error: ' + errMsg(e)); }
  }
  toast(files.length + ' photo(s) added');
}
function rmPhoto(i) { const p = S.form.ph.splice(i, 1)[0]; if (!p.isNew) S.form.rm.push(p.id); drawPhotos(); }
async function saveWork() {
  const f = S.form, w = f.w, g = k => $('#f_' + k).value.trim();
  const n = { date: g('date') || today(), bill: g('bill'), customer: g('customer'), cloth: g('cloth'), design: g('design'), color: g('color'),
    qty: Math.max(1, +g('qty') || 1), basic: +g('basic') || 0, extra: +g('extra') || 0, notes: g('notes'), phone: g('phone'), due: g('due') || null };
  if (!n.cloth) return toast(isA() ? 'Price item निवडा (किंवा More details मध्ये Clothing टाका)' : (S.prices.length ? 'वरील "Price item" मधून कपडा निवडा' : 'Admin ने आधी Prices मध्ये किंमत टाकली पाहिजे'));
  $('#sv').disabled = true; $('#sv').textContent = 'Saving…';
  try {
    n.photos = [];
    for (const p of f.ph) { if (p.isNew) { const path = `${S.user.id}/${uid()}.jpg`; await PH.up(path, p.blob); n.photos.push(path); } else n.photos.push(p.id); }
    if (!w.id) { n.emp = S.user.id; n.status = isA() ? 'Approved' : 'Pending'; await ok(sb.from('works').insert(n)); }
    else { if (!isA()) n.status = 'Pending'; await ok(sb.from('works').update(n).eq('id', w.id)); }
    if (f.rm.length) await PH.rm(f.rm);
    await log(w.id ? 'Work edited' : 'Work added', `${n.bill} ${n.customer} ${inr(total(n))}`);
    S.form = null; await load(); toast('Saved'); render();
  } catch (e) { toast('Save failed: ' + errMsg(e)); $('#sv').disabled = false; $('#sv').textContent = 'Save'; }
}
async function delWork(id) {
  const w = S.works.find(x => x.id === id);
  if (!confirm(`Delete bill ${w.bill} and its ${(w.photos || []).length} photo(s)? This cannot be undone.`)) return;
  try { if ((w.photos || []).length) await PH.rm(w.photos); await ok(sb.from('works').delete().eq('id', id)); await log('Work deleted', `${w.bill} ${w.customer}`); await load(); render(); }
  catch (e) { toast(errMsg(e)); }
}
async function setStatus(id, s) {
  const w = S.works.find(x => x.id === id);
  try { await ok(sb.from('works').update({ status: s }).eq('id', id)); await log('Work ' + s, `${w.bill} by ${ename(w.emp)}`); await load(); render(); }
  catch (e) { toast(errMsg(e)); }
}

/* ---------- price list (admin edits, everyone reads) ---------- */
const plist = q => S.prices.filter(p => (p.cloth + ' ' + p.design).toLowerCase().includes(q.toLowerCase())).map(p => `<div class="row">
  <div><b>${esc(p.cloth)}</b> · ${esc(p.design || 'Plain')}<div class="sub">Basic ${inr(p.basic)} + design ${inr(p.extra)}</div></div>
  ${isA() ? `<div class="fx2"><button class="btn sm sec" onclick="editPrice('${p.id}')">Edit</button><button class="btn sm bad" onclick="delPrice('${p.id}')">Delete</button></div>` : ''}</div>`).join('') || '<p class="sub">No prices yet.</p>';
function pform() {
  const p = S.pf, i = (k, l, t = 'text') => `<label>${l}</label><input id="p_${k}" type="${t}" value="${esc(p[k] ?? '')}">`;
  return `<div class="card"><h3>${p.id ? 'Edit' : 'New'} price</h3>${i('cloth', 'Clothing type')}${i('design', 'Design name')}${i('basic', 'Basic price ₹', 'number')}${i('extra', 'Extra design charge ₹', 'number')}
  <div class="fx"><button class="btn" onclick="savePrice()">Save</button><button class="btn sec" onclick="S.pf=null;render()">Cancel</button></div></div>`;
}
function editPrice(id) { S.pf = { ...S.prices.find(p => p.id === id) }; render(); }
async function savePrice() {
  const g = k => $('#p_' + k).value.trim(), cloth = g('cloth'); if (!cloth) return toast('Enter clothing type');
  const p = { cloth, design: g('design'), basic: +g('basic') || 0, extra: +g('extra') || 0 };
  try {
    await ok(S.pf.id ? sb.from('prices').update(p).eq('id', S.pf.id) : sb.from('prices').insert(p));
    await log(S.pf.id ? 'Price edited' : 'Price added', `${cloth} ${p.design} ${inr(p.basic)}+${inr(p.extra)}`); S.pf = null; await load(); render();
  } catch (e) { toast(errMsg(e)); }
}
async function delPrice(id) {
  const p = S.prices.find(x => x.id === id); if (!confirm(`Delete price "${p.cloth} – ${p.design}"?`)) return;
  try { await ok(sb.from('prices').delete().eq('id', id)); await log('Price deleted', p.cloth + ' ' + p.design); await load(); render(); } catch (e) { toast(errMsg(e)); }
}

/* ---------- employees (admin creates ID + password; employee logs in on own phone) ---------- */
const elist = q => {
  q = q.toLowerCase(); const m = today().slice(0, 7);
  return S.emps.filter(e => [e.name, e.login_id, e.phone, e.address, e.notes, e.role].join(' ').toLowerCase().includes(q)).map(e => {
    const a = S.works.filter(w => w.emp === e.id && w.status === 'Approved' && w.date.startsWith(m)), amt = a.reduce((s, w) => s + total(w), 0);
    return `<div class="card"><div class="row"><div><b>${esc(e.name)}</b> <span class="tag ${e.active ? 'Approved' : 'Rejected'}">${e.active ? 'Active' : 'Off'}</span>
      <div class="sub">ID: ${esc(e.login_id)} · ${e.role} · ${e.rate}% pay</div>${e.phone ? `<div class="sub">📞 ${esc(e.phone)}</div>` : ''}</div>
      <div class="r"><b>${inr(amt * e.rate / 100)}</b><div class="sub">${a.reduce((s, w) => s + +w.qty, 0)} pcs</div></div></div>
      <div class="fx2"><button class="btn sm" onclick="S.ev='${e.id}';render()">View</button><button class="btn sm sec" onclick="editEmp('${e.id}')">Edit</button>
      <button class="btn sm sec" onclick="toggleEmp('${e.id}')">${e.active ? 'Deactivate' : 'Activate'}</button></div></div>`; }).join('') || '<p class="sub">No employees found.</p>';
};
function empDetail() {
  const e = S.emps.find(x => x.id === S.ev); if (!e) { S.ev = null; return V.team(); }
  const m = today().slice(0, 7), ws = S.works.filter(w => w.emp === e.id), ap = ws.filter(w => w.status === 'Approved'), mo = ap.filter(w => w.date.startsWith(m));
  const sum = a => a.reduce((s, w) => s + total(w), 0), pcs = a => a.reduce((s, w) => s + +w.qty, 0);
  return `<button class="btn sec noprint" onclick="S.ev=null;render()">← Back</button><div class="card"><h3>${esc(e.name)} <span class="tag ${e.active ? 'Approved' : 'Rejected'}">${e.active ? 'Active' : 'Off'}</span></h3>${prof(e)}
  ${e.phone ? `<div class="fx2 noprint"><a class="btn sm sec" href="tel:${esc(e.phone)}">📞 Call</a><a class="btn sm sec" href="${waUrl(e.phone, '')}" target="_blank">💬 WhatsApp</a></div>` : ''}</div>
  <div class="grid">${st(pcs(mo), 'Pieces this month')}${st(inr(sum(mo) * e.rate / 100), 'Payable this month')}${st(inr(sum(ap)), 'Total approved (all time)')}${st(ws.filter(w => w.status === 'Pending').length, 'Pending')}${st(pcs(ap), 'Pieces (all time)')}</div>
  <div class="card"><h3>Work history</h3>${ws.slice(0, 15).map(row).join('') || '<p class="sub">No records yet.</p>'}</div>`;
}
function eform() {
  const e = S.ef, i = (k, l, t = 'text') => `<label>${l}</label><input id="e_${k}" type="${t}" value="${esc(e[k] ?? '')}">`;
  return `<div class="card"><h3>${e.id ? 'Edit' : 'New'} employee</h3>
  ${e.id ? `<p class="sub">Login ID: <b>${esc(e.login_id)}</b></p>` : '<label>Login ID (letters/numbers, e.g. emp01)</label><input id="e_id" autocapitalize="none">'}
  ${i('name', 'Name')}<label>Role</label><select id="e_role"><option value="employee"${e.role !== 'admin' ? ' selected' : ''}>employee</option><option value="admin"${e.role === 'admin' ? ' selected' : ''}>admin</option></select>
  ${i('phone', 'Phone', 'tel')}${i('address', 'Address')}${i('joined', 'Joined', 'date')}${i('notes', 'Notes')}
  <label>Pay % of approved work value</label><input id="e_rate" type="number" value="${e.rate || 100}">
  <label>${e.id ? 'New password (leave blank to keep)' : 'Password (6+ characters)'}</label><input id="e_pw" type="text" autocapitalize="none">
  <div class="fx"><button class="btn" onclick="saveEmp()">Save</button><button class="btn sec" onclick="S.ef=null;render()">Cancel</button></div></div>`;
}
function editEmp(id) { S.ef = { ...S.emps.find(e => e.id === id) }; render(); }
const admins = () => S.emps.filter(e => e.role === 'admin' && e.active).length;
async function saveEmp() {
  const g = k => $('#e_' + k).value.trim(), name = g('name'), role = $('#e_role').value, rate = +$('#e_rate').value || 100, pw = $('#e_pw').value;
  const det = { name, role, rate, phone: g('phone'), address: g('address'), joined: g('joined') || null, notes: g('notes') };
  if (!name) return toast('Enter a name');
  try {
    if (S.ef.id) {
      const e = S.emps.find(x => x.id === S.ef.id);
      if (e.role === 'admin' && role !== 'admin' && admins() < 2) return toast('Keep at least one active admin');
      if (pw && pw.length < 6) return toast('Password needs 6+ characters');
      await ok(sb.from('profiles').update(det).eq('id', e.id));
      if (pw) await ok(sb.rpc('admin_set_password', { uid: e.id, pw }));
      await log('Employee edited', name);
    } else {
      const lid = $('#e_id').value.trim();
      if (!/^[a-z0-9._-]{3,20}$/i.test(lid)) return toast('Login ID: 3-20 letters/numbers');
      if (pw.length < 6) return toast('Password needs 6+ characters');
      const { data, error } = await sb2.auth.signUp({ email: mail(lid), password: pw, options: { data: { name } } });
      if (error) throw error;
      if (!data.user || (data.user.identities && !data.user.identities.length)) throw new Error('This Login ID already exists');
      await ok(sb.from('profiles').update({ ...det, active: true }).eq('id', data.user.id));
      await log('Employee added', `${name} (${lid})`);
      toast(`Created. Give them ID: ${lid.toLowerCase()} and the password`);
    }
    S.ef = null; await load(); render();
  } catch (e) { toast(errMsg(e)); }
}
async function toggleEmp(id) {
  const e = S.emps.find(x => x.id === id);
  if (e.active && e.role === 'admin' && admins() < 2) return toast('Keep at least one active admin');
  try { await ok(sb.from('profiles').update({ active: !e.active }).eq('id', id)); await log('Employee ' + (e.active ? 'deactivated' : 'activated'), e.name); await load(); render(); }
  catch (er) { toast(errMsg(er)); }
}

/* ---------- measurements + calculator ---------- */
const MFIELDS = {
  Blouse: ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeve length', 'Sleeve round', 'Armhole', 'Front neck', 'Back neck'],
  Dress: ['Length', 'Bust', 'Waist', 'Hip', 'Shoulder', 'Sleeve length', 'Neck'],
  Pant: ['Length', 'Waist', 'Hip', 'Thigh', 'Knee', 'Bottom', 'Crotch'],
  Other: ['Length', 'Width', 'Round', 'Height']
};
function measureView() {
  const sg = `<div class="seg noprint"><button class="${S.mt === 'list' ? 'on' : ''}" onclick="S.mt='list';S.mf=null;render()">📏 Measurements</button><button class="${S.mt === 'calc' ? 'on' : ''}" onclick="S.mt='calc';render()">🧮 Calculator</button></div>`;
  return sg + (S.mt === 'calc' ? calcView() : S.mf ? mform() : mlist());
}
function mlist() {
  return `<button class="btn" onclick="newMeas()">+ New measurement</button><input placeholder="Search by name or phone…" style="margin-top:12px" value="${esc(S.ms)}" oninput="S.ms=this.value;$('#ml').innerHTML=mcards()"><div id="ml">${mcards()}</div>`;
}
function mcards() {
  const q = S.ms.toLowerCase();
  return S.meas.filter(m => !q || [m.customer, m.phone, m.type].join(' ').toLowerCase().includes(q)).map(m => `<div class="card"><div class="row" style="padding-top:0">
    <div><b>${esc(m.customer)}</b><div class="sub">${m.phone ? '📞 ' + esc(m.phone) + ' · ' : ''}${String(m.created_at || '').slice(0, 10)}</div></div>
    <span class="tag Pending"><span>${esc(m.type)}</span> · <span>${m.unit === 'cm' ? 'cm' : 'inch'}</span></span></div>
    <div>${Object.entries(m.data || {}).map(([k, v]) => `<span class="chip"><span>${esc(k)}</span> ${esc(v)}</span>`).join('')}</div>${m.notes ? `<div class="sub" style="margin-top:6px">${esc(m.notes)}</div>` : ''}
    <div class="fx2 noprint" style="flex-wrap:wrap"><button class="btn sm sec" onclick="editMeas('${m.id}')">Edit</button><button class="btn sm sec" onclick="workFromMeas('${m.id}')">Use for work</button>
    ${m.phone ? `<button class="btn sm sec" onclick="shareMeas('${m.id}')">💬 WhatsApp</button>` : ''}<button class="btn sm bad" onclick="delMeas('${m.id}')">Delete</button></div></div>`).join('') || '<p class="sub">No measurements yet.</p>';
}
function newMeas() { S.mf = { id: null, customer: '', phone: '', type: 'Blouse', unit: 'inch', data: {}, notes: '' }; render(); }
function editMeas(id) { S.mf = JSON.parse(JSON.stringify(S.meas.find(x => x.id === id))); render(); }
function mform() {
  const m = S.mf, fl = MFIELDS[m.type] || MFIELDS.Other;
  return `<div class="card"><h3>${m.id ? 'Edit' : 'New'} measurement</h3>
  <label>Customer</label><input id="m_c" value="${esc(m.customer)}"><label>Customer phone</label><input id="m_p" type="tel" value="${esc(m.phone)}">
  <div class="fx"><div><label>Garment</label><select id="m_t" onchange="mType()">${Object.keys(MFIELDS).map(t => `<option value="${t}"${m.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
  <div><label>Unit</label><select id="m_u"><option value="inch"${m.unit !== 'cm' ? ' selected' : ''}>inch</option><option value="cm"${m.unit === 'cm' ? ' selected' : ''}>cm</option></select></div></div>
  <div class="mgrid">${fl.map(k => `<div><label>${k}</label><input class="mi" data-l="${k}" type="number" step="any" inputmode="decimal" value="${esc((m.data || {})[k] ?? '')}"></div>`).join('')}</div>
  <label>Notes</label><textarea id="m_n" rows="2">${esc(m.notes)}</textarea>
  <div class="fx"><button class="btn" onclick="saveMeas()">Save</button><button class="btn sec" onclick="S.mf=null;render()">Cancel</button></div></div>`;
}
function readM() {
  const m = S.mf; m.customer = $('#m_c').value.trim(); m.phone = $('#m_p').value.trim(); m.unit = $('#m_u').value; m.notes = $('#m_n').value.trim();
  const d = {}; document.querySelectorAll('.mi').forEach(i => { if (i.value !== '') d[i.dataset.l] = i.value; }); m.data = d; return m;
}
function mType() { readM(); S.mf.type = $('#m_t').value; render(); }
async function saveMeas() {
  const m = readM(); if (!m.customer) return toast('Customer name टाका');
  const row = { customer: m.customer, phone: m.phone, type: m.type, unit: m.unit, data: m.data, notes: m.notes };
  try {
    if (m.id) await ok(sb.from('measurements').update(row).eq('id', m.id)); else await ok(sb.from('measurements').insert({ ...row, created_by: S.user.id }));
    await log(m.id ? 'Measurement edited' : 'Measurement added', m.customer); S.mf = null; await load(); toast('Saved'); render();
  } catch (e) { toast(/measurements|schema cache/.test(errMsg(e)) ? 'Supabase मध्ये supabase_measure.sql आधी Run करा' : errMsg(e)); }
}
async function delMeas(id) {
  const m = S.meas.find(x => x.id === id); if (!confirm(`Delete measurement of ${m.customer}?`)) return;
  try { await ok(sb.from('measurements').delete().eq('id', id)); await log('Measurement deleted', m.customer); await load(); render(); } catch (e) { toast(errMsg(e)); }
}
function workFromMeas(id) { const m = S.meas.find(x => x.id === id); newWork(); S.form.w.customer = m.customer; S.form.w.phone = m.phone || ''; render(); }
function shareMeas(id) {
  const m = S.meas.find(x => x.id === id), body = Object.entries(m.data || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
  window.open(waUrl(m.phone, `${m.customer} – ${m.type} (${m.unit})\n${body}\n– Rupali Fashion Studio`), '_blank');
}
function calcView() {
  const K = [['C', 'op2'], ['⌫', 'op2'], ['%', 'op2'], ['÷', 'op'], ['7'], ['8'], ['9'], ['×', 'op'], ['4'], ['5'], ['6'], ['−', 'op'], ['1'], ['2'], ['3'], ['+', 'op'], ['0', 'z'], ['.'], ['=', 'eq']];
  return `<div class="card"><div class="calc-d"><div class="ce" id="ce">${esc(S.cx.e) || '&nbsp;'}</div><div class="cr" id="cr">${esc(S.cx.r) || '0'}</div></div>
  <div class="keys">${K.map(([k, c]) => `<button class="key ${c || ''}" onclick="ck('${k}')">${k}</button>`).join('')}</div></div>
  <div class="card"><h3>Inch ↔ cm converter</h3><div class="fx"><div><label>Inches</label><input id="cv_i" type="number" step="any" inputmode="decimal" oninput="cvt('i')"></div>
  <div><label>Centimetres</label><input id="cv_c" type="number" step="any" inputmode="decimal" oninput="cvt('c')"></div></div></div>
  <div class="card"><h3>Bill calculator</h3><div class="fx"><div><label>Rate</label><input id="b_r" type="number" inputmode="decimal" oninput="bc()"></div>
  <div><label>Extra</label><input id="b_e" type="number" inputmode="decimal" oninput="bc()"></div><div><label>Qty</label><input id="b_q" type="number" inputmode="numeric" value="1" oninput="bc()"></div></div>
  <div class="row"><span class="sub">(Rate + Extra) × Qty</span><b class="big" id="b_t">₹0</b></div></div>`;
}
function ck(k) {                                                  // calculator key press (digits/operators only, no eval of text)
  const c = S.cx;
  if (k === 'C') { c.e = ''; c.r = ''; }
  else if (k === '⌫') c.e = c.e.slice(0, -1);
  else if (k === '=') {
    try {
      const x = c.e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/(\d+(\.\d+)?)%/g, '($1/100)');
      if (!x || !/^[0-9+\-*/.()\s]+$/.test(x)) throw 0;
      const v = Function('"use strict";return (' + x + ')')();
      if (!isFinite(v)) throw 0; c.r = String(+v.toFixed(8)); c.e = c.r;
    } catch (e) { c.r = 'Error'; }
  } else { if (c.r && c.e === c.r && /[0-9.]/.test(k)) c.e = ''; c.r = ''; c.e += k; }
  $('#ce').innerHTML = esc(c.e) || '&nbsp;'; $('#cr').textContent = c.r || '0';
}
function cvt(w) {
  const i = $('#cv_i'), c = $('#cv_c');
  if (w === 'i') c.value = i.value === '' ? '' : +(+i.value * 2.54).toFixed(2); else i.value = c.value === '' ? '' : +(+c.value / 2.54).toFixed(2);
}
function bc() { $('#b_t').textContent = inr(((+$('#b_r').value || 0) + (+$('#b_e').value || 0)) * (+$('#b_q').value || 1)); }

/* ---------- employee board: who did how much (works for 100+ employees) ---------- */
function empRows(o) {
  const q = o.q.toLowerCase(), by = {};
  S.works.forEach(w => {
    if (w.status !== 'Approved' || (o.month && !w.date.startsWith(o.month))) return;
    const x = by[w.emp] = by[w.emp] || { n: 0, p: 0, a: 0 }; x.n++; x.p += +w.qty; x.a += total(w);
  });
  const l = S.emps.filter(e => e.role !== 'admin' || by[e.id]).map(e => ({ e, ...(by[e.id] || { n: 0, p: 0, a: 0 }) }))
    .filter(r => (o.zero || r.n) && (!q || [r.e.name, r.e.login_id, r.e.phone, r.e.address].join(' ').toLowerCase().includes(q)));
  return l.sort(o.sort === 'name' ? (a, b) => a.e.name.localeCompare(b.e.name) : o.sort === 'pcs' ? (a, b) => b.p - a.p : (a, b) => b.a - a.a);
}
const erow = (r, i) => `<div class="row"><div><b>${i + 1}. ${esc(r.e.name)}</b><div class="sub">ID ${esc(r.e.login_id)} · ${r.n} · ${r.p} pcs</div></div>
  <div class="r"><b>${inr(r.a)}</b><div class="sub"><span>Payable</span> ${inr(r.a * r.e.rate / 100)}</div><button class="btn sm sec noprint" onclick="openEmp('${r.e.id}')">View</button></div></div>`;
function openEmp(id) { S.tab = 'team'; S.ev = id; render(); }
function empListHtml() {
  const l = empRows(S.es), n = S.es.n, t = l.reduce((s, r) => ({ p: s.p + r.p, a: s.a + r.a, y: s.y + r.a * r.e.rate / 100 }), { p: 0, a: 0, y: 0 });
  return `<div class="grid">${st(l.length, 'Employees')}${st(t.p, 'Pieces')}${st(inr(t.a), 'Total amount')}${st(inr(t.y), 'Payable')}</div><div style="margin-top:8px">
  ${l.slice(0, n).map(erow).join('') || '<p class="sub">No employees found.</p>'}</div>
  ${l.length > n ? `<button class="btn sec noprint" style="width:100%" onclick="S.es.n+=30;$('#ebl').innerHTML=empListHtml()">Show more (${l.length - n})</button>` : ''}`;
}
function empBoard() {
  const e = S.es, up = "S.es.n=30;$('#ebl').innerHTML=empListHtml()";
  return `<div class="card"><h3>Employees – work &amp; amount</h3>
  <input placeholder="Search employee (name, ID, phone)…" value="${esc(e.q)}" oninput="S.es.q=this.value;${up}">
  <div class="fx"><div><label>Month</label><input type="month" value="${e.month}" onchange="S.es.month=this.value;${up}"></div>
  <div><label>Sort</label><select onchange="S.es.sort=this.value;${up}">${[['amount', 'Amount (high to low)'], ['pcs', 'Pieces (high to low)'], ['name', 'Name (A–Z)']].map(([v, l]) => `<option value="${v}"${e.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>
  <div class="fx2 noprint" style="flex-wrap:wrap"><button class="btn sm sec" onclick="S.es.month=new Date().toISOString().slice(0,7);render()">This month</button><button class="btn sm sec" onclick="S.es.month='';render()">All time</button></div>
  <label style="display:flex;gap:8px;align-items:center;text-transform:none"><input type="checkbox" style="width:auto;margin:0" ${e.zero ? 'checked' : ''} onchange="S.es.zero=this.checked;${up}"><span>Include employees with no work</span></label>
  <div id="ebl" style="margin-top:10px">${empListHtml()}</div></div>`;
}

/* ---------- reports ---------- */
const rateOf = id => (S.emps.find(e => e.id === id) || { rate: 100 }).rate / 100;
function repRows(noEmp) {
  const r = S.rep, td = today(), t = new Date(), q = r.q.toLowerCase();
  let from = { today: td, week: iso(new Date(t.getTime() - ((t.getDay() + 6) % 7) * 864e5)), month: td.slice(0, 8) + '01', all: '0000' }[r.range], to = '9999';
  if (r.range === 'custom') { from = r.from || '0000'; to = r.to || '9999'; }
  return mine().filter(w => w.date >= from && w.date <= to && (noEmp || r.emp === 'all' || w.emp === r.emp)
    && (r.st === 'all' ? w.status !== 'Rejected' : r.st === 'pending' ? w.status === 'Pending' : w.status === 'Approved')
    && (!q || [w.bill, w.customer, w.cloth, w.design, w.color, w.phone, ename(w.emp)].join(' ').toLowerCase().includes(q)));
}
const rsum = a => a.reduce((s, w) => s + total(w), 0), rpcs = a => a.reduce((s, w) => s + +w.qty, 0);
function repTable() {
  const rows = repRows(), by = S.rep.by;
  if (by === 'none') return { head: ['Date', 'Bill', 'Customer', 'Employee', 'Clothing', 'Design', 'Qty', 'Total'],
    body: rows.map(w => [w.date, w.bill, w.customer, ename(w.emp), w.cloth, w.design, w.qty, total(w)]) };
  const key = { customer: w => w.customer || '-', employee: w => w.emp, cloth: w => w.cloth }[by], g = {};
  rows.forEach(w => (g[key(w)] = g[key(w)] || []).push(w));
  return { head: [{ customer: 'Customer', employee: 'Employee', cloth: 'Clothing' }[by], 'Entries', 'Pieces', 'Total'].concat(by === 'employee' ? ['Payable'] : []),
    body: Object.entries(g).map(([k, a]) => [by === 'employee' ? ename(k) : k, a.length, rpcs(a), rsum(a)]
      .concat(by === 'employee' ? [rsum(a.filter(w => w.status === 'Approved')) * rateOf(k)] : [])) };
}
function reportView() {
  const r = S.rep, sel = (k, opts) => `<select onchange="S.rep.${k}=this.value;repUpdate()">${opts.map(([v, l]) => `<option value="${v}"${r[k] === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  return `${isA() ? empBoard() : ''}<div class="card noprint">
  <input placeholder="Search customer, bill, cloth, employee…" value="${esc(r.q)}" oninput="S.rep.q=this.value;repPart()">
  <div class="fx"><div><label>Period</label>${sel('range', [['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['all', 'All time'], ['custom', 'Custom dates']])}</div>
  ${isA() ? `<div><label>Employee</label>${sel('emp', [['all', 'All employees'], ...S.emps.map(e => [e.id, e.name])])}</div>` : ''}</div>
  ${r.range === 'custom' ? `<div class="fx"><div><label>From</label><input type="date" value="${r.from}" onchange="S.rep.from=this.value;repPart()"></div><div><label>To</label><input type="date" value="${r.to}" onchange="S.rep.to=this.value;repPart()"></div></div>` : ''}
  <div class="fx"><div><label>Group by</label>${sel('by', [['none', 'None (list)'], ['customer', 'Customer'], ['employee', 'Employee'], ['cloth', 'Clothing']])}</div>
  <div><label>Status</label>${sel('st', [['approved', 'Approved only'], ['pending', 'Pending only'], ['all', 'All except rejected']])}</div></div>
  <div class="fx2" style="flex-wrap:wrap"><button class="btn sm" onclick="window.print()">🖨️ Print</button><button class="btn sm sec" onclick="exportCSV()">CSV</button><button class="btn sm sec" onclick="exportJSON()">JSON</button>
  <button class="btn sm sec" onclick="S.rep={range:'month',by:'none',st:'approved',emp:'all',q:'',from:'',to:''};repUpdate()">Clear filters</button></div></div>
  <div id="repp">${repPartHtml()}</div>`;
}
const repUpdate = () => { $('#v').innerHTML = reportView(); };
const repPart = () => { $('#repp').innerHTML = repPartHtml(); };
function repPartHtml() {
  const rows = repRows(), ap = rows.filter(w => w.status === 'Approved'), pay = ap.reduce((s, w) => s + total(w) * rateOf(w.emp), 0);
  let h = `<div class="grid">${st(rows.length, 'Entries')}${st(rpcs(rows), 'Pieces')}${st(inr(rsum(rows)), 'Total amount')}${st(inr(pay), 'Payable')}</div>`;
  if (isA()) {                                                    // employee summary: tap a card to filter the report
    const base = repRows(true), q = S.rep.q.toLowerCase();
    const list = S.emps.filter(e => !q || [e.name, e.login_id, e.phone, e.address].join(' ').toLowerCase().includes(q) || base.some(w => w.emp === e.id));
    h += `<div class="card noprint"><h3>Employee summary</h3>${list.map(e => {
      const a = base.filter(w => w.emp === e.id), ok_ = a.filter(w => w.status === 'Approved');
      return `<div class="row"><div><b>${esc(e.name)}</b> <span class="tag ${e.active ? 'Approved' : 'Rejected'}">${e.active ? 'Active' : 'Off'}</span>
        <div class="sub">${a.length} · ${rpcs(a)} pcs · ${inr(rsum(a))}</div></div>
        <div class="r"><b>${inr(rsum(ok_) * e.rate / 100)}</b><div class="fx2" style="justify-content:flex-end"><button class="btn sm sec" onclick="S.rep.emp='${e.id}';repUpdate()">Filter</button><button class="btn sm sec" onclick="S.tab='team';S.ev='${e.id}';render()">View</button></div></div></div>`; }).join('') || '<p class="sub">No employees found.</p>'}</div>`;
  }
  return h + `<div class="card" id="rep">${repHtml()}</div>`;
}
function repHtml() {
  const t = repTable(), last = t.head.indexOf('Total'), tot = t.body.reduce((s, r) => s + r[last], 0), e = S.emps.find(x => x.id === S.rep.emp);
  return `<h3>Rupali Fashion Studio – Report</h3><p class="sub">${S.rep.range === 'custom' ? (S.rep.from || '…') + ' → ' + (S.rep.to || '…') : S.rep.range} · ${e ? esc(e.name) + ' · ' : ''}${today()}</p>
  <div class="scroll"><table><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>
  ${t.body.map(r => `<tr>${r.map((c, i) => `<td>${typeof c === 'number' && (i >= last || t.head[i] === 'Payable') ? inr(c) : esc(c)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${t.head.length}">No records</td></tr>`}</table></div>
  <div class="row"><b>Total amount</b><b class="big">${inr(tot)}</b></div>`;
}
function exportCSV() { const t = repTable(), q = c => '"' + String(c).replace(/"/g, '""') + '"'; download('rupali-report.csv', 'text/csv', [t.head, ...t.body].map(r => r.map(q).join(',')).join('\n')); }
function exportJSON() { const t = repTable(); download('rupali-report.json', 'application/json', JSON.stringify(t.body.map(r => Object.fromEntries(t.head.map((h, i) => [h, r[i]]))), null, 2)); }

/* ---------- more: password, backup, history, reset ---------- */
async function moreInfo() {
  if (!isA()) return;
  try {
    const h = await ok(sb.from('history').select('*').order('ts', { ascending: false }).limit(40));
    $('#hist').innerHTML = h.map(x => `${new Date(x.ts).toLocaleString()} · ${esc(x.user_name)} · <b>${esc(x.action)}</b> ${esc(x.detail)}`).join('<br>') || 'No history yet.';
  } catch (e) { $('#hist').textContent = errMsg(e); }
}
async function changePw() {
  const p = prompt('नवीन पासवर्ड (6+ अक्षरे)'); if (!p) return;
  if (p.length < 6) return toast('Password needs 6+ characters');
  const { error } = await sb.auth.updateUser({ password: p }); toast(error ? errMsg(error) : 'Password changed');
}
function backup() { download(`rupali-backup-${today()}.json`, 'application/json', JSON.stringify({ ts: Date.now(), works: S.works, prices: S.prices, profiles: S.emps }, null, 1)); toast('Backup downloaded'); }
async function resetAll() {
  if (!confirm('सर्व काम-नोंदी आणि फोटो कायमचे पुसले जातील. (Prices आणि employees राहतील.) सुरू ठेवायचे?')) return;
  if (prompt('खात्रीसाठी RESET टाइप करा') !== 'RESET') return;
  try {
    await PH.rm(S.works.flatMap(w => w.photos || []));
    await ok(sb.from('works').delete().not('id', 'is', null));
    await log('All work deleted', ''); await load(); toast('Reset झाले'); render();
  } catch (e) { toast(errMsg(e)); }
}

/* ---------- start ---------- */
(async () => {
  applyTheme();
  if (!CONFIGURED) return render();
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) await enter(session.user.id); else S.hasAdmin = await ok(sb.rpc('has_admin'));
  } catch (e) { S.user = null; try { await sb.auth.signOut(); } catch (x) {} try { S.hasAdmin = await ok(sb.rpc('has_admin')); } catch (x) {} if (!/single JSON/.test(errMsg(e))) toast(errMsg(e)); }
  render();
  setInterval(() => {                                            // admin sees new employee work automatically
    const a = document.activeElement;
    if (S.user && !document.hidden && !S.form && !S.pf && !S.ef && !S.mf && S.tab !== 'measure' && !(a && /INPUT|SELECT|TEXTAREA/.test(a.tagName))) load().then(render).catch(() => {});
  }, 30000);
})();
