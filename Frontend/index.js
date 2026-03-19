const API = 'http://localhost:8000';
    const ICONS = {
      'อิเล็กทรอนิกส์':'📱','เฟอร์นิเจอร์':'🛋️',
      'แฟชั่น':'👜','กีฬา':'🚴','หนังสือ':'📚','อื่นๆ':'📦'
    };

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      document.getElementById('nav-login').textContent = '👤 ' + user.name;
      document.getElementById('nav-login').href = 'my.html';
    }

    const logoutBtn = document.getElementById('nav-logout');
    if (user) logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      toast('ออกจากระบบแล้ว', 'info');
      setTimeout(() => location.href = 'login.html', 1000);
    });

    async function loadListings() {
      const search    = document.getElementById('search').value;
      const category  = document.getElementById('category').value;
      const condition = document.getElementById('condition').value;

      const p = new URLSearchParams();
      if (search)    p.set('search', search);
      if (category)  p.set('category', category);
      if (condition) p.set('condition', condition);

      const res  = await fetch(`${API}/listings?${p}`);
      const data = await res.json();
      const list = document.getElementById('list');

      document.getElementById('count').textContent = data.length + ' รายการ';

      if (!data.length) {
        list.innerHTML = '<div class="empty"><div class="empty-icon">🔍</div><p>ไม่พบสินค้า</p></div>';
        return;
      }

      list.innerHTML = data.map(item => `
        <a class="card" href="detail.html?id=${item.id}">
          <div class="card-img">
            ${item.image_url
              ? `<img src="${API}/uploads/${item.image_url}" alt="${item.title}">`
              : ICONS[item.category] || '📦'
            }
          </div>
          <div class="card-body">
            <div class="card-title">${item.title}</div>
            <div class="card-price">฿${Number(item.price).toLocaleString()}</div>
            <div class="card-meta">
              <span class="badge">${item.category}</span>
              <span class="badge badge-green">${item.condition}</span>
            </div>
            <div class="card-seller">โดย ${item.seller_name}</div>
          </div>
        </a>
      `).join('');
    }

    loadListings();
    document.getElementById('search').addEventListener('keydown', e => {
      if (e.key === 'Enter') loadListings();
    });
