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

function setParagraphs(el, text) {
  if (!el) return;
  const safe = (text ?? '').toString();
  const parts = safe.split('\n\n').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    el.textContent = safe;
    return;
  }
  el.innerHTML = parts.map(p => `<p>${escapeHtml(p)}</p>`).join('');
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function render(lang) {
  if (!DATA || !DATA.i18n) return;

  const i18n = DATA.i18n[lang] || DATA.i18n[DATA.meta?.defaultLang] || DATA.i18n.ru;

  // Set html lang
  document.documentElement.lang = lang;

  // Basic i18n binding by data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = byPath(i18n, key);
    if (value !== undefined && typeof value !== 'object') {
      setText(el, value);
    }
  });

  // About paragraphs (optional)
  const aboutEl = document.querySelector('[data-i18n="about.text"]');
  if (aboutEl && i18n.about?.text) {
    setParagraphs(aboutEl, i18n.about.text);
  }

  // Company data
  const phone = DATA.company?.phone ?? '';
  const email = DATA.company?.email ?? '';

  const address =
    (DATA.company?.address && (DATA.company.address[lang] || DATA.company.address[DATA.meta?.defaultLang])) || '';

  const coords = DATA.company?.coords ?? null;

  const phoneLink = document.getElementById('phoneLink');
  if (phoneLink) {
    phoneLink.href = `tel:${phone.replace(/\s+/g, '')}`;
    phoneLink.textContent = phone;
  }

  const emailLink = document.getElementById('emailLink');
  if (emailLink) {
    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;
  }

  const addressText = document.getElementById('addressText');
  if (addressText) addressText.textContent = address;

  // Map embed
  const mapFrame = document.getElementById('mapFrame');
  if (mapFrame && coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
    mapFrame.src = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`;
  }

  // Legal entity
  const legalPrefix = i18n.contact?.legalPrefix ?? '';
  const legal = (DATA.company?.legal && (DATA.company.legal[lang] || DATA.company.legal[DATA.meta?.defaultLang])) || '';
  const legalEl = document.getElementById('legalEntity');
  if (legalEl) legalEl.textContent = legalPrefix ? `${legalPrefix}: ${legal}` : legal;

  // Extras list (if exists)
  const extrasList = document.getElementById('extrasList');
  if (extrasList && i18n.extras?.items?.length) {
    extrasList.innerHTML = '';
    i18n.extras.items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      extrasList.appendChild(li);
    });
  }

  // Process list
  const processList = document.getElementById('processList');
  if (processList && i18n.process?.steps?.length) {
    processList.innerHTML = '';
    i18n.process.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      processList.appendChild(li);
    });
  }

  // KPIs
  const kpis = document.getElementById('kpis');
  if (kpis && i18n.warehouse?.kpis?.length) {
    kpis.innerHTML = '';
    i18n.warehouse.kpis.forEach(k => {
      const span = document.createElement('span');
      span.className = 'kpi';
      span.textContent = k;
      kpis.appendChild(span);
    });
  }

  // FAQ accordion
  const faq = document.getElementById('faqList');
  if (faq && i18n.faq?.items?.length) {
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
  }

  // Footer year
  const cy = document.getElementById('copyright');
  if (cy) cy.textContent = `© ${new Date().getFullYear()} WeStore.`;

  // Pressed state and storage
  setPressed(lang);
  localStorage.setItem('westore_lang', lang);
}

async function init() {
  try {
    const res = await fetch('./content/site.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load site.json: ${res.status}`);
    DATA = await res.json();

    const saved = localStorage.getItem('westore_lang');
    const def = DATA.meta?.defaultLang || 'hy';
    const lang = saved || def;

    document.querySelectorAll('.chip[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => render(btn.dataset.lang));
    });

    render(lang);
  } catch (e) {
    console.error('Init error:', e);
  }
}

init();
