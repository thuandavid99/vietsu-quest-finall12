document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. MOBILE NAV ─────────────────────────────────── */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      mobileToggle.classList.toggle('is-open');
    });
    mainNav.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mobileToggle.classList.remove('is-open');
      })
    );
  }

  /* ── 2. HEADER SCROLL STATE ────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) window.addEventListener('scroll', () =>
    header.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  /* ── 3. SCROLL REVEAL ──────────────────────────────── */
  const rvIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); rvIO.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => rvIO.observe(el));

  /* ── 4. HERO PARTICLES ─────────────────────────────── */
  const heroSec = document.querySelector('.hero-section');
  if (heroSec) {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    heroSec.prepend(c);
    const cx = c.getContext('2d');
    let W, H, pts = [];
    const resize = () => { W = c.width = heroSec.offsetWidth; H = c.height = heroSec.offsetHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < 48; i++) pts.push({
      x: Math.random() * 1e3, y: Math.random() * 600,
      r: .8 + Math.random() * 2.2, vx: (Math.random() - .5) * .35, vy: -.15 - Math.random() * .4,
      a: .12 + Math.random() * .35, h: 15 + Math.random() * 30
    });
    (function loop() {
      cx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
        if (p.x < -8) p.x = W + 8; if (p.x > W + 8) p.x = -8;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.28);
        cx.fillStyle = `hsla(${p.h},85%,58%,${p.a})`; cx.fill();
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ── 5. COUNTER ANIMATION ──────────────────────────── */
  function countUp(el, end, suf = '') {
    const dur = 1400, t0 = performance.now();
    const run = now => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * end) + suf;
      if (p < 1) requestAnimationFrame(run); else el.textContent = end + suf;
    };
    requestAnimationFrame(run);
  }
  const statIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, raw = el.textContent.trim();
      if (!/^\d+\+?$/.test(raw)) { statIO.unobserve(el); return; }
      countUp(el, parseInt(raw, 10), raw.includes('+') ? '+' : '');
      statIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-number').forEach(el => statIO.observe(el));

  /* hero mini-grid numbers */
  const hIO = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.hero-mini-grid strong').forEach(el => {
      const raw = el.textContent.trim();
      const num = parseInt(raw, 10);
      if (!isNaN(num)) countUp(el, num, raw.includes('+') ? '+' : '');
    });
    hIO.disconnect();
  }, { threshold: 0.5 });
  const hmg = document.querySelector('.hero-mini-grid');
  if (hmg) hIO.observe(hmg);

  /* ── 6. COURSE TABS ────────────────────────────────── */
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.course-card').forEach(card => {
        const show = f === 'all' || card.dataset.level === f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ── 7. MODAL SYSTEM ───────────────────────────────── */
  const overlay  = document.getElementById('vsModal');
  const mBox     = document.getElementById('vsModalBox');
  const mClose   = document.getElementById('vsModalClose');

  function openModal(html, wide = false) {
    if (!overlay) return;
    mBox.innerHTML = html;
    mBox.classList.toggle('modal-wide', wide);
    overlay.classList.add('visible');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => mBox.classList.add('modal-entered'));
  }
  function closeModal() {
    if (!overlay) return;
    mBox.classList.remove('modal-entered');
    setTimeout(() => { overlay.classList.remove('visible'); document.body.classList.remove('modal-open'); }, 260);
  }
  if (mClose) mClose.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  window._closeModal = closeModal;

  /* ── 8. COURSE CARD MODAL ──────────────────────────── */
  document.querySelectorAll('.btn-course-open').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const d = JSON.parse(btn.closest('.course-card')?.dataset.course || '{}');
      const lessons = (d.lessonList || []).map((l, i) =>
        `<li><span class="ln">${i+1}</span>${l}</li>`).join('');
      const objs = (d.objectives || []).map(o => `<span class="obj-tag">✓ ${o}</span>`).join('');
      const meths = (d.methods || []).map(m => `<span class="meth-pill">🔧 ${m}</span>`).join('');
      openModal(`<div class="mc">
        <div class="mc-head" style="border-top:5px solid ${d.color||'#ff7a1a'}">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
            <span class="mc-grade" style="background:${d.color||'#ff7a1a'}">Lớp ${d.grade}</span>
            <span class="mc-theme">${d.theme||''}</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:1.4rem">${d.title}</h2>
          <p style="color:#667085;margin:0 0 14px">${d.description}</p>
          <div class="mc-stats"><span>📚 ${d.lessons} bài</span><span>🎯 ${d.quizzes} quiz</span></div>
        </div>
        <div class="mc-body">
          <div class="ms"><h4>📋 Nội dung chương trình</h4><ul class="ll">${lessons}</ul></div>
          <div class="ms"><h4>🎯 Mục tiêu</h4><div class="tw">${objs}</div></div>
          <div class="ms"><h4>🔧 Phương pháp</h4><div class="tw">${meths}</div></div>
        </div>
        <div class="mc-foot">
          <button class="mbp" onclick="showToast('Tính năng đang phát triển! 🚀 Sắp ra mắt.')">📖 Vào học ngay</button>
          <button class="mbs" onclick="window._closeModal()">Đóng</button>
        </div>
      </div>`, true);
    });
  });

  /* ── 9. RESOURCE MODAL ─────────────────────────────── */
  document.querySelectorAll('.btn-resource-open').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const d = JSON.parse(btn.closest('.resource-card')?.dataset.resource || '{}');
      const topics = (d.topics || []).map(t => `<li>✅ ${t}</li>`).join('');
      openModal(`<div class="mc">
        <div class="mc-head" style="border-top:5px solid #ff7a1a">
          <div style="display:flex;gap:16px;align-items:center;margin-bottom:12px">
            <span style="font-size:3rem">${d.icon||'📄'}</span>
            <div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
                <span class="mc-theme">${d.type}</span>
                <span class="mc-theme">Lớp ${d.grade}</span>
              </div>
              <h2 style="margin:0;font-size:1.3rem">${d.title}</h2>
            </div>
          </div>
          <p style="color:#667085;margin:0">${d.description}</p>
        </div>
        <div class="mc-body">
          <div class="ms"><h4>📝 Nội dung bao gồm</h4><ul class="ll">${topics}</ul></div>
          <div class="ms">
            <div class="mc-stats"><span>📁 ${d.format}</span><span>💾 ${d.size}</span></div>
          </div>
          <div style="background:#fff5eb;border:1.5px solid rgba(255,122,26,.3);border-radius:14px;padding:20px;margin-top:8px;text-align:center">
            <p style="margin:0 0 14px;color:#475467">📢 Tài liệu miễn phí khi website chính thức ra mắt.</p>
            <button class="mbp" onclick="showToast('🔔 Đã đăng ký nhận thông báo khi tài liệu có sẵn!')">🔔 Nhận thông báo</button>
          </div>
        </div>
      </div>`);
    });
  });

  /* ── 10. ARTICLE MODAL ─────────────────────────────── */
  document.querySelectorAll('.btn-article-open').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const d = JSON.parse(btn.closest('.article-card')?.dataset.article || '{}');
      openModal(`<div class="mc">
        <div class="mc-head" style="border-top:5px solid #ff7a1a">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <span class="mc-theme">${d.category}</span>
            <span style="font-size:.82rem;color:#667085">⏱ ${d.readTime} đọc</span>
          </div>
          <h2 style="margin:0;font-size:1.4rem">${d.title}</h2>
        </div>
        <div class="mc-body modal-article-body">${d.content}</div>
        <div class="mc-foot">
          <button class="mbs" onclick="window._closeModal()">Đóng bài viết</button>
        </div>
      </div>`, true);
    });
  });

  /* ── 11. MAP SPOT CLICK ────────────────────────────── */
  document.querySelectorAll('.map-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const d = JSON.parse(dot.dataset.spot || '{}');
      const evs = (d.events || []).map(ev => `<li>📌 ${ev}</li>`).join('');
      openModal(`<div class="mc">
        <div class="mc-head" style="border-top:5px solid ${d.color||'#ff7a1a'}">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
            <span class="mc-theme" style="background:${d.color||'#ff7a1a'}22;color:${d.color||'#ff7a1a'}">${d.region}</span>
            <span style="font-size:.85rem;color:#667085">⏳ ${d.period}</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:1.4rem">${d.title}</h2>
          <p style="color:#475467;margin:0">${d.note}</p>
        </div>
        <div class="mc-body">
          <div class="ms"><h4>📜 Sự kiện lịch sử</h4><ul class="ll">${evs}</ul></div>
        </div>
        <div class="mc-foot">
          <button class="mbs" onclick="window._closeModal()">Đóng</button>
        </div>
      </div>`);
    });
  });

  /* ── 12. TIMELINE CARD EXPAND ──────────────────────── */
  document.querySelectorAll('.timeline-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      document.querySelectorAll('.timeline-card.tl-expanded').forEach(c => { if (c !== card) c.classList.remove('tl-expanded'); });
      card.classList.toggle('tl-expanded');
    });
  });

  /* ── 13. CHAT TYPING INDICATOR ─────────────────────── */
  const chatForm  = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatWin   = document.getElementById('chatWindow');

  function appendMsg(text, type) {
    if (!chatWin) return;
    const m = document.createElement('div');
    m.className = `message ${type === 'user' ? 'user-message' : 'bot-message'}`;
    m.style.opacity = '0'; m.style.transform = 'translateY(6px)';
    m.textContent = text;
    chatWin.appendChild(m);
    chatWin.scrollTop = chatWin.scrollHeight;
    requestAnimationFrame(() => { m.style.transition = 'all .3s'; m.style.opacity = '1'; m.style.transform = 'none'; });
  }

  function showTyping() {
    const el = document.createElement('div');
    el.id = 'typingDots'; el.className = 'message bot-message typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    if (chatWin) { chatWin.appendChild(el); chatWin.scrollTop = chatWin.scrollHeight; }
    return el;
  }

  async function sendMsg(message) {
    appendMsg(message, 'user');
    const typing = showTyping();
    try {
      const r = await fetch('/api/chat-demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      const data = await r.json();
      typing.remove();
      appendMsg(data.reply || 'Mình chưa trả lời được câu này.', 'bot');
    } catch {
      typing.remove();
      appendMsg('Không thể kết nối chatbot. Thử lại sau nhé!', 'bot');
    }
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = chatInput.value.trim(); if (!msg) return;
      chatInput.value = ''; chatInput.focus();
      await sendMsg(msg);
    });
  }
  document.querySelectorAll('.suggestion-chip').forEach(chip =>
    chip.addEventListener('click', async () => {
      const msg = chip.textContent.trim();
      if (chatInput) chatInput.value = msg;
      await sendMsg(msg);
    })
  );

  /* ── 14. SMOOTH SCROLL WITH OFFSET ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  /* ── 15. FOOTER CODE COPY ──────────────────────────── */
  document.querySelectorAll('.footer-links code').forEach(code => {
    code.style.cursor = 'pointer'; code.title = 'Click để copy';
    code.addEventListener('click', () => {
      navigator.clipboard.writeText(code.textContent).then(() => showToast('📋 Copied: ' + code.textContent)).catch(() => {});
    });
  });

}); // DOMContentLoaded

