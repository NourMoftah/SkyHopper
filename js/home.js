// ========== Data ==========
const deals = [
    { id: 1, country: 'Dubai', price: 450, image: 'https://images.pexels.com/photos/1534411/pexels-photo-1534411.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 2, country: 'Paris', price: 180, image: 'https://t3.ftcdn.net/jpg/00/44/31/30/360_F_44313077_sGmwyXISpFVsCmpKvnwExPq6FF3qsHda.jpg' },
    { id: 3, country: 'Tokyo', price: 650, image: 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 4, country: 'London', price: 120, image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 5, country: 'Rome', price: 200, image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 6, country: 'Sydney', price: 890, image: 'https://images.pexels.com/photos/995764/pexels-photo-995764.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 7, country: 'Bangkok', price: 320, image: 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 8, country: 'Istanbul', price: 280, image: 'https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 9, country: 'Maldives', price: 750, image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 10, country: 'Singapore', price: 420, image: 'https://images.pexels.com/photos/1842332/pexels-photo-1842332.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const slides = [
    { id: 1, title: 'Santorini', location: 'Greece', description: 'Experience the breathtaking sunsets and white-washed buildings', image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1920' },
    { id: 2, title: 'Bali', location: 'Indonesia', description: 'Discover tropical paradise with stunning temples and beaches', image: 'https://img.freepik.com/free-photo/tanah-lot-temple-bali-island-indonesia_335224-394.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 3, title: 'Swiss Alps', location: 'Switzerland', description: 'Majestic mountain peaks and scenic train journeys await', image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920' },
    { id: 4, title: 'Machu Picchu', location: 'Peru', description: 'Ancient Incan citadel set high in the Andes Mountains', image: 'https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg?auto=compress&cs=tinysrgb&w=1920' },
    { id: 5, title: 'Northern Lights', location: 'Iceland', description: 'Witness the magical aurora borealis dancing in the sky', image: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1920' }
];


let favorites = JSON.parse(localStorage.getItem('skyplan-favorites')) || [];
let currentSlide = 0;
let isAnimating = false;
let slideInterval;

// ========== Favorites Functions ======================
function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('skyplan-favorites', JSON.stringify(favorites));
    renderDeals();
}

function isFavorite(id) {
    return favorites.includes(id);
}

// ========== Render Functions =====================================
function renderDeals() {
    const container = document.getElementById('marqueeContainer');
    if (!container) return;
    
    const allDeals = [...deals, ...deals]; // Duplicate for seamless loop

    container.innerHTML = allDeals.map((deal) => `
        <div class="deal-card">
            <div class="deal-card-inner">
                <div class="deal-image" style="background-image: url('${deal.image}')">
                    <button class="deal-favorite ${isFavorite(deal.id) ? 'active' : ''}" onclick="toggleFavorite(${deal.id})">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>
                    <div class="deal-badge">
                        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                        Direct
                    </div>
                </div>
                <div class="deal-content">
                    <div class="deal-info">
                        <div>
                            <h3 class="deal-country">${deal.country}</h3>
                            <p class="deal-type">Round Trip</p>
                        </div>
                        <div style="text-align: right;">
                            <p class="deal-price-label">From</p>
                            <p class="deal-price text-gradient-teal">$${deal.price}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSlider() {
    const sliderMain = document.getElementById('sliderMain');
    const sliderDots = document.getElementById('sliderDots');
    
    if (!sliderMain || !sliderDots) {
        console.warn('Slider elements not found');
        return;
    }

    if (slides.length === 0) {
        console.warn('No slides data available');
        return;
    }

    sliderMain.innerHTML = slides.map((slide, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="slide-bg" style="background-image: url('${slide.image}')"></div>
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <div class="slide-location">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                    <span>${slide.location}</span>
                </div>
                <h3 class="slide-title">${slide.title}</h3>
                <p class="slide-desc">${slide.description}</p>
            </div>
        </div>
    `).join('');

    sliderDots.innerHTML = slides.map((_, index) => `
        <button class="slider-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})" aria-label="Go to slide ${index + 1}"></button>
    `).join('');
    
    // Reset current slide to 0 after rendering
    currentSlide = 0;
    updateSlider();
}

// ========== Slider Functions ==========
function updateSlider() {
    const slideElements = document.querySelectorAll('.slide');
    const dotElements = document.querySelectorAll('.slider-dot');

    slideElements.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });

    dotElements.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
    setTimeout(() => isAnimating = false, 600);
}

function prevSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
    setTimeout(() => isAnimating = false, 600);
}

