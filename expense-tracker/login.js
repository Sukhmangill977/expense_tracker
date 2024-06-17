// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQj4UI89aQ2Q7IadYhlypv3A1RCVq6mqE",
    authDomain: "expense-tracker-3aca6.firebaseapp.com",
    projectId: "expense-tracker-3aca6",
    storageBucket: "expense-tracker-3aca6.appspot.com",
    messagingSenderId: "81384779428",
    appId: "1:81384779428:web:2b5bf5a8d48d7b5d184031",
    measurementId: "G-9C9XF3K3TC"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User logged in:', user);
            // Redirect to the main app page
            window.location.href = 'index.html';
        })
        .catch((error) => {
            const errorMessage = error.message;
            document.getElementById('login-error').textContent = errorMessage;
            console.error('Error logging in:', errorMessage);
        });
});
