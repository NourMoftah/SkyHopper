document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;

    const user = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    loadBookings(user.email);
});

async function loadBookings(email) {
    const flightResp = await fetch('data/flights.json');
    const allFlights = await flightResp.json();

    const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const userBookings = allBookings.filter(b => b.userEmail === email);

    const container = document.getElementById('bookings-list');
    const bookingCount = document.getElementById('booking-count');
    
    bookingCount.textContent = `${userBookings.length} Booking${userBookings.length !== 1 ? 's' : ''}`;
    
    container.innerHTML = '';

    if (userBookings.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">✈️</div>
                <h3 style="color: var(--text-secondary); margin-bottom: 15px;">No Bookings Yet</h3>
                <p style="color: var(--text-secondary); margin-bottom: 25px;">Start exploring and book your first flight!</p>
                <a href="flights.html" class="btn btn-primary">Browse Flights</a>
            </div>
        `;
        return;
    }

    const cardsWrapper = document.createElement('div');
    cardsWrapper.style.display = 'grid';
    cardsWrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
    cardsWrapper.style.gap = '30px';
    cardsWrapper.style.marginBottom = '30px';
    
    for (let i = 0; i < userBookings.length; i += 2) {
        const rowWrapper = document.createElement('div');
        rowWrapper.style.display = 'grid';
        rowWrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
        rowWrapper.style.gap = '30px';
        rowWrapper.style.marginBottom = '30px';
        
        for (let j = i; j < Math.min(i + 2, userBookings.length); j++) {
            const booking = userBookings[j];
            const flight = allFlights.find(f => f.id === booking.flightId);
            if (!flight) continue;

            const fromMatch = flight.from.match(/\(([A-Z]{3})\)/);
            const toMatch = flight.to.match(/\(([A-Z]{3})\)/);
            const fromCode = fromMatch ? fromMatch[1] : flight.from.substring(0, 3).toUpperCase();
            const toCode = toMatch ? toMatch[1] : flight.to.substring(0, 3).toUpperCase();
            
            const fromCity = flight.from.split('(')[0].trim();
            const toCity = flight.to.split('(')[0].trim();
            
            const [depHours, depMins] = flight.time.split(':').map(Number);
            const durationMatch = flight.duration.match(/(\d+)h\s*(\d+)m/);
            const durationHours = durationMatch ? parseInt(durationMatch[1]) : 0;
            const durationMins = durationMatch ? parseInt(durationMatch[2]) : 0;
            
            let arrHours = depHours + durationHours;
            let arrMins = depMins + durationMins;
            if (arrMins >= 60) {
                arrHours += Math.floor(arrMins / 60);
                arrMins = arrMins % 60;
            }
            if (arrHours >= 24) {
                arrHours = arrHours % 24;
            }
            
            const arrivalTime = `${arrHours.toString().padStart(2, '0')}:${arrMins.toString().padStart(2, '0')}`;
            const departureTime = flight.time;
            
            const dateObj = new Date(flight.date);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            const flightNumber = `${flight.airline.substring(0, 2).toUpperCase()}-${String(flight.id).padStart(4, '0')}`;
            
            const barcodeCode = `${String(booking.bookingId).padStart(4, '0')}${String(flight.id).padStart(3, '0')}${fromCode}${toCode}`;
            
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const passengerName = user ? user.name : 'Passenger';
            
            const seatClass = booking.seatClass || 'Economy';
            
            const formatTime12 = (time24) => {
                const [hours, mins] = time24.split(':').map(Number);
                const period = hours >= 12 ? 'pm' : 'am';
                const hours12 = hours % 12 || 12;
                return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
            };
            
            const generateBarcode = (code) => {
                let pattern = '';
                for (let i = 0; i < code.length; i++) {
                    const char = code[i];
                    const num = isNaN(char) ? char.charCodeAt(0) % 10 : parseInt(char);
                    const width = Math.max(3, (num % 4) + 2);
                    pattern += `<div style="width: ${width}px; height: 80px; background: #000; display: inline-block; margin-right: 2px; border-radius: 1px;"></div>`;
                }
                return pattern;
            };

            
            const flightImageUrl = `./img/airplane.jpg`;
            
            const div = document.createElement('div');
            div.className = 'boarding-pass-card';
            div.innerHTML = `
                <!-- Header Image -->
                <div class="boarding-pass-header">
                    <img src="${flightImageUrl}" alt="Flight" class="boarding-pass-header-image">
                </div>
                
                <!-- Route Section -->
                <div class="boarding-pass-route">
                    <div class="boarding-pass-city">
                        <div class="boarding-pass-city-code">${fromCode}</div>
                        <div class="boarding-pass-city-name">${fromCity}</div>
                    </div>
                    <div class="boarding-pass-duration">
                        <div class="boarding-pass-duration-time">${flight.duration}</div>
                        <div class="boarding-pass-duration-icon">✈</div>
                        <div class="boarding-pass-duration-line"></div>
                    </div>
                    <div class="boarding-pass-city">
                        <div class="boarding-pass-city-code">${toCode}</div>
                        <div class="boarding-pass-city-name">${toCity}</div>
                    </div>
                </div>
                
                <!-- Details Section -->
                <div class="boarding-pass-details">
                    <div>
                        <div class="boarding-pass-detail-item">
                            <div class="boarding-pass-detail-label">FLIGHT NO</div>
                            <div class="boarding-pass-detail-value">${flightNumber}</div>
                        </div>
                        <div class="boarding-pass-detail-item">
                            <div class="boarding-pass-detail-label">DATE</div>
                            <div class="boarding-pass-detail-value">${formattedDate}</div>
                        </div>
                        <div class="boarding-pass-detail-item">
                            <div class="boarding-pass-detail-label">CLASS</div>
                            <div class="boarding-pass-detail-value">${seatClass}</div>
                        </div>
                    </div>
                    <div>
                        <div class="boarding-pass-detail-item">
                            <div class="boarding-pass-detail-label">FULL NAME</div>
                            <div class="boarding-pass-detail-value">${passengerName}</div>
                        </div>
                        <div class="boarding-pass-detail-item">
                            <div class="boarding-pass-detail-label">DEPARTURE</div>
                            <div class="boarding-pass-detail-value">${formatTime12(departureTime)}</div>
                        </div>
                        <div class="boarding-pass-detail-item">
                            <div class="boarding-pass-detail-label">ARRIVAL TIME</div>
                            <div class="boarding-pass-detail-value">${formatTime12(arrivalTime)}</div>
                        </div>
                        <div class="boarding-pass-detail-item">
                            <div class="boarding-pass-detail-label">AIRLINE</div>
                            <div class="boarding-pass-detail-value">${flight.airline}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Barcode Section -->
                <div class="boarding-pass-barcode">
                    <div class="boarding-pass-barcode-image" style="display: flex; align-items: center; justify-content: center; background: #fff; padding: 10px; border: 1px solid #ddd;">
                        ${generateBarcode(barcodeCode)}
                    </div>
                    <div class="boarding-pass-barcode-code">${barcodeCode}</div>
                </div>
                
                <!-- Actions -->
                <div class="boarding-pass-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteBooking(${booking.bookingId})">Delete</button>
                </div>
            `;
            rowWrapper.appendChild(div);
        }
        
        if (rowWrapper.children.length === 1) {
            const emptyDiv = document.createElement('div');
            rowWrapper.appendChild(emptyDiv);
        }
        
        container.appendChild(rowWrapper);
    }
}

function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        const updatedBookings = bookings.filter(b => b.bookingId !== bookingId);
        
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        
        showNotification('Booking deleted successfully', 'delete');
        
        const user = JSON.parse(localStorage.getItem('currentUser'));
        loadBookings(user.email);
    }
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
