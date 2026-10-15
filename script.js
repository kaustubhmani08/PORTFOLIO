// Loader
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader')?.classList.add('hidden'), 500);
});

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Navbar scroll state
const nav = document.getElementById('navbar');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  const h = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  document.getElementById('scroll-progress').style.width = pct + '%';
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile nav
document.getElementById('navToggle')?.addEventListener('click', () => {
  nav.classList.toggle('open');
});
nav.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Cursor glow
const glow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', e => {
  glow.style.opacity = '1';
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});
window.addEventListener('mouseout', () => glow.style.opacity = '0');

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      // Animate bars
      e.target.querySelectorAll?.('.bar').forEach(b => b.classList.add('fill'));
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Typing effect
const phrases = [
  'AI & Tech Explorer',
  'Future CSE Student',
  'Aspiring AI Engineer',
  'Creative Problem Solver',
  'Technology Enthusiast',
];
const typedEl = document.getElementById('typed');
let pi = 0, ci = 0, deleting = false;
function tick() {
  const word = phrases[pi];
  typedEl.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) {
    ci++; setTimeout(tick, 70);
  } else if (deleting && ci > 0) {
    ci--; setTimeout(tick, 35);
  } else {
    if (!deleting) { deleting = true; setTimeout(tick, 1400); }
    else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 200); }
  }
}
tick();

// =============== Contact form → Supabase ===============
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const statusEl = document.getElementById('contactStatus');
  const btn = document.getElementById('contactSubmit');

  let sb = null;
  try {
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY
        && !window.SUPABASE_URL.includes('YOUR_SUPABASE')) {
      sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
  } catch (e) { console.warn('Supabase init failed', e); }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name: (fd.get('name') || '').toString().trim().slice(0, 100),
      email: (fd.get('email') || '').toString().trim().slice(0, 200),
      subject: (fd.get('subject') || '').toString().trim().slice(0, 200),
      message: (fd.get('message') || '').toString().trim().slice(0, 2000),
    };
    if (!payload.name || !payload.email || !payload.message) {
      statusEl.textContent = 'Please fill in name, email and message.';
      statusEl.className = 'form-status err';
      return;
    }
    if (!sb) {
      statusEl.textContent = 'Backend not configured yet. Add your Supabase URL & key in supabase-config.js.';
      statusEl.className = 'form-status err';
      return;
    }
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const { error } = await sb.from('contact_messages').insert(payload);
    btn.disabled = false;
    btn.textContent = original;
    if (error) {
      console.error(error);
      statusEl.textContent = 'Could not send message: ' + error.message;
      statusEl.className = 'form-status err';
    } else {
      form.reset();
      statusEl.textContent = '✓ Thanks! Your message has been saved. I\'ll get back to you soon.';
      statusEl.className = 'form-status ok';
    }
  });
})();
