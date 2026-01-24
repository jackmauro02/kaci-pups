const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

form.addEventListener("submit", e => {
    e.preventDefault();

    status.textContent = "Sending message...";
    status.style.color = "var(--text-muted)";

    // TEMPORARY MOCK SUBMISSION
    setTimeout(() => {
        status.textContent = "Message sent! I’ll be in touch shortly 🐾";
        status.style.color = "green";
        form.reset();
    }, 1200);
});
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
