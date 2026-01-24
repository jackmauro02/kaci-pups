const reviews = [
    {
        name: "Sarah",
        location: "Bracknell",
        rating: 5,
        text: "Kaci is amazing — our dog absolutely loves her walks and comes home happy every time."
    },
    {
        name: "James",
        location: "Binfield",
        rating: 5,
        text: "Reliable, friendly and trustworthy. I wouldn’t trust anyone else."
    },
    {
        name: "Emma",
        location: "Wokingham",
        rating: 5,
        text: "So reassuring knowing my dog is in safe hands while I’m at work."
    },
    {
        name: "Lucy",
        location: "Ascot",
        rating: 5,
        text: "Professional, caring and great communication. Highly recommend!"
    }
];

const grid = document.getElementById("reviewsGrid");

function renderReviews() {
    reviews.forEach(r => {
        const div = document.createElement("div");
        div.className = "review-card reveal";

        div.innerHTML = `
            <div class="review-stars">${"★".repeat(r.rating)}</div>
            <p class="review-text">“${r.text}”</p>
            <div>
                <div class="review-author">– ${r.name}</div>
                <div class="review-location">${r.location}</div>
            </div>
        `;

        grid.appendChild(div);
    });
}

renderReviews();
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
