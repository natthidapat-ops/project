const API   = 'http://localhost:8000';
    const ICONS = {'อิเล็กทรอนิกส์':'📱','เฟอร์นิเจอร์':'🛋️','แฟชั่น':'👜','กีฬา':'🚴','หนังสือ':'📚','อื่นๆ':'📦'};
    const id    = new URLSearchParams(location.search).get('id');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');

    if (user) {
      document.getElementById('nav-login').textContent = '👤 ' + user.name;
      document.getElementById('nav-login').href = 'my.html';
      document.getElementById('nav-logout').style.display = 'inline-block';
    }
    document.getElementById('nav-logout').addEventListener('click', () => {
      localStorage.removeItem('user');
      location.href = 'login.html';
    });

    async function loadDetail() {
      const res  = await fetch(`${API}/listings/${id}`);
      const item = await res.json();

      const imgEl = document.getElementById('img');
      if (item.image_url) {
        imgEl.innerHTML = `<img src="${API}/uploads/${item.image_url}" alt="${item.title}">`;
      } else {
        imgEl.textContent = ICONS[item.category] || '📦';
      }

      if (item.status === 'sold' || item.status === 'closed') {
        const badge = document.createElement('div');
        badge.style.cssText = 'display:inline-block;background:#fdecea;color:#c62828;border-radius:20px;padding:3px 12px;font-size:12px;font-weight:500;margin-bottom:8px';
        badge.textContent = item.status === 'sold' ? '✅ ขายแล้ว' : '🔒 ปิดประกาศ';
        document.getElementById('title').before(badge);
      }

      document.getElementById('title').textContent        = item.title;
      document.getElementById('price').textContent        = '฿' + Number(item.price).toLocaleString();
      document.getElementById('desc').textContent         = item.description || '';
      document.getElementById('seller').textContent       = item.seller_name;
      document.getElementById('seller-email').textContent = item.seller_email;
      document.getElementById('meta').innerHTML = `
        <span class="badge">${item.category}</span>
        <span class="badge badge-green">${item.condition}</span>
      `;
      document.title = 'SecondLife — ' + item.title;
    }

    async function sendMsg() {
      if (!user) { toast('กรุณาเข้าสู่ระบบก่อนส่งข้อความ', 'err'); return; }
      const content = document.getElementById('msg-text').value.trim();
      if (!content) { toast('กรุณากรอกข้อความ', 'info'); return; }

      const res  = await fetch(`${API}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id, sender_id: user.id, content })
      });
      const data = await res.json();

      if (res.ok) {
        toast('ส่งข้อความสำเร็จ ✅', 'ok');
        document.getElementById('msg-text').value = '';
      } else {
        toast(data.message, 'err');
      }
    }

    async function loadComments() {
      const res  = await fetch(`${API}/comments/${id}`);
      const data = await res.json();
      const box  = document.getElementById('comment-list');

      if (!data.length) {
        box.innerHTML = '<p style="font-size:13px;color:var(--muted);text-align:center;padding:10px 0">ยังไม่มีคอมเม้นท์</p>';
        return;
      }
      box.innerHTML = data.map(c => `
        <div class="msg-bubble">
          <div class="msg-sender">💬 ${c.author_name}</div>
          <div>${c.content}</div>
        </div>
      `).join('');
    }

    async function postComment() {
      if (!user) { toast('กรุณาเข้าสู่ระบบก่อนคอมเม้นท์', 'err'); return; }
      const content = document.getElementById('comment-text').value.trim();
      if (!content) { toast('กรุณากรอกคอมเม้นท์', 'info'); return; }

      const res  = await fetch(`${API}/comments`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id, user_id: user.id, content })
      });
      const data = await res.json();

      if (res.ok) {
        toast('โพสต์คอมเม้นท์สำเร็จ', 'ok');
        document.getElementById('comment-text').value = '';
        document.getElementById('comment-list').innerHTML += `
          <div class="msg-bubble">
            <div class="msg-sender">💬 ${user.name}</div>
            <div>${content}</div>
          </div>
        `;
      } else {
        toast(data.message, 'err');
      }
    }

    loadDetail();
    loadComments();
