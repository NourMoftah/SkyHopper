
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    initDarkMode();
    initAnimations();
});

function initDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    
   
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.appendChild(themeToggle);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
            
            document.body.style.transition = 'all 0.3s ease';
        });
    }
}


function initAnimations() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('page-content');
    }
    
    const cards = document.querySelectorAll('.card, .destination-card, .flight-card, .feature-item');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (user) {

        const loginLink = document.getElementById('nav-login');
        if (loginLink) loginLink.remove();

        if (!document.getElementById('nav-profile')) {
            const profileLi = document.createElement('li');
            profileLi.innerHTML = `<a href="profile.html" id="nav-profile">Profile (${user.name})</a>`;
            navLinks.appendChild(profileLi);

            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = `<a href="#" id="nav-logout">Logout</a>`;
            navLinks.appendChild(logoutLi);

            document.getElementById('nav-logout').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function formatMoney(amount) {
    return '$' + amount.toFixed(2);
}

function requireAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        alert("Please login to access this page.");
        window.location.href = 'login.html';
        return false;
    }
    return true;
}