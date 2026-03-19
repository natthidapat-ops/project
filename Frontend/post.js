const API  = 'http://localhost:8000';
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user) {
      document.getElementById('nav-login').textContent = '👤 ' + user.name;
      document.getElementById('nav-login').href = 'my.html';
    }

    const logoutBtn = document.getElementById('nav-logout');
    if (user) logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      location.href = 'login.html';
    });

    function previewImage(input) {
      const preview = document.getElementById('preview');
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    async function postListing() {
      const btn = document.getElementById('submit-btn');
      btn.disabled    = true;
      btn.textContent = 'กำลังบันทึก...';

      const formData = new FormData();
      formData.append('user_id',     user?.id || 1);
      formData.append('title',       document.getElementById('title').value);
      formData.append('description', document.getElementById('description').value);
      formData.append('price',       document.getElementById('price').value);
      formData.append('category',    document.getElementById('category').value);
      formData.append('condition',   document.getElementById('condition').value);
      formData.append('status',      'active');

      const imageFile = document.getElementById('image').files[0];
      if (imageFile) formData.append('image', imageFile);

      const res  = await fetch(`${API}/listings`, { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        toast('ลงประกาศสำเร็จ! 🎉', 'ok');
        setTimeout(() => location.href = 'index.html', 1500);
      } else {
        toast(data.message || 'เกิดข้อผิดพลาด', 'err');
        btn.disabled    = false;
        btn.textContent = 'ลงประกาศ';
      }
    }
