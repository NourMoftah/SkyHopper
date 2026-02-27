document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const flightId = urlParams.get('id');
    
    populateFlightSummary(flightId);

    setupPriceCalculation();

    const form = document.getElementById('booking-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        processBooking(flightId);
    });
});

function setupPriceCalculation() {
    const seatClass = document.getElementById('seat-class');
    const passengers = document.getElementById('passengers');
    const extraBag = document.getElementById('extra-bag');
    const insurance = document.getElementById('insurance');
    
    function updateTotalPrice() {
        const basePrice = parseFloat(document.getElementById('summary-price').dataset.price) || 450;
        const passengerCount = parseInt(passengers.value) || 1;
        const classMultiplier = seatClass.value === 'Business' ? 200 : 0;
        const extraBagCost = extraBag.checked ? 50 : 0;
        const insuranceCost = insurance.checked ? 30 : 0;
        
        const totalPrice = (basePrice + classMultiplier) * passengerCount + extraBagCost + insuranceCost;
        document.getElementById('total-price').textContent = formatMoney(totalPrice);
    }
    
    seatClass.addEventListener('change', updateTotalPrice);
    passengers.addEventListener('input', updateTotalPrice);
    extraBag.addEventListener('change', updateTotalPrice);
    insurance.addEventListener('change', updateTotalPrice);
    
    updateTotalPrice();
}

async function populateFlightSummary(id) {
    const response = await fetch('data/flights.json');
    const flights = await response.json();
    const flight = flights.find(f => f.id == id);
    
    if(flight) {
        document.getElementById('summary-route').textContent = `${flight.from} to ${flight.to}`;
        document.getElementById('summary-price').textContent = formatMoney(flight.price);
        document.getElementById('summary-price').dataset.price = flight.price;
    }
}

function processBooking(flightId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const seatClass = document.getElementById('seat-class').value;
    const passengers = document.getElementById('passengers').value;
    const extraBag = document.getElementById('extra-bag').checked;
    const insurance = document.getElementById('insurance').checked;
    
    const basePrice = parseFloat(document.getElementById('summary-price').dataset.price) || 450;
    const classMultiplier = seatClass === 'Business' ? 200 : 0;
    const extraBagCost = extraBag ? 50 : 0;
    const insuranceCost = insurance ? 30 : 0;
    const totalPrice = (basePrice + classMultiplier) * passengers + extraBagCost + insuranceCost;
    
    const newBooking = {
        bookingId: Date.now(), 
        userEmail: user.email,
        flightId: parseInt(flightId),
        seatClass: seatClass,
        passengers: parseInt(passengers),
        extraBaggage: extraBag,
        travelInsurance: insurance,
        totalPrice: totalPrice,
        dateBooked: new Date().toLocaleDateString(),
        status: 'Confirmed'
    };

    
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    showNotification('Booking Confirmed! Redirecting to your profile...', 'success');
    
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3000);
}