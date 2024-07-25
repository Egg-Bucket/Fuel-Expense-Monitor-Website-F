import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, push } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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

const supervisorForm = document.getElementById('supervisorForm');
const supervisorTableBody = document.getElementById('supervisorTableBody');

function addSupervisor(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const supervisorsRef = ref(database, 'supervisors');
    const newSupervisorRef = push(supervisorsRef); // Generate a new reference with a unique key
    set(newSupervisorRef, {
        name: name,
        email: email,
        password: password
    }).then(() => {
        supervisorForm.reset();
        alert('New supervisor added successfully!');
    }).catch(error => {
        alert('Error adding supervisor: ' + error.message);
    });
}

function fetchSupervisors() {
    const supervisorsRef = ref(database, 'supervisors');
    onValue(supervisorsRef, function(snapshot) {
        supervisorTableBody.innerHTML = '';
        snapshot.forEach(function(childSnapshot) {
            const supervisor = childSnapshot.val();
            const supervisorRow = document.createElement('tr');
            supervisorRow.innerHTML = `
                <td class="py-3 px-4 text-center">${supervisor.name}</td>
                <td class="py-3 px-4 text-center">${supervisor.email}</td>
                <td class="py-3 px-4 flex justify-center gap-4">
                    <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2" onclick="editSupervisor('${childSnapshot.key}', '${supervisor.name}', '${supervisor.email}', '${supervisor.password}')">Edit</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" onclick="confirmDelete('${childSnapshot.key}')">Delete</button>
                </td>
            `;
            supervisorTableBody.appendChild(supervisorRow);
        });
    });
}

function editSupervisor(key, name, email, password) {
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;

    supervisorForm.removeEventListener('submit', addSupervisor);
    supervisorForm.addEventListener('submit', function updateSupervisor(event) {
        event.preventDefault();
        const supervisorRef = ref(database, 'supervisors/' + key);
        set(supervisorRef, {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        }).then(() => {
            supervisorForm.reset();
            supervisorForm.removeEventListener('submit', updateSupervisor);
            supervisorForm.addEventListener('submit', addSupervisor);
            alert('Supervisor details updated successfully!');
        }).catch(error => {
            alert('Error updating supervisor: ' + error.message);
        });
    });
}

function confirmDelete(key) {
    if (confirm('Are you sure you want to delete this supervisor?')) {
        deleteSupervisor(key);
    }
}

function deleteSupervisor(key) {
    const supervisorRef = ref(database, 'supervisors/' + key);
    remove(supervisorRef).then(() => {
        alert('Supervisor deleted successfully!');
    }).catch(error => {
        alert('Error deleting supervisor: ' + error.message);
    });
}

// Make functions global
window.editSupervisor = editSupervisor;
window.deleteSupervisor = deleteSupervisor;
window.confirmDelete = confirmDelete;

supervisorForm.addEventListener('submit', addSupervisor);

fetchSupervisors();
