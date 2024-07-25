// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFRzBBmKrkL25tT9etO8AkfRCR9rm3kmY",
    authDomain: "upload-9eeee.firebaseapp.com",
    databaseURL: "https://upload-9eeee-default-rtdb.firebaseio.com",
    projectId: "upload-9eeee",
    storageBucket: "upload-9eeee.appspot.com",
    messagingSenderId: "425438883336",
    appId: "1:425438883336:web:d97d899428bb0912256bbd",
    measurementId: "G-8JLTY930WC"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Signup
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;

            // Save user data to Realtime Database
            return set(ref(database, 'admins/' + user.uid), {
                name: name,
                phone: phone,
                email: email,
            });
        })
        .then(() => {
            alert('Admin signed up and data saved successfully.');
            window.location.href = '../admin-operations/index.html';
        })
        .catch((error) => {
            console.error(error.message);
            alert('Error: ' + error.message);
        });
});

// Login
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            alert('Admin logged in successfully.');
            window.location.href = '../admin-operations/index.html';
        })
        .catch((error) => {
            console.error('Error: ' + error.message);
            alert('Enter the correct credentials')
        });
});
