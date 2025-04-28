// Open & close modal
const googleBtn = document.getElementById('google-login-btn');
const registerForm = document.getElementById('register-form');
const registerModal = document.getElementById('register-modal');
const openRegisterModal = document.getElementById('open-register-modal');
const closeRegisterModal = document.querySelector('.modal-close');

openRegisterModal.onclick = () => {
  registerModal.classList.add('show');
};

closeRegisterModal.onclick = () => {
  registerModal.classList.remove('show');
};

// Handle Login Google
  googleBtn.addEventListener('click', function() {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log('Google login success:', 'success', user);
        window.location.href = '/'; // Arahkan ke halaman home
      })
      .catch((error) => {
        console.error('Google login error:', error);
        showAlert('Login dengan Google gagal!', 'error');
      });
  });
  
// Handle Login E-mail & Password
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

if (!email || !password) {
  showAlert('Email dan Password wajib diisi!', 'warning');
  return; // STOP dulu
}

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = '/'; // Setelah login sukses
  } catch (error) {
	    console.log(error.code);
	  showFriendlyError(error);
  }
});

// Handle Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const phone = document.getElementById('phone').value;
  const gender = document.getElementById('gender').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const postalCode = document.getElementById('postal-code').value;
  const province = document.getElementById('province').value;
  const country = document.getElementById('country').value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    const userId = user.uid;

    // Kirim email verifikasi
    await user.sendEmailVerification();

    // Simpan data user ke Firestore
    await db.collection('users').doc(userId).set({
      firstName,
      lastName,
      email,
      phone,
      gender,
      address,
      city,
      postalCode,
      province,
      country,
      role: "user", // Default buyer
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      emailVerified: false // Kita bisa update nanti kalau perlu
    });

    showAlert('Registration successful! Please check your email to verify your account.', 'succsess');

    // Paksa logout supaya user gak bisa masuk sebelum verifikasi
    await auth.signOut();

    // Tutup modal register dan arahkan ke login
    registerModal.classList.remove('show');
    window.location.href = '/userLogin'; 

  } catch (error) {
    console.error(error);
    showAlert(error.message);
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    if (!user.emailVerified) {
      // Kalau belum verifikasi
      showAlert('Akun Anda belum terverifikasi. Silakan cek email Anda untuk verifikasi.', 'warning');
      
      // Kasih delay dikit buat user baca alert
      setTimeout(() => {
        auth.signOut(); // Paksa logout
        window.location.href = '/userLogin'; // Arahkan ke login
      }, 3000); // 3 detik
    }
  }
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

  showAlert(message, type = 'error');
}
