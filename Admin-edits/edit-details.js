// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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
            <!--    <td class="border px-4 py-2"><a href="${upload.odometerImage}" target="_blank"><img src="${upload.odometerImageUrl}" class="w-16 h-16 object-cover"></a></td>-->
                <td class="border px-4 py-2">${upload.totalAmount}</td>
                <td class="border px-4 py-2"><a href="${upload.petrolBunkImage}" target="_blank"><img src="${upload.petrolBunkImage}" class="w-16 h-16 object-cover"></a></td>
                <td class="border px-4 py-2">${upload.verified ? 'Yes' : 'No'}</td>
                <td class="border px-4 py-2">
                    <button class="toggle-verify-btn bg-${upload.verified ? 'green' : 'yellow'}-500 text-white px-2 py-1 rounded" 
                            data-upload-key="${uploadKey}" 
                            data-current-status="${upload.verified}">
                        ${upload.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-upload-key="${uploadKey}">Delete</button>
                </td>
            </tr>
        `;
    });

    document.querySelectorAll('.toggle-verify-btn').forEach(button => {
        button.addEventListener('click', () => {
            const uploadKey = button.getAttribute('data-upload-key');
            const currentStatus = button.getAttribute('data-current-status') === 'true';
            toggleVerify(uploadKey, currentStatus, button);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const uploadKey = button.getAttribute('data-upload-key');
            deleteInstance(uploadKey);
        });
    });
}

// Toggle verification status
function toggleVerify(uploadKey, currentStatus, button) {
    const newStatus = !currentStatus;
    update(ref(database, 'uploads/' + uploadKey), { verified: newStatus })
        .then(() => {
            button.setAttribute('data-current-status', newStatus);
            button.classList.toggle('bg-green-500', newStatus);
            button.classList.toggle('bg-yellow-500', !newStatus);
            button.textContent = newStatus ? 'Unverify' : 'Verify';
            alert('Verification status updated successfully!');
        })
        .catch(error => {
            console.error('Error updating verification status:', error);
        });
}

// Delete instance
function deleteInstance(uploadKey) {
    remove(ref(database, 'uploads/' + uploadKey))
        .then(() => {
            alert('Instance deleted successfully!');
            fetchAndDisplayData(); // Refresh the data display
        })
        .catch(error => {
            console.error('Error deleting instance:', error);
        });
}

// Function to convert date from yyyy-mm-dd to dd-mm-yyyy
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

// Function to handle input changes
function handleInputChange() {
    const vehicleName = document.getElementById('searchVehicleName').value;
    const searchDateInput = document.getElementById('searchDate').value;
    const searchDate = searchDateInput ? formatDate(searchDateInput) : ''; // Convert date format
    fetchAndDisplayData({ vehicleName, searchDate });
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
                return (upload.verified !== undefined ? upload.verified : false) === filter.verificationStatus;
            });
        }

        // Sort by date
        if (filter.dateSort) {
            sortedData.sort((a, b) => {
                const dateA = new Date(a.val().date.split('-').reverse().join('-'));
                const dateB = new Date(b.val().date.split('-').reverse().join('-'));
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

// Event listeners for search inputs
document.getElementById('searchVehicleName').addEventListener('input', handleInputChange);
document.getElementById('searchDate').addEventListener('input', handleInputChange);

// Sort by date
document.getElementById('dateSort').addEventListener('change', (event) => {
    const dateSort = event.target.value;
    fetchAndDisplayData({ dateSort });
});

//import spreadsheet :

// document.getElementById('importSpreadsheet').addEventListener('click', () => {
//     onValue(uploadsRef, (snapshot) => {
//         let data = [];
//         snapshot.forEach(childSnapshot => {
//             const upload = childSnapshot.val();
//             data.push({
//                 Date: upload.date,
//                 DriverName: upload.driverName,
//                 VehicleName: upload.vehicleName,
//                 FuelType: upload.fuelType,
//                 OdometerValue: upload.odometerValue,
//                 TotalAmount: upload.totalAmount,
//                 PetrolBunkImageUrl: upload.petrolBunkImageUrl,
//                 Verified: upload.verified ? 'Yes' : 'No'
//             });
//         });

//         // Create a new workbook and add the data
//         let wb = XLSX.utils.book_new();
//         let ws = XLSX.utils.json_to_sheet(data);
//         XLSX.utils.book_append_sheet(wb, ws, "Uploads");

//         // Generate a file and trigger download
//         let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
//         function s2ab(s) {
//             let buf = new ArrayBuffer(s.length);
//             let view = new Uint8Array(buf);
//             for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
//             return buf;
//         }
//         let blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
//         let link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'fuel-expense-data.xlsx';
//         link.click();
//     });
// });
