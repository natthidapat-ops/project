// toast.js — ใช้ร่วมกันทุกหน้า
// เรียกใช้: toast('ข้อความ', 'ok') หรือ toast('ข้อความ', 'err') หรือ toast('ข้อความ', 'info')

function toast(message, type = 'ok', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { ok: '✅', err: '❌', info: 'ℹ️' };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  }, duration);
}
