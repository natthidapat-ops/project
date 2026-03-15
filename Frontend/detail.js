const API   = 'http://localhost:8000';
    const ICONS = {'อิเล็กทรอนิกส์':'📱','เฟอร์นิเจอร์':'🛋️','แฟชั่น':'👜','กีฬา':'🚴','หนังสือ':'📚','อื่นๆ':'📦'};
    const id    = new URLSearchParams(location.search).get('id');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');

    if (user) {
      document.getElementById('nav-login').textContent = '👤 ' + user.name;
      document.getElementById('nav-login').href = 'my.html';
    }

    // SPI 2 — GET /listings/:id
    async function loadDetail() {
      const res  = await fetch(`${API}/listings/${id}`);
      const item = await res.json();

      // แสดงรูปถ้ามี ถ้าไม่มีแสดง emoji
      const imgEl = document.getElementById('img');
      if (item.image_url) {
        imgEl.innerHTML = `<img src="${API}${item.image_url}" alt="${item.title}">`;
      } else {
        imgEl.textContent = ICONS[item.category] || '📦';
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

    // SPI 5 — POST /messages
    async function sendMsg() {
      const content = document.getElementById('msg-text').value.trim();
      if (!content) return;

      const res  = await fetch(`${API}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: id,
          sender_id:  user?.id || 1,
          content:    content
        })
      });
      const data    = await res.json();
      const alertEl = document.getElementById('alert');

      if (res.ok) {
        alertEl.className   = 'alert alert-ok';
        alertEl.textContent = data.message;
        document.getElementById('msg-text').value = '';
        document.getElementById('msg-list').innerHTML += `
          <div class="msg-bubble">
            <div class="msg-sender">${user?.name || 'คุณ'}</div>
            <div>${content}</div>
          </div>
        `;
        setTimeout(() => { alertEl.textContent=''; alertEl.className=''; }, 3000);
      } else {
        alertEl.className   = 'alert alert-err';
        alertEl.textContent = data.message;
      }
    }

    loadDetail();