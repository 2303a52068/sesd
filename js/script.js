// script.js
// Sample data (in real app, use localStorage or backend)
let donors = JSON.parse(localStorage.getItem('donors')) || [];

// Navigation smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Donor Registration
document.getElementById('donorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const donor = {
        id: Date.now(),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        location: document.getElementById('location').value,
        lastDonation: document.getElementById('lastDonation').value
    };
    donors.push(donor);
    localStorage.setItem('donors', JSON.stringify(donors));
    alert('Thank you for registering as a donor! You can now be searched.');
    e.target.reset();
});

// Request Form (simulated)
document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Your blood request has been posted! Nearby donors will be notified.');
    e.target.reset();
});

// Search Donors
document.getElementById('searchBtn').addEventListener('click', () => {
    const bloodGroup = document.getElementById('searchBloodGroup').value.toUpperCase();
    const location = document.getElementById('searchLocation').value.toLowerCase();
    const filteredDonors = donors.filter(donor => 
        donor.bloodGroup.toUpperCase().includes(bloodGroup) &&
        donor.location.toLowerCase().includes(location)
    );
    displayDonors(filteredDonors);
});

function displayDonors(donorsList) {
    const container = document.getElementById('donorsList');
    if (donorsList.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No donors found. Try broadening your search.</p>';
        return;
    }
    container.innerHTML = donorsList.map(donor => `
        <div class="donor-card">
            <h3>${donor.name}</h3>
            <p><i class="fas fa-tint"></i> Blood Group: ${donor.bloodGroup}</p>
            <p><i class="fas fa-map-marker-alt"></i> Location: ${donor.location}</p>
            <p><i class="fas fa-phone"></i> Phone: ${donor.phone}</p>
            <p><i class="fas fa-envelope"></i> Email: ${donor.email}</p>
            ${donor.lastDonation ? `<p><i class="fas fa-calendar"></i> Last Donation: ${donor.lastDonation}</p>` : ''}
        </div>
    `).join('');
}

// Initial load: show all donors if any
if (donors.length > 0) {
    displayDonors(donors);
}