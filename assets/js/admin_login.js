const auth = firebase.auth();
const loginForm = document.getElementById('login-form');
const errorDiv = document.getElementById('login-error');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Sukses login
      console.log('Login sukses:', userCredential.user);
      window.location.href = '/dashboard';
    })
    .catch((error) => {
      console.error('Login gagal:', error.message);
      errorDiv.textContent = "Login gagal: " + error.message;
    });
});
