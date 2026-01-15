let DATA = null;

function byPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setPressed(lang) {
  document.querySelectorAll('.chip[data-lang]').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });
}

function setText(el, value) {
  if (!el) return;
  el.textContent = value ?? '';
}

function render(lang) {
  const i18n = DATA.i18n[lang];
  document.documentElement.lang = lang === 'hy' ? 'hy' : (lang === 'ru' ? 'ru' : 'en');

  // Simple i18n binding
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    // Support both top-level and nested: hero.side.* vs heroSide.*
    const value = byPath(i18n, key) ?? byPath(i18n, key.replace('hero.side', 'heroSide'));
    setText(el, value);
  });

  // Company data
  const phone = DATA.company.phone;
  const email = DATA.company.email;

  const address = DATA.company.address[lang] || DATA.company.address[DATA.meta.defaultLang];
  const coords = DATA.company.coords;

  const phoneLink = document.getElementById('phoneLink');
  phoneLink.href = `tel:${phone.replace(/\s+/g,'')}`;
  phoneLink.textContent = phone;

  const emailLink = document.getElementById('emailLink');
  emailLink.href = `mailto:${email}`;
  emailLink.textContent = email;

  document.getElementById('addressText').textContent = address;

  // Hero location (short)
  document.getElementById('heroLocation').textContent =
    lang === 'ru' ? 'Котайк, Балаовит' : (lang === 'en' ? 'Kotayk, Balahovit' : 'Կոտայք, Բալահովիտ');

  // Map embed (no API key)
  const mapUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`;
  document.getElementById('mapFrame').src = mapUrl;

  // Legal entity
  const legalPrefix = i18n.contact.legalPrefix;
  const legal = DATA.company.legal[lang] || DATA.company.legal[DATA.meta.defaultLang];
  document.getElementById('legalEntity').textContent = `${legalPrefix}: ${legal}`;

  // Extras list
  const extrasList = document.getElementById('extrasList');
  extrasList.innerHTML = '';
  i18n.extras.items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    extrasList.appendChild(li);
  });

  // Process list
  const processList = document.getElementById('processList');
  processList.innerHTML = '';
  i18n.process.steps.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    processList.appendChild(li);
  });

  // KPIs
  const kpis = document.getElementById('kpis');
  kpis.innerHTML = '';
  i18n.warehouse.kpis.forEach(k => {
    const span = document.createElement('span');
    span.className = 'kpi';
    span.textContent = k;
    kpis.appendChild(span);
  });

  // FAQ accordion
  const faq = document.getElementById('faqList');
  faq.innerHTML = '';
  i18n.faq.items.forEach((it, idx) => {
    const item = document.createElement('div');
    item.className = 'faqItem';

    const btn = document.createElement('button');
    btn.className = 'faqQ';
    btn.type = 'button';
    btn.textContent = it.q;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', `faq-a-${idx}`);

    const ans = document.createElement('div');
    ans.className = 'faqA';
    ans.id = `faq-a-${idx}`;
    ans.hidden = true;
    ans.textContent = it.a;

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      ans.hidden = open;
    });

    item.appendChild(btn);
    item.appendChild(ans);
    faq.appendChild(item);
  });

  // Footer year
  document.getElementById('copyright').textContent =
    `© ${new Date().getFullYear()} WeStore.`;

  // Save
  localStorage.setItem('westore_lang', lang);
  setPressed(lang);
}

async function init() {
  const res = await fetch('./content/site.json', { cache: 'no-store' });
  DATA = await res.json();

  const saved = localStorage.getItem('westore_lang');
  const lang = saved || DATA.meta.defaultLang || 'hy';

  document.querySelectorAll('.chip[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => render(btn.dataset.lang));
  });

  render(lang);
}

init();