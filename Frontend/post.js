const API  = 'http://localhost:8000';
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user) {
      document.getElementById('nav-login').textContent = '👤 ' + user.name;
      document.getElementById('nav-login').href = 'my.html';
    }

    // แสดง preview รูปก่อนอัปโหลด
    function previewImage(input) {
      const preview = document.getElementById('preview');
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src     = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    // SPI 3 — POST /listings
    // ใช้ FormData แทน JSON เพราะต้องส่งไฟล์รูปด้วย
    async function postListing() {
      const btn = document.getElementById('submit-btn');
      btn.disabled    = true;
      btn.textContent = 'กำลังบันทึก...';

      // ใช้ FormData แทน JSON เพราะมีไฟล์รูป
      const formData = new FormData();
      formData.append('user_id',     user?.id || 1);
      formData.append('title',       document.getElementById('title').value);
      formData.append('description', document.getElementById('description').value);
      formData.append('price',       document.getElementById('price').value);
      formData.append('category',    document.getElementById('category').value);
      formData.append('condition',   document.getElementById('condition').value);
      formData.append('status', 'active');

      // เพิ่มรูปถ้ามีการเลือก
      const imageFile = document.getElementById('image').files[0];
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // ไม่ต้องใส่ Content-Type เพราะ browser จะจัดการให้เองตอนส่ง FormData
      const res  = await fetch(`${API}/listings`, {
        method: 'POST',
        body:   formData
      });
      const data    = await res.json();
      const alertEl = document.getElementById('alert');

      if (res.ok) {
        alertEl.className   = 'alert alert-ok';
        alertEl.textContent = data.message;
        setTimeout(() => location.href = 'index.html', 1500);
      } else {
        alertEl.className   = 'alert alert-err';
        alertEl.textContent = data.message || 'เกิดข้อผิดพลาด';
        btn.disabled    = false;
        btn.textContent = 'ลงประกาศ';
      }
    }
    // Logout
    const logoutBtn = document.getElementById('nav-logout');
    if (user) logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      location.href = 'login.html';
    });
