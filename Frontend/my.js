const API   = 'http://localhost:8000';
    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    const ICONS = {'อิเล็กทรอนิกส์':'📱','เฟอร์นิเจอร์':'🛋️','แฟชั่น':'👜','กีฬา':'🚴','หนังสือ':'📚','อื่นๆ':'📦'};

    if (!user) location.href = 'login.html';
    const userId = user?.id;

    if (user) {
      document.getElementById('nav-login').textContent = '👤 ' + user.name;
      document.getElementById('nav-login').href = '#';
      document.getElementById('nav-logout').style.display = 'inline-block';
    }
    document.getElementById('nav-logout').addEventListener('click', () => {
      confirmDialog('ต้องการออกจากระบบ?', () => {
        localStorage.removeItem('user');
        toast('ออกจากระบบแล้ว', 'info');
        setTimeout(() => location.href = 'login.html', 1000);
      });
    });

    function switchTab(tab) {
      document.getElementById('inbox-panel').style.display = tab === 'inbox' ? 'block' : 'none';
      document.getElementById('sent-panel').style.display  = tab === 'sent'  ? 'block' : 'none';
      document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', (i === 0 && tab === 'inbox') || (i === 1 && tab === 'sent'));
      });
    }

    async function loadMyListings() {
      const res  = await fetch(`${API}/listings/user/${userId}`);
      const data = await res.json();
      const active = data.filter(l => l.status === 'active');
      const sold   = data.filter(l => l.status === 'sold');
      const closed = data.filter(l => l.status === 'closed');
      const list   = document.getElementById('list');

      if (!data.length) {
        list.innerHTML = '<div class="empty"><div class="empty-icon">📋</div><p>ยังไม่มีประกาศ</p></div>';
        return;
      }

      let html = '';
      if (active.length) {
        html += `<div class="sect-label" style="color:var(--green)">เปิดอยู่ (${active.length})</div>`;
        html += active.map(item => `
          <div class="my-row">
            <div class="my-icon">${ICONS[item.category]||'📦'}</div>
            <div style="flex:1">
              <div style="font-weight:500;font-size:14px">${item.title}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">${item.category} · ${item.condition}</div>
            </div>
            <div style="font-family:'Prompt',sans-serif;font-weight:600;color:var(--accent);font-size:16px;margin-right:10px">฿${Number(item.price).toLocaleString()}</div>
            <button class="btn btn-secondary" style="padding:6px 14px;font-size:13px" onclick="location.href='detail.html?id=${item.id}'">ดู</button>
            <button class="btn btn-primary" style="padding:6px 14px;font-size:13px;margin-left:6px;background:#3a7c57;border-color:#3a7c57" onclick="markSold(${item.id})">ขายแล้ว ✅</button>
            <button class="btn btn-danger" style="padding:6px 14px;font-size:13px;margin-left:6px" onclick="closeListing(${item.id})">ปิด</button>
          </div>
        `).join('');
      }
      if (sold.length) {
        html += `<div class="sect-label" style="margin-top:24px;color:var(--green)">ขายแล้ว (${sold.length})</div>`;
        html += sold.map(item => `
          <div class="my-row" style="opacity:.6">
            <div class="my-icon">${ICONS[item.category]||'📦'}</div>
            <div style="flex:1;font-size:14px">${item.title}</div>
            <span style="font-size:12px;background:#d4edda;color:#1b5e20;padding:3px 10px;border-radius:20px">ขายแล้ว</span>
          </div>
        `).join('');
      }
      if (closed.length) {
        html += `<div class="sect-label" style="margin-top:24px">ปิดแล้ว (${closed.length})</div>`;
        html += closed.map(item => `
          <div class="my-row" style="opacity:.45">
            <div class="my-icon">${ICONS[item.category]||'📦'}</div>
            <div style="flex:1;font-size:14px">${item.title}</div>
            <span style="font-size:12px;color:var(--muted)">ปิดแล้ว</span>
          </div>
        `).join('');
      }
      list.innerHTML = html;
    }

    async function loadInbox() {
      const res  = await fetch(`${API}/messages/inbox/${userId}`);
      const data = await res.json();
      const box  = document.getElementById('inbox');

      if (!data.length) {
        box.innerHTML = '<div class="empty"><div class="empty-icon">📥</div><p>ยังไม่มีข้อความ</p></div>';
        return;
      }

      box.innerHTML = data.map(msg => `
        <div class="my-row" style="flex-direction:column;align-items:flex-start;gap:6px">
          <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
            <span style="font-weight:500;font-size:13px">💬 จาก <b>${msg.sender_name}</b></span>
            <span style="font-size:12px;color:var(--muted)">ประกาศ: ${msg.listing_title}</span>
          </div>
          <div style="font-size:14px;background:var(--warm);padding:8px 12px;border-radius:8px;width:100%">${msg.content}</div>
          ${msg.reply
            ? `<div style="margin-top:4px;background:var(--acc-lt);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--accent);border-left:3px solid var(--accent);width:100%">↩ ตอบแล้ว: ${msg.reply}</div>`
            : `<div style="display:flex;gap:8px;width:100%;margin-top:4px">
                <textarea id="reply-text-${msg.id}" placeholder="พิมพ์ตอบกลับ..." rows="2" style="flex:1;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:'Sarabun',sans-serif;resize:none;outline:none;"></textarea>
                <button class="btn btn-primary" style="padding:6px 14px;font-size:13px;white-space:nowrap" onclick="sendReply(${msg.id})">ตอบกลับ</button>
               </div>`
          }
          <button class="btn btn-secondary" style="padding:4px 12px;font-size:12px" onclick="location.href='detail.html?id=${msg.listing_id}'">ไปที่ประกาศ</button>
        </div>
      `).join('');
    }

    async function loadSent() {
      const res  = await fetch(`${API}/messages/sent/${userId}`);
      const data = await res.json();
      const box  = document.getElementById('sent');

      if (!data.length) {
        box.innerHTML = '<div class="empty"><div class="empty-icon">📤</div><p>ยังไม่ได้ส่งข้อความ</p></div>';
        return;
      }

      box.innerHTML = data.map(msg => `
        <div class="my-row" style="flex-direction:column;align-items:flex-start;gap:6px">
          <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
            <span style="font-weight:500;font-size:13px">ถึง <b>${msg.owner_name}</b></span>
            <span style="font-size:12px;color:var(--muted)">ประกาศ: ${msg.listing_title}</span>
          </div>
          <div style="font-size:14px;background:var(--warm);padding:8px 12px;border-radius:8px;width:100%">${msg.content}</div>
          ${msg.reply
            ? `<div style="margin-top:4px;background:var(--acc-lt);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--accent);border-left:3px solid var(--accent);width:100%">↩ ตอบกลับ: ${msg.reply}</div>`
            : `<div style="font-size:12px;color:var(--muted);font-style:italic">ยังไม่ได้รับการตอบกลับ</div>`
          }
          <button class="btn btn-secondary" style="padding:4px 12px;font-size:12px" onclick="location.href='detail.html?id=${msg.listing_id}'">ไปที่ประกาศ</button>
        </div>
      `).join('');
    }

    async function sendReply(msgId) {
      const textarea = document.getElementById(`reply-text-${msgId}`);
      const reply    = textarea?.value.trim();
      if (!reply) { toast('กรุณากรอกข้อความตอบกลับ', 'info'); return; }

      const res  = await fetch(`${API}/messages/${msgId}/reply`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      });
      const data = await res.json();
      if (res.ok) { toast('ตอบกลับสำเร็จ ✅', 'ok'); loadInbox(); }
      else toast(data.message, 'err');
    }

    function markSold(id) {
      confirmDialog('ยืนยันว่าขายสินค้านี้แล้ว?', async () => {
        const res = await fetch(`${API}/listings/${id}/sold`, { method: 'PATCH' });
        if (res.ok) { toast('ขายแล้ว! 🎉', 'ok'); loadMyListings(); }
        else toast('เกิดข้อผิดพลาด', 'err');
      });
    }

    function closeListing(id) {
      confirmDialog('ต้องการปิดประกาศนี้?', async () => {
        const res = await fetch(`${API}/listings/${id}`, { method: 'DELETE' });
        if (res.ok) { toast('ปิดประกาศแล้ว', 'info'); loadMyListings(); }
        else toast('เกิดข้อผิดพลาด', 'err');
      });
    }

    loadMyListings();
    loadInbox();
    loadSent();