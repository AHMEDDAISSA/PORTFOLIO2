// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Theme Toggle System
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.getElementById('body');

const currentTheme = localStorage.getItem('theme') || 'dark';
body.className = currentTheme;
updateThemeIcon();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark') ? 'light' : 'dark';
        body.className = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
        
        // Add rotation animation
        gsap.to(themeToggle, {
            rotation: "+=180",
            duration: 0.6,
            ease: "back.out(1.7)"
        });
    });
}

function updateThemeIcon() {
    if (themeIcon) {
        const isDark = body.classList.contains('dark');
        if (isDark) {
            themeIcon.className = 'fas fa-sun text-2xl';
            themeIcon.style.color = '#fbbf24';
        } else {
            themeIcon.className = 'fas fa-moon text-2xl';
            themeIcon.style.color = '#3b82f6';
        }
    }
}

// Scroll Progress System
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    if (scrollProgress) {
        scrollProgress.style.width = scrolled + '%';
    }
});

// Enhanced Image Loading System
function handleImageLoad(img, projectId) {
    const loadingSpinner = document.getElementById(`loading${projectId}`);
    const placeholder = document.getElementById(`placeholder${projectId}`);
    
    // Hide loading spinner
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    // Hide placeholder
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
    // Show and animate image
    img.classList.add('loaded', 'image-loaded');
    
    // Add success animation
    gsap.fromTo(img, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
    );
}

function handleImageError(img, projectId) {
    const loadingSpinner = document.getElementById(`loading${projectId}`);
    const placeholder = document.getElementById(`placeholder${projectId}`);
    
    // Hide loading spinner
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    // Show placeholder with animation
    if (placeholder) {
        placeholder.style.display = 'flex';
        gsap.fromTo(placeholder, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
    }
    
    // Hide the broken image
    img.style.display = 'none';
}

// Initialize project loading states
function initializeProjects() {
    // Hide all placeholders initially and show loading spinners
    for (let i = 1; i <= 3; i++) {
        const placeholder = document.getElementById(`placeholder${i}`);
        const loadingSpinner = document.getElementById(`loading${i}`);
        
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
        }
    }
}
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    // Toggle menu on button click
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
        
        // Toggle icon between bars (☰) and times (✕)
        const icon = this.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// Form Handling System
const contactForm = document.getElementById('contactForm');
const submitText = document.getElementById('submitText');

if (contactForm && submitText) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Button loading state
        submitText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        
        // Simulate form submission
        setTimeout(() => {
            submitText.innerHTML = '<i class="fas fa-check mr-2"></i>Message Sent!';
            
            // Reset form after success
            setTimeout(() => {
                submitText.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send Message';
                contactForm.reset();
            }, 2000);
        }, 2000);
    });
}

// Smooth Scrolling System
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
