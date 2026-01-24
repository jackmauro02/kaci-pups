const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("open");
    navToggle.classList.toggle("open");
  });
}
