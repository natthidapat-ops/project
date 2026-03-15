const API   = 'http://localhost:8000';
    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.id || 1;
    const ICONS = {'อิเล็กทรอนิกส์':'📱','เฟอร์นิเจอร์':'🛋️','แฟชั่น':'👜','กีฬา':'🚴','หนังสือ':'📚','อื่นๆ':'📦'};

    if (user) {
      document.getElementById('nav-login').textContent = '👤 ' + user.name;
      document.getElementById('nav-login').href = '#';
    }

    async function loadMyListings() {
      const res  = await fetch(`${API}/listings/user/${userId}`);
      const data = await res.json();

      const active = data.filter(l => l.status === 'active');
      const closed = data.filter(l => l.status !== 'active');
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
            <div style="font-family:'Prompt',sans-serif;font-weight:600;color:var(--accent);font-size:16px;margin-right:10px">
              ฿${Number(item.price).toLocaleString()}
            </div>
            <button class="btn btn-secondary" style="padding:6px 14px;font-size:13px" onclick="location.href='detail.html?id=${item.id}'">ดู</button>
            <button class="btn btn-danger"    style="padding:6px 14px;font-size:13px;margin-left:6px" onclick="closeListing(${item.id})">ปิด</button>
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

    // SPI 4 — DELETE /listings/:id
    async function closeListing(id) {
      if (!confirm('ต้องการปิดประกาศนี้?')) return;
      await fetch(`${API}/listings/${id}`, { method: 'DELETE' });
      loadMyListings();
    }

    loadMyListings();