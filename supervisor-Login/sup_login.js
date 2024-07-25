
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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
const database = getDatabase(app);

// Login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Check supervisor credentials
    try {
        const supervisorsRef = ref(database, 'supervisors');
        const emailQuery = query(supervisorsRef, orderByChild('email'), equalTo(email));
        const snapshot = await get(emailQuery);

        if (snapshot.exists()) {
            const supervisorData = snapshot.val();
            const supervisorKey = Object.keys(supervisorData)[0];
            const supervisor = supervisorData[supervisorKey];

            if (supervisor.password === password) {
                alert('Supervisor is logged in');
                window.location.href = '../supervisor-operations/index.html';

            } else {
                alert('Password is incorrect');
            }
        } else {
            alert('Email is incorrect');
        }
    } catch (error) {
        console.error('Error reading from database:', error);
        alert('An error occurred. Please try again later.');
    }
});