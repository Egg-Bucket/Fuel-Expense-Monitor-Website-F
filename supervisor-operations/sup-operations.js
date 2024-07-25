// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0ucyXQ0zStFHULdBia2RSQo",
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
const uploadsRef = ref(database, 'uploads/');

// Function to display vehicle data
function displayVehicleData(snapshot) {
    const vehicleData = document.getElementById('vehicleData');
    vehicleData.innerHTML = '';

    snapshot.forEach(uploadSnapshot => {
        const upload = uploadSnapshot.val();
        const uploadKey = uploadSnapshot.key;

        vehicleData.innerHTML += `
            <tr>
            <td class="border px-4 py-2">${upload.driverName}</td>
            <td class="border px-4 py-2">${upload.vehicleName}</td>
            <td class="border px-4 py-2">${upload.date}</td>
                <td class="border px-4 py-2">${upload.fuelType}</td>
                <td class="border px-4 py-2">${upload.odometerValue}</td>
                <td class="border px-4 py-2"><img src="${upload.odometerImageUrl}" alt="Odometer Image" class="w-16 h-16 object-cover cursor-pointer" onclick="window.open('${upload.odometerImageUrl}', '_blank')"></td>
                <td class="border px-4 py-2">${upload.totalAmount}</td>
                <td class="border px-4 py-2"><img src="${upload.petrolBunkImageUrl}" alt="Petrol Bunk Image" class="w-16 h-16 object-cover cursor-pointer" onclick="window.open('${upload.petrolBunkImageUrl}', '_blank')"></td>
                <td class="border px-4 py-2">${upload.verified ? 'Yes' : 'No'}</td>
                <td class="border px-4 py-2">
                    <button class="bg-yellow-500 text-white px-2 py-1 rounded ${upload.verified ? 'cursor-not-allowed opacity-50' : ''}" onclick="toggleVerify('${uploadKey}', ${upload.verified})" ${upload.verified ? 'disabled' : ''}>${upload.verified ? 'Verified' : 'Verify'}</button>
                </td>
            </tr>
        `;
    });
}

// Toggle verification status
window.toggleVerify = function(uploadKey, currentStatus) {
    const newStatus = !currentStatus;
    update(ref(database, 'uploads/' + uploadKey), { verified: newStatus })
        .then(() => {
            alert('Verification status updated successfully!');
            fetchAndDisplayData(); // Refresh the data to reflect changes
        })
        .catch(error => {
            console.error('Error updating verification status:', error);
        });
};

// Function to convert date from yyyy-mm-dd to dd-mm-yyyy
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

// Fetch and display data with filters applied
function fetchAndDisplayData(filter = {}) {
    onValue(uploadsRef, (snapshot) => {
        let sortedData = [];
        snapshot.forEach(childSnapshot => {
            sortedData.push(childSnapshot);
        });

        // Filter by vehicle name
        if (filter.vehicleName) {
            sortedData = sortedData.filter(childSnapshot => {
                const upload = childSnapshot.val();
                return upload.vehicleName.toLowerCase().includes(filter.vehicleName.toLowerCase());
            });
        }

        // Filter by date
        if (filter.searchDate) {
            sortedData = sortedData.filter(childSnapshot => {
                const upload = childSnapshot.val();
                const formattedDate = formatDate(upload.date); // Convert Firebase date format to dd-mm-yyyy
                return formattedDate.includes(filter.searchDate);
            });
        }

        // Filter by verification status
        if (filter.verificationStatus !== undefined) {
            sortedData = sortedData.filter(childSnapshot => {
                const upload = childSnapshot.val();
                return upload.verified === filter.verificationStatus;
            });
        }

        // Sort by date
        if (filter.dateSort) {
            sortedData.sort((a, b) => {
                const dateA = new Date(a.val().date);
                const dateB = new Date(b.val().date);
                return filter.dateSort === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }

        displayVehicleData({
            forEach: (callback) => sortedData.forEach(callback)
        });
    });
}

// Initial data fetch
fetchAndDisplayData();

// Filter buttons event listeners
document.getElementById('all').addEventListener('click', () => fetchAndDisplayData());
document.getElementById('verified').addEventListener('click', () => fetchAndDisplayData({ verificationStatus: true }));
document.getElementById('unverified').addEventListener('click', () => fetchAndDisplayData({ verificationStatus: false }));

// Search by vehicle name
document.getElementById('searchVehicleName').addEventListener('input', (event) => {
    const vehicleName = event.target.value;
    fetchAndDisplayData({ vehicleName });
});

// Search by date
document.getElementById('searchDate').addEventListener('input', (event) => {
    const searchDateInput = event.target.value;
    const searchDate = searchDateInput ? formatDate(searchDateInput) : ''; // Convert date format
    fetchAndDisplayData({ searchDate });
});

// Sort by date
document.getElementById('dateSort').addEventListener('change', (event) => {
    const dateSort = event.target.value;
    fetchAndDisplayData({ dateSort });
});
