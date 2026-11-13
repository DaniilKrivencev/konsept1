/* ЭксТехСервис — Concept 01. Анимации: Motion (motion.dev, бывший Framer Motion), с запасным вариантом без библиотеки. */

/* Контакты клиента: когда появятся — впишите сюда, ссылки и кнопки заработают сами. */
const CONTACTS = {
  phone: '',   // например '+7 900 000-00-00'
  email: '',   // например 'service@example.ru'
  max: ''      // ссылка на профиль/чат в MAX
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Toast ---------- */
const toastEl = $('.toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 3600);
}

/* ---------- Контакты и кнопки связи ---------- */
function fillContacts() {
  const map = {
    phone: v => `<a href="tel:${v.replace(/[^\d+]/g, '')}">${v}</a>`,
    email: v => `<a href="mailto:${v}">${v}</a>`,
    max: v => `<a href="${v}" target="_blank" rel="noopener">Открыть чат</a>`
  };
  $$('[data-contact]').forEach(el => {
    const k = el.dataset.contact;
    if (CONTACTS[k]) el.innerHTML = map[k](CONTACTS[k]);
  });
}
fillContacts();

document.addEventListener('click', e => {
  const call = e.target.closest('[data-call]');
  if (call) {
    if (CONTACTS.phone) location.href = 'tel:' + CONTACTS.phone.replace(/[^\d+]/g, '');
    else toast('Номер телефона добавим после согласования с клиентом. Пока можно оставить заявку.');
  }
  const max = e.target.closest('[data-max]');
  if (max) {
    if (CONTACTS.max) window.open(CONTACTS.max, '_blank', 'noopener');
    else toast('Ссылку на MAX добавим после согласования с клиентом.');
  }
  const fmt = e.target.closest('[data-format]');
  if (fmt) {
    const r = $(`input[name="format"][value="${fmt.dataset.format}"]`);
    if (r) r.checked = true;
  }
});

/* ---------- Навигация ---------- */
const nav = $('[data-nav]');
const burger = $('[data-burger]');
const menu = $('#mobile-menu');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 20);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  menu.hidden = !open;
}
burger.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
addEventListener('resize', () => { if (innerWidth > 960 && !menu.hidden) setMenu(false); });

// Подсветка активного пункта
const links = $$('.nav__links a');
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['services', 'why', 'formats', 'process', 'contacts'].forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });

/* ---------- Разбивка текста на слова ---------- */
function splitWords(el) {
  const html = el.innerHTML.replace(/&nbsp;/g, ' ');
  el.innerHTML = html.split(/(<br\s*\/?>)/).map(part =>
    part.startsWith('<br') ? part : part.split(' ').filter(Boolean).map(w => `<span class="w">${w}</span>`).join(' ')
  ).join('');
  return $$('.w', el);
}
const heroWords = splitWords($('[data-split]'));
const statement = $('[data-words]');
const stWords = splitWords(statement);

/* ---------- Форма ---------- */
const form = $('[data-form]');
const phone = $('[data-phone]');
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (!d) { phone.value = ''; return; }
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  d = d.slice(0, 11);
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 4) out += ')';
  if (d.length > 4) out += ' ' + d.slice(4, 7);
  if (d.length > 7) out += '-' + d.slice(7, 9);
  if (d.length > 9) out += '-' + d.slice(9, 11);
  phone.value = out;
});

const rules = {
  name: v => v.trim().length >= 2 || 'Укажите имя — хотя бы 2 буквы',
  phone: v => v.replace(/\D/g, '').length === 11 || 'Введите номер полностью: +7 и 10 цифр',
  type: v => !!v || 'Выберите тип техники',
  message: v => v.trim().length >= 10 || 'Опишите поломку чуть подробнее (от 10 символов)',
  agree: (v, el) => el.checked || 'Нужно согласие на обработку данных'
};
function validate(el) {
  const rule = rules[el.name];
  if (!rule) return true;
  const res = rule(el.value, el);
  const field = el.closest('.field');
  const err = $('.field__error', field);
  const ok = res === true;
  field.classList.toggle('is-invalid', !ok);
  el.setAttribute('aria-invalid', String(!ok));
  err.textContent = ok ? '' : res;
  return ok;
}
form.addEventListener('blur', e => { if (e.target.name in rules && e.target.value) validate(e.target); }, true);
form.addEventListener('input', e => { if (e.target.closest('.is-invalid')) validate(e.target); });
form.addEventListener('change', e => { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') validate(e.target); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const fields = Object.keys(rules).map(n => form.elements[n]);
  const bad = fields.filter(el => !validate(el));
  if (bad.length) { bad[0].focus(); return; }
  const btn = $('button[type=submit]', form);
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Отправляем…';
  setTimeout(() => {
    btn.disabled = false; btn.innerHTML = label;
    const ok = $('.form__success', form);
    ok.hidden = false; ok.focus();
    if (window.__motion && !reduce) window.__motion.animate(ok, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.45 });
  }, 900);
});
$('[data-reset]', form).addEventListener('click', () => {
  form.reset();
  $$('.is-invalid', form).forEach(f => f.classList.remove('is-invalid'));
  $('.form__success', form).hidden = true;
  form.elements.name.focus();
});

$('[data-year]').textContent = new Date().getFullYear();

/* ---------- Анимации ---------- */
const revealEls = $$('[data-reveal]');

function fallbackAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('revealed'); obs.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => obs.observe(el));
  heroWords.forEach((w, i) => setTimeout(() => w.classList.add('revealed'), 80 * i));
  const so = new IntersectionObserver(en => { if (en[0].isIntersecting) stWords.forEach(w => w.classList.add('on')); }, { threshold: .3 });
  so.observe(statement);
}

function motionAnimations({ animate, inView, scroll, stagger }) {
  const ease = [0.2, 0.7, 0.2, 1];
  // Заголовок героя — слова «выезжают» по очереди
  animate(heroWords, { opacity: [0, 1], y: [48, 0], filter: ['blur(8px)', 'blur(0px)'] },
    { delay: stagger(0.07, { startDelay: 0.1 }), duration: 0.9, ease });

  // Появление блоков при скролле, с лёгкой очередью внутри группы
  revealEls.forEach(el => {
    inView(el, () => {
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      const i = Math.max(0, sibs.indexOf(el));
      animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 0.85, delay: (i % 5) * 0.07 + (el.closest('.hero') ? 0.45 : 0), ease });
    }, { margin: '0px 0px -8% 0px' });
  });

  // Фото героя раскрывается при прокрутке (как на продуктовых страницах)
  const media = $('[data-hero-media]');
  const img = $('img', media);
  scroll(animate(media, { scale: [0.88, 1] }, { ease: 'linear' }), { target: media, offset: ['start end', 'start 25%'] });
  scroll(animate(img, { scale: [1.15, 1] }, { ease: 'linear' }), { target: media, offset: ['start end', 'end start'] });

  // Слова манифеста загораются по мере прокрутки
  scroll(p => {
    const n = Math.round(p * stWords.length * 1.1);
    stWords.forEach((w, i) => w.classList.toggle('on', i < n));
  }, { target: statement, offset: ['start 75%', 'end 75%'] });
}

if (reduce) {
  revealEls.forEach(el => el.classList.add('revealed'));
  heroWords.forEach(w => w.classList.add('revealed'));
  stWords.forEach(w => w.classList.add('on'));
} else {
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
  Promise.race([import('https://cdn.jsdelivr.net/npm/motion@12/+esm'), timeout])
    .then(m => { window.__motion = m; motionAnimations(m); })
    .catch(() => fallbackAnimations());
}
