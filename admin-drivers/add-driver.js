// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, remove, onValue, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0ucyXQ0zStFHULGkq-YUmILdBia2RSQo",
    authDomain: "eggbucket-b37d3.firebaseapp.com",
    databaseURL: "https://eggbucket-b37d3-default-rtdb.firebaseio.com",
    projectId: "eggbucket-b37d3",
    storageBucket: "eggbucket-b37d3.appspot.com",
    messagingSenderId: "854600141755",
    appId: "1:854600141755:web:a0b34bab9c5bf68ef7529e",
    measurementId: "G-NMYT3EFJWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// References
const driversRef = ref(database, 'drivers/');

// Function to display drivers
function displayDrivers(snapshot) {
    const driverList = document.getElementById('driverList');
    driverList.innerHTML = '';

    snapshot.forEach(driverSnapshot => {
        const driver = driverSnapshot.val();
        const dl = driverSnapshot.key;

        driverList.innerHTML += `
            <div class="driver-item mb-4 p-4 border rounded">
                <p><strong>DL No:</strong> ${dl}</p>
                <p><strong>Name:</strong> ${driver.name}</p>
                <p><strong>Phone No:</strong> ${driver.phone}</p>
                <p><strong>Debit Card No:</strong> ${driver.debitCardNo || driver.debitCard}</p>
                <button class="bg-red-500 text-white py-1 px-3 rounded mt-4" onclick="deleteDriver('${dl}')">Delete</button>
            </div>
        `;
    });
}

// Display all drivers in real-time
onValue(driversRef, (snapshot) => {
    displayDrivers(snapshot);
});

// Add Driver
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addDriverForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        let phone = document.getElementById('phone').value;
        const dl = document.getElementById('dl').value;
        const debitCardNo = document.getElementById('debitCardNo').value;

        const dlLength = 15;                           // Minimum length for driver license in India
        const DCLength = 16;                           // Minimum length for debit card in India

        if (!name || !phone || !dl || !debitCardNo) {
            alert('All fields are required!');
            return;
        }

        if (dl.length != dlLength) {
            alert(`Driver license must be exactly ${dlLength} characters long!`);
            return;
        }

        if (debitCardNo.length != DCLength) {
            alert(`Debit Card must be exactly ${DCLength} characters long!`);
            return;
        }

        if(phone.length != 10){
            alert(`phone number must be exactly 10 digits long!`);
            return;
        }

        if (!phone.startsWith('+91')) {
            phone = '+91' + phone;
        }

        // Check for existing driver license number
        get(ref(database, 'drivers/' + dl)).then((snapshot) => {
            if (snapshot.exists()) {
                alert('Driver with this license number already exists!');
                return;
            }

            // Check for existing debit card number
            const queryDebitCard = query(driversRef, orderByChild('debitCard'), equalTo(debitCardNo));
            get(queryDebitCard).then((snapshot) => {
                if (snapshot.exists()) {
                    alert('Driver with this debit card number already exists!');
                    return;
                }

                // If both checks pass, add the new driver
                set(ref(database, 'drivers/' + dl), {
                    name: name,
                    phone: phone,
                    dl: dl,
                    debitCard: debitCardNo
                }).then(() => {
                    alert('Driver added successfully!');
                    document.getElementById('addDriverForm').reset();
                }).catch(error => {
                    console.error('Error adding driver:', error);
                });
            }).catch(error => {
                console.error('Error checking debit card number:', error);
            });
        }).catch(error => {
            console.error('Error checking driver license number:', error);
        });
    });

    // Search Driver by Name
    document.getElementById('searchName').addEventListener('input', (event) => {
        const searchQuery = event.target.value.toLowerCase();

        onValue(driversRef, (snapshot) => {
            const filteredDrivers = [];
            snapshot.forEach(driverSnapshot => {
                const driver = driverSnapshot.val();
                if (driver.name.toLowerCase().includes(searchQuery)) {
                    filteredDrivers.push(driverSnapshot);
                }
            });
            displayDrivers({ forEach: (cb) => filteredDrivers.forEach(cb) });
        });
    });
});

// Delete Driver
window.deleteDriver = function(dl) {
    if (confirm('Are you sure you want to delete this driver?')) {
        remove(ref(database, 'drivers/' + dl)).then(() => {
            alert('Driver deleted successfully!');
        }).catch(error => {
            console.error('Error deleting driver:', error);
        });
    }
};