function goToSlide(index) {
    if (isAnimating || index === currentSlide) return;
    isAnimating = true;
    currentSlide = index;
    updateSlider();
    setTimeout(() => isAnimating = false, 600);
}

function startSlideshow() {
    slideInterval = setInterval(nextSlide, 5000);
}

// ========== Flights Data ==========
async function fetchFlights() {
    try {
        const response = await fetch('data/flights.json');
        if (!response.ok) {
            throw new Error('Failed to fetch flights data');
        }
        const flights = await response.json();
        return flights;
    } catch (error) {
        console.error('Error fetching flights:', error);
        return [];
    }
}

// ========== Destination Cards ==========
async function initDestinationCards() {
    const allFlights = await fetchFlights();
    const destCards = document.querySelectorAll('.dest-card');

    destCards.forEach((card) => {
        let cityName = card.querySelector('h3').innerText.trim();
        
        const cityFlights = allFlights.filter(f => {
            const flightDestination = f.to.split('(')[0].trim(); 
            return flightDestination.toLowerCase() === cityName.toLowerCase() ||
                   f.to.toLowerCase().includes(cityName.toLowerCase()) ||
                   cityName.toLowerCase().includes(flightDestination.toLowerCase());
        });

        const priceBadge = card.querySelector('.price-badge');
        
        if (cityFlights.length > 0) {
            const minPrice = Math.min(...cityFlights.map(f => f.price));
            priceBadge.innerText = `Starting $${minPrice}`;
        } else {
            priceBadge.innerText = `Check Deals`; 
        }

        // Make cards clickable
        card.style.cursor = "pointer";
        card.onclick = function() {
            const searchData = {
                from: "",
                to: cityName,
                date: ""
            };
            localStorage.setItem('currentSearch', JSON.stringify(searchData));
            window.location.href = 'flights.html';
        };
    });
}

// ========== Search Form ==========
function initSearchForm() {
    const searchForm = document.getElementById('main-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fromInput = document.getElementById('from-input');
            const toInput = document.getElementById('to-input');
            const departureInput = document.getElementById('departure-input');
            const returnInput = document.getElementById('return-input');
            
            const searchData = {
                from: fromInput ? fromInput.value : '',
                to: toInput ? toInput.value : '',
                departure: departureInput ? departureInput.value : '',
                return: returnInput ? returnInput.value : ''
            };
            
            localStorage.setItem('currentSearch', JSON.stringify(searchData));
            window.location.href = 'flights.html';
        });
    }
}

// ========== Date Validation ==========
function initDateValidation() {
    const departureInput = document.getElementById('departure-input');
    const returnInput = document.getElementById('return-input');
    
    if (departureInput) {
        const today = new Date().toISOString().split('T')[0];
        departureInput.setAttribute('min', today);
        
        departureInput.addEventListener('change', function() {
            if (returnInput) {
                returnInput.setAttribute('min', this.value);
            }
        });
    }
    
    if (returnInput) {
        const today = new Date().toISOString().split('T')[0];
        returnInput.setAttribute('min', today);
    }
}

function initHomePage() {
    renderDeals();
    renderSlider();
    startSlideshow();
    initDestinationCards();
    initSearchForm();
    initDateValidation();
}

document.addEventListener('DOMContentLoaded', initHomePage);