/* ── TOAST (global) ─────────────────────────────────────── */
function showToast(msg, dur = 3000) {
  let wrap = document.getElementById('vsToasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.id = 'vsToasts'; document.body.appendChild(wrap); }
  const t = document.createElement('div'); t.className = 'vs-toast'; t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast-show'));
  setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 350); }, dur);
}
window.showToast = showToast;

/* ── TICKER BAR AUTO-INJECT ────────────────────────────── */
(function injectTicker() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const items = [
    '⚔️ 938 – Ngô Quyền chiến thắng Bạch Đằng',
    '🏯 1010 – Lý Thái Tổ dời đô ra Thăng Long',
    '🛡️ 1288 – Trần Hưng Đạo đại phá quân Nguyên',
    '👑 1428 – Lê Lợi lên ngôi, lập nhà Hậu Lê',
    '⚡ 1789 – Quang Trung đại phá 29 vạn quân Thanh',
    '⭐ 1945 – Cách mạng tháng Tám thành công',
    '🚩 1954 – Chiến thắng Điện Biên Phủ lẫy lừng',
    '🇻🇳 1975 – Đất nước thống nhất hoàn toàn'
  ];
  const doubled = [...items, ...items];
  const html = doubled.map(t =>
    `<span class="ticker-item"><span class="ticker-dot"></span>${t}</span>`
  ).join('');
  const bar = document.createElement('div');
  bar.className = 'ticker-bar';
  bar.innerHTML = `<div class="ticker-track">${html}</div>`;
  header.insertAdjacentElement('afterend', bar);
})();

/* ── NAV GAMES DROPDOWN ────────────────────────────────── */
(function navDropdown() {
  const dropdown = document.querySelector('.nav-games-dropdown');
  const toggle   = dropdown?.querySelector('.nav-games-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));
})();

/* ── HERO AUTO COUNTER (runs immediately) ──────────────── */
(function heroCounter() {
  function countUp(el, end, suf) {
    const dur = 1800, t0 = performance.now();
    const run = now => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * end) + suf;
      if (p < 1) requestAnimationFrame(run); else el.textContent = end + suf;
    };
    requestAnimationFrame(run);
  }
  const nums = [
    { sel: '.hero-mini-grid div:nth-child(1) strong', val: 7,   suf: '' },
    { sel: '.hero-mini-grid div:nth-child(2) strong', val: 40,  suf: '+' },
    { sel: '.hero-mini-grid div:nth-child(3) strong', val: 120, suf: '+' }
  ];
  setTimeout(() => {
    nums.forEach(({ sel, val, suf }) => {
      const el = document.querySelector(sel);
      if (el) countUp(el, val, suf);
    });
  }, 600);
})();
