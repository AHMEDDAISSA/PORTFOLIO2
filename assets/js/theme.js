// theme.js - Shared theme management for all pages
(function() {
    'use strict';

    // Function to set theme
    function setTheme(theme) {
        const body = document.getElementById('body') || document.body;
        const themeIcon = document.getElementById('themeIcon');
        
        if (theme === 'light') {
            body.classList.remove('dark');
            body.classList.add('light');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        } else {
            body.classList.remove('light');
            body.classList.add('dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
        // Save theme to localStorage
        localStorage.setItem('theme', theme);
    }

    // Function to load theme
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }

    // Function to toggle theme
    function toggleTheme() {
        const body = document.getElementById('body') || document.body;
        const currentTheme = body.classList.contains('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    // Load theme immediately (before page renders)
    loadTheme();

    // Initialize theme toggle button when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    });

    // Expose functions globally if needed
    window.themeManager = {
        setTheme: setTheme,
        loadTheme: loadTheme,
        toggleTheme: toggleTheme
    };
})();
