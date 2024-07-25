import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Firebase configuration for vehicles
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

// Ensure JavaScript runs after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add Vehicle
    const addVehicleForm = document.getElementById('addVehicleForm');
    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const vehicleName = document.getElementById('vehicleName').value;
            const licenseNumber = document.getElementById('licenseNumber').value;

            if (!vehicleName || !licenseNumber) {
                alert('All fields are required!');
                return;
            }

            if (licenseNumber.length !== 10) {
                alert('License Number must be 10 characters long!');
                return;
            }

            set(ref(database, `transport/${licenseNumber}`), {
                vehicleName: vehicleName,
                licenseNumber: licenseNumber
            }).then(() => {
                alert('Vehicle added successfully!');
                addVehicleForm.reset();
            }).catch(error => {
                console.error('Error adding vehicle:', error);
            });
        });
    }

    // Fetch and display vehicles
    onValue(ref(database, 'transport'), (snapshot) => {
        displayVehicles(snapshot);
    });

    // Search by License Number
    const searchLicenseNumber = document.getElementById('searchLicenseNumber');
    searchLicenseNumber.addEventListener('input', () => {
        const query = searchLicenseNumber.value.toLowerCase();
        onValue(ref(database, 'transport'), (snapshot) => {
            displayVehicles(snapshot, query);
        });
    });
});

function displayVehicles(snapshot, query = '') {
    const vehiclesList = document.getElementById('vehiclesList');
    vehiclesList.innerHTML = '';
    snapshot.forEach(childSnapshot => {
        const vehicle = childSnapshot.val();
        if (vehicle.licenseNumber.toLowerCase().includes(query)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="border px-4 py-2">${vehicle.vehicleName}</td>
                <td class="border px-4 py-2">${vehicle.licenseNumber}</td>
                <td class="border px-4 py-2">
                    <button class="bg-green-500 text-white px-2 py-1 rounded" onclick="editVehicle('${vehicle.licenseNumber}', '${vehicle.vehicleName}')">Edit</button>
                    <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteVehicle('${vehicle.licenseNumber}')">Delete</button>
                </td>`;
            vehiclesList.appendChild(tr);
        }
    });
}

// Edit Vehicle
window.editVehicle = function (licenseNumber, name) {
    const vehicleNameInput = document.getElementById('vehicleName');
    const licenseNumberInput = document.getElementById('licenseNumber');
    vehicleNameInput.value = name;
    licenseNumberInput.value = licenseNumber;
    licenseNumberInput.disabled = true;

    document.getElementById('addVehicleForm').addEventListener('submit', (event) => {
        event.preventDefault();
        update(ref(database, `transport/${licenseNumber}`), {
            vehicleName: vehicleNameInput.value
        }).then(() => {
            alert('Vehicle updated successfully!');
            document.getElementById('addVehicleForm').reset();
            licenseNumberInput.disabled = false;
        }).catch(error => {
            console.error('Error updating vehicle:', error);
        });
    }, { once: true });
}

// Delete Vehicle
window.deleteVehicle = function (licenseNumber) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        remove(ref(database, `transport/${licenseNumber}`)).then(() => {
            alert('Vehicle deleted successfully!');
        }).catch(error => {
            console.error('Error deleting vehicle:', error);
        });
    }
}
