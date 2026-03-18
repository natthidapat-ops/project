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

    // GET /listings/:id
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

    // POST /messages — ข้อความส่วนตัว
    async function sendMsg() {
      const alertEl = document.getElementById('msg-alert');
      if (!user) {
        alertEl.className   = 'alert alert-err';
        alertEl.textContent = 'กรุณาเข้าสู่ระบบก่อนส่งข้อความ';
        return;
      }
      const content = document.getElementById('msg-text').value.trim();
      if (!content) return;

      const res  = await fetch(`${API}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id, sender_id: user.id, content })
      });
      const data = await res.json();

      if (res.ok) {
        alertEl.className   = 'alert alert-ok';
        alertEl.textContent = 'ส่งข้อความแล้ว ✅';
        document.getElementById('msg-text').value = '';
        setTimeout(() => { alertEl.textContent = ''; alertEl.className = ''; }, 3000);
      } else {
        alertEl.className   = 'alert alert-err';
        alertEl.textContent = data.message;
      }
    }

    // GET /comments/:listingId — คอมเม้นท์สาธารณะ
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

    // POST /comments
    async function postComment() {
      const alertEl = document.getElementById('comment-alert');
      if (!user) {
        alertEl.className   = 'alert alert-err';
        alertEl.textContent = 'กรุณาเข้าสู่ระบบก่อนคอมเม้นท์';
        return;
      }
      const content = document.getElementById('comment-text').value.trim();
      if (!content) return;

      const res  = await fetch(`${API}/comments`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id, user_id: user.id, content })
      });
      const data = await res.json();

      if (res.ok) {
        document.getElementById('comment-text').value = '';
        document.getElementById('comment-list').innerHTML += `
          <div class="msg-bubble">
            <div class="msg-sender">💬 ${user.name}</div>
            <div>${content}</div>
          </div>
        `;
        alertEl.className = ''; alertEl.textContent = '';
      } else {
        alertEl.className   = 'alert alert-err';
        alertEl.textContent = data.message;
      }
    }

    loadDetail();
    loadComments();