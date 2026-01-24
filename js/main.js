document.addEventListener("DOMContentLoaded", () => {
    console.log("Kaci’s Pups website loaded 🐾");

    initMobileNav();
    initScrollAnimations();
    initSmoothScroll();
    initFormUX();
});
function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav-links");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
        nav.classList.toggle("nav-open");
        toggle.classList.toggle("open");
    });
}

// Auto active nav link
const currentPage = location.pathname.split("/").pop();

document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});
function initScrollAnimations() {
    const revealItems = document.querySelectorAll(
        ".card, .service-card, .hero-text, .hero-image, .step, .trust-item"
    );

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealItems.forEach(el => observer.observe(el));
}
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute("href"));
            target?.scrollIntoView({ behavior: "smooth" });
        });
    });
}
function initFormUX() {
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", e => {
            e.preventDefault();

            const button = form.querySelector("button");
            if (button) {
                button.disabled = true;
                button.textContent = "Sending...";
            }

            setTimeout(() => {
                form.reset();
                if (button) {
                    button.textContent = "Sent ✓";
                }
            }, 1200);
        });
    });
}
// Debounce for future features
function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
window.addEventListener("scroll", () => {
    document.body.classList.toggle("scrolled", window.scrollY > 20);
});
// Hero slideshow
const slides = document.querySelectorAll(".hero-slideshow .slide");
let currentSlide = 0;

setInterval(() => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
}, 5000);

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
