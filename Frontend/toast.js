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


// confirm dialog — แทน browser confirm()
// ใช้: confirmDialog('ข้อความ', callbackFn)
function confirmDialog(message, onConfirm) {
  // ลบอันเก่าถ้ามี
  const old = document.getElementById('confirm-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(44,36,23,0.35);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn .15s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background: #fff;
      border-radius: 16px;
      padding: 28px 32px;
      max-width: 360px;
      width: 90%;
      box-shadow: 0 8px 40px rgba(44,36,23,0.18);
      font-family: 'Sarabun', sans-serif;
      animation: slideUp .2s ease;
    ">
      <div style="font-size:32px;text-align:center;margin-bottom:12px"></div>
      <div style="font-size:16px;font-weight:500;color:#2c2417;text-align:center;margin-bottom:20px;line-height:1.5">${message}</div>
      <div style="display:flex;gap:10px;">
        <button id="confirm-cancel" style="
          flex:1; padding:11px; border-radius:10px;
          border:1.5px solid #e0d5c8; background:#fff;
          font-size:14px; cursor:pointer; font-family:'Sarabun',sans-serif;
          color:#7a6a58; transition:all .18s;
        ">ยกเลิก</button>
        <button id="confirm-ok" style="
          flex:1; padding:11px; border-radius:10px;
          border:none; background:#c8622a;
          font-size:14px; cursor:pointer; font-family:'Sarabun',sans-serif;
          color:#fff; font-weight:500; transition:all .18s;
        ">ยืนยัน</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('confirm-ok').onclick = () => {
    overlay.remove();
    onConfirm();
  };
  document.getElementById('confirm-cancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}