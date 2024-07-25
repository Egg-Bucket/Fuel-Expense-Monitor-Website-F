// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Change Password
document.getElementById('change-password-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const user = auth.currentUser;

    if (user) {
        const email = user.email;

        // Reauthenticate the user
        signInWithEmailAndPassword(auth, email, oldPassword)
            .then(() => {
                // Reauthentication successful, update password
                updatePassword(user, newPassword)
                    .then(() => {
                        alert('Password changed successfully.');
                    })
                    .catch((error) => {
                        console.error('Error: ' + error.message);
                        alert('Error: ' + error.message);
                    });
            })
            .catch((error) => {
                console.error('Error: ' + error.message);
                alert('Wrong old password. Please try again.');
            });
    } else {
        alert('No user is currently signed in.');
    }
});
