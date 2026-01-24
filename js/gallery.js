const images = [
    { src: "images/Diesel.jpg", caption: "Diesel being a little cutie" },
    { src: "images/dog2.jpg", caption: "Exploring local parks 🐾" },
    { src: "images/Bobby.JPG", caption: "Bobby playing catch" },
    { src: "images/buddy.png", caption: "Post walk smiles" },
    { src: "images/DieselJump.png", caption: "Safe, offlead fun" },
    { src: "images/poppy.png", caption: "Another happy pup!" },
    { src: "images/Rambo.jpeg", caption: "RAMBO ❤️" }
];

const grid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeBtn = document.querySelector(".lightbox .close");
const prevBtn = document.querySelector(".lightbox-arrow.prev");
const nextBtn = document.querySelector(".lightbox-arrow.next");

let currentIndex = 0;

/* Render gallery */
function renderGallery() {
    images.forEach((img, index) => {
        const div = document.createElement("div");
        div.className = "gallery-item reveal";
        div.innerHTML = `
            <img src="${img.src}" alt="">
            <div class="gallery-overlay">
                <span>${img.caption}</span>
            </div>
        `;
        div.onclick = () => openLightbox(index);
        grid.appendChild(div);
    });
}

/* Open lightbox */
function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.style.display = "flex";
}

/* Update image */
function updateLightbox() {
    lightboxImg.src = images[currentIndex].src;
    lightboxCaption.textContent = images[currentIndex].caption;
}

/* Navigation */
function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightbox();
}

function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightbox();
}

/* Events */
nextBtn.onclick = e => {
    e.stopPropagation();
    showNext();
};

prevBtn.onclick = e => {
    e.stopPropagation();
    showPrev();
};

closeBtn.onclick = () => lightbox.style.display = "none";

lightbox.onclick = e => {
    if (e.target === lightbox) lightbox.style.display = "none";
};

/* Keyboard support (desktop) */
document.addEventListener("keydown", e => {
    if (lightbox.style.display !== "flex") return;

    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") lightbox.style.display = "none";
});

/* Swipe support (mobile) */
let touchStartX = 0;

lightbox.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
        diff > 0 ? showNext() : showPrev();
    }
});

renderGallery();

/* Mobile nav */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
