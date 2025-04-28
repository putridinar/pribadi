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
        console.log('Google login success:', user);
        window.location.href = '/'; // Arahkan ke halaman home
      })
      .catch((error) => {
        console.error('Google login error:', error);
        showAlert('Login dengan Google gagal!');
      });
  });
  
// Handle Login E-mail & Password
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = '/'; // Setelah login sukses
  } catch (error) {
    showAlert(error.message);
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

    showAlert('Registration successful! Please check your email to verify your account.');

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