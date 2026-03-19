const API = 'http://localhost:8000';

    function switchTab(tab) {
      document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
      document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
      document.getElementById('tab-login').className    = 'auth-tab' + (tab === 'login'    ? ' active' : '');
      document.getElementById('tab-register').className = 'auth-tab' + (tab === 'register' ? ' active' : '');
    }

    async function login() {
      const res  = await fetch(`${API}/users/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    document.getElementById('login-email').value,
          password: document.getElementById('login-password').value
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast('เข้าสู่ระบบสำเร็จ 🎉', 'ok');
        localStorage.setItem('user', JSON.stringify(data.data));
        setTimeout(() => location.href = 'index.html', 1200);
      } else {
        toast(data.message || 'เกิดข้อผิดพลาด', 'err');
      }
    }

    async function register() {
      const res  = await fetch(`${API}/users`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        document.getElementById('reg-name').value,
          email:       document.getElementById('reg-email').value,
          password:    document.getElementById('reg-password').value,
          description: document.getElementById('reg-desc').value
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ', 'ok');
        switchTab('login');
      } else {
        toast(data.message || 'เกิดข้อผิดพลาด', 'err');
      }
    }
