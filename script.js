// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.program-card, .instructor-card, .review-card, .feature-item, .timetable-image, .timetable-text');
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
});

// Add active class to nav links on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Image Modal Functions
function openImageModal(imageSrc, title) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Fade in animation
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.opacity = '0';
    modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('imageModal');
        if (modal.style.display === 'flex') {
            closeImageModal();
        }
    }
});

// Instructors Slider
let currentSlide = 0;
const cardsPerPage = 6; // 3 columns x 2 rows

function slideInstructors(direction) {
    const slider = document.querySelector('.instructors-slider');
    const wrapper = document.querySelector('.instructors-slider-wrapper');
    const cards = document.querySelectorAll('.instructor-card');
    const totalPages = Math.ceil(cards.length / cardsPerPage);
    
    if (direction === 'next') {
        currentSlide = Math.min(currentSlide + 1, totalPages - 1);
    } else {
        currentSlide = Math.max(currentSlide - 1, 0);
    }
    
    // Calculate card width including gap
    const cardWidth = cards[0] ? cards[0].offsetWidth + 32 : 0; // 32px = gap (2rem)
    const cardsPerRow = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    const cardsToMove = cardsPerRow * 2; // 2 rows
    
    const translateX = -currentSlide * (cardWidth * cardsPerRow);
    slider.style.transform = `translateX(${translateX}px)`;
    
    // Update button states
    updateSliderButtons(totalPages);
}

function updateSliderButtons(totalPages) {
    const prevBtn = document.querySelector('.slider-btn-prev');
    const nextBtn = document.querySelector('.slider-btn-next');
    
    if (prevBtn) {
        prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
        prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
    }
    if (nextBtn) {
        nextBtn.style.opacity = currentSlide >= totalPages - 1 ? '0.5' : '1';
        nextBtn.style.pointerEvents = currentSlide >= totalPages - 1 ? 'none' : 'auto';
    }
}

// Initialize slider buttons
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.instructor-card');
    const totalPages = Math.ceil(cards.length / cardsPerPage);
    if (totalPages <= 1) {
        // Hide buttons if all cards fit on one page
        document.querySelectorAll('.slider-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    } else {
        updateSliderButtons(totalPages);
    }
});

// Auto-slide for instructors (optional)
let autoSlideInterval;

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        slideInstructors('next');
    }, 5000);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

// Initialize slider on load
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.instructors-slider');
    if (slider) {
        const container = slider.parentElement;
        container.addEventListener('mouseenter', stopAutoSlide);
        container.addEventListener('mouseleave', startAutoSlide);
        // startAutoSlide(); // 자동 슬라이드 원하면 주석 해제
    }
});
