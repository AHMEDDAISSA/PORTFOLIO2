// Hero Animation System
function startAnimations() {
    // Hero title animation
    const heroTitle = document.querySelector('.glitch-text');
    if (heroTitle) {
        gsap.fromTo(heroTitle, 
            { opacity: 0, y: 100, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "power4.out" }
        );
    }

    // Typing animation
    const typingElement = document.getElementById('typingText');
    if (typingElement) {
        const texts = [
            'Full Stack Developer',
            'React Specialist',
            'Node.js Expert',
            'Flutter Developer',
            'UI/UX Enthusiast',
            'Problem Solver'
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeWriter() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentText.length) {
                setTimeout(() => { isDeleting = true; }, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }

            const speed = isDeleting ? 100 : 150;
            setTimeout(typeWriter, speed);
        }

        typeWriter();
    }
}

// Skill Bar Animation System
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillProgress = entry.target.querySelector('.skill-progress');
            const skillValue = skillProgress.getAttribute('data-skill');
            
            gsap.to(skillProgress, {
                scaleX: skillValue / 100,
                duration: 2,
                ease: "power2.out"
            });
            
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-container').forEach(container => {
    skillObserver.observe(container);
});

// Card Animation System
gsap.utils.toArray('.card-3d').forEach(card => {
    gsap.fromTo(card, 
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 15%",
                scrub: 1
            }
        }
    );
});

// Project Cards Animation
gsap.utils.toArray('.project-card').forEach((card, index) => {
    gsap.fromTo(card, 
        { y: 80, opacity: 0, rotationX: 15 },
        {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 1,
            delay: index * 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Social Icons Animation System
const socialIconsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const socialIcons = entry.target.querySelectorAll('.social-icon, .footer-social-icon');
            socialIcons.forEach((icon, index) => {
                gsap.fromTo(icon, 
                    { scale: 0, rotation: -180, opacity: 0 },
                    { 
                        scale: 1,
                        rotation: 0,
                        opacity: 1,
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "back.out(1.7)"
                    }
                );
            });
            socialIconsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.social-icons, .footer-social-icons').forEach(container => {
    socialIconsObserver.observe(container);
});
