document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const flightId = urlParams.get('id');

    if (!flightId) {
        alert('No flight specified');
        window.location.href = 'flights.html';
        return;
    }

    loadFlightDetails(flightId);
});

async function loadFlightDetails(id) {
    try {
        const response = await fetch('data/flights.json');
        const flights = await response.json();
        const flight = flights.find(f => f.id == id);

        if (!flight) {
            document.getElementById('detail-container').innerHTML = '<p>Flight not found.</p>';
            return;
        }

        document.getElementById('detail-from-to').textContent = `${flight.from} to ${flight.to}`;
        document.getElementById('detail-airline').textContent = `Airline: ${flight.airline}`;
        document.getElementById('detail-date').textContent = `Date: ${flight.date}`;
        document.getElementById('detail-time').textContent = `Time: ${flight.time}`;
        document.getElementById('detail-duration').textContent = `Duration: ${flight.duration}`;
        document.getElementById('detail-price').textContent = formatMoney(flight.price);

        
        document.getElementById('btn-cancel').onclick = () => window.history.back();
        document.getElementById('btn-continue').onclick = () => {
            
            if (requireAuth()) {
                window.location.href = `booking.html?id=${flight.id}`;
            }
        };

    } catch (error) {
        console.error(error);
    }
}