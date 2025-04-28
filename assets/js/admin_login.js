const auth = firebase.auth();
const loginForm = document.getElementById('login-form');
const errorDiv = document.getElementById('login-error');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Login sukses:', userCredential.user);
      window.location.href = '/dashboard';
    })
    .catch((error) => {
      console.error('Login gagal:', error.message);
      showFriendlyError(error);
    });
});

function showFriendlyError(error) {
  let message = 'Terjadi kesalahan. Coba lagi.';
  
    console.log(error.code);

  switch (error.code) {
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      message = 'Email atau password salah. Silakan periksa kembali.';
      break;
    case 'auth/email-already-in-use':
      message = 'Email sudah digunakan. Silakan gunakan email lain.';
      break;
    case 'auth/too-many-requests':
      message = 'Terlalu banyak percobaan login. Coba lagi nanti.', 'error';
      break;
    case 'auth/network-request-failed':
      message = 'Koneksi internet bermasalah. Cek jaringan Anda.';
      break;
    case 'auth/internal-error':
      message = 'Ada masalah pada server atau data kosong. Coba isi semua field atau refresh browser Anda.', 'warning';
      break;
    default:
      message = error.message; // fallback default
  }

  
      errorDiv.textContent = "Login gagal: " + message;
}
