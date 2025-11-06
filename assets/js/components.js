// Initialize Everything
window.addEventListener('load', () => {
    initializeProjects();
    startAnimations();
});

// Performance optimization
window.addEventListener('beforeunload', () => {
    // Clean up observers and animations
    if (typeof skillObserver !== 'undefined') {
        skillObserver.disconnect();
    }
    if (typeof socialIconsObserver !== 'undefined') {
        socialIconsObserver.disconnect();
    }
});

// Navigation handling
document.addEventListener('DOMContentLoaded', function() {
    // Show navigation on scroll for non-home pages
    const navbar = document.getElementById('navbar');
    if (navbar && !window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        navbar.style.display = 'block';
    }
    
    // Handle mobile navigation
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
