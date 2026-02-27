let allFlights = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchFlights();

    document.getElementById('filter-airline').addEventListener('change', filterFlights);
    document.getElementById('filter-price').addEventListener('input', (e) => {
        document.getElementById('price-value').textContent = `$${e.target.value}`;
        filterFlights();
    });
});

async function fetchFlights() {
    try {
        const response = await fetch('data/flights.json');
        allFlights = await response.json();
        
        const searchData = JSON.parse(localStorage.getItem('currentSearch'));
        
        let flightsToShow = allFlights;
        
        if (searchData && searchData.to) {
            flightsToShow = allFlights.filter(flight => {
                const flightDestination = flight.to.split('(')[0].trim();
                return flightDestination.toLowerCase() === searchData.to.toLowerCase() ||
                       flight.to.toLowerCase().includes(searchData.to.toLowerCase()) ||
                       searchData.to.toLowerCase().includes(flightDestination.toLowerCase());
            });
        }
        
        renderFlights(flightsToShow);
    } catch (error) {
        console.error('Error fetching flights:', error);
        document.getElementById('flights-container').innerHTML = '<p>Error loading flights.</p>';
    }
}

function renderFlights(flights) {
    const container = document.getElementById('flights-container');
    container.innerHTML = '';

    if (flights.length === 0) {
        container.innerHTML = '<p>No flights found matching your criteria.</p>';
        return;
    }

    flights.forEach(flight => {
        const card = document.createElement('div');
        card.className = 'card flight-card';
        card.innerHTML = `
            <div>
                <div class="flight-route">${flight.from} ➝ ${flight.to}</div>
                <div class="flight-meta">${flight.date} | ${flight.time} | ${flight.duration}</div>
                <div class="flight-meta">${flight.airline}</div>
            </div>
            <div>
                <div class="flight-price">${formatMoney(flight.price)}</div>
                <button class="btn btn-primary" onclick="viewDetails(${flight.id})">View Details</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterFlights() {
    const airline = document.getElementById('filter-airline').value;
    const maxPrice = parseInt(document.getElementById('filter-price').value);

    const filtered = allFlights.filter(flight => {
        const matchesAirline = airline === 'all' || flight.airline === airline;
        const matchesPrice = flight.price <= maxPrice;
        return matchesAirline && matchesPrice;
    });

    renderFlights(filtered);
}

window.viewDetails = function(id) {
    window.location.href = `details.html?id=${id}`;
};