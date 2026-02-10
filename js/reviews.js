const reviews = [
    {
        name: "Luke",
        location: "Bracknell",
        rating: 5,
        text: "Kaci has been brilliant with Bella. She’s always excited for her walks and comes home calm and happy."
    },
    {
        name: "Jamie",
        location: "Binfield",
        rating: 5,
        text: "Bobby absolutely loves his walks with Kaci. Reliable, friendly, and great with energetic dogs."
    },
    {
        name: "Tasha",
        location: "Reading",
        rating: 5,
        text: "Buddy can be a handful but Kaci handles him so well. Really reassuring knowing he’s in safe hands."
    },
    {
        name: "Stephan",
        location: "Ascot",
        rating: 5,
        text: "Poppy took to Kaci straight away. Excellent communication and very professional service."
    },
    {
        name: "Michelle",
        location: "Bracknell",
        rating: 5,
        text: "Diesel is a hyperactive, strong dog and Kaci manages him confidently. Couldn’t ask for better care, She even taught him some tricks!"
    },
    {
        name: "John",
        location: "Wokingham",
        rating: 5,
        text: "Bruce is always relaxed after his walks. Kaci is punctual, caring, and clearly loves what she does."
    },
    {
        name: "Jack",
        location: "Warfield",
        rating: 5,
        text: "Rambo needs structure and consistency, and Kaci delivers every time. Highly recommended."
    },
    {
        name: "Hannah",
        location: "Crowthorne",
        rating: 4,
        text: "Great service overall. Our dog Milo really enjoys his walks — just wish we’d found Kaci sooner."
    },
    {
        name: "Ryan",
        location: "Sandhurst",
        rating: 4,
        text: "Very dependable and friendly. Max is always well looked after and comes back tired and content."
    },
    {
        name: "Sophie",
        location: "Earley",
        rating: 3,
        text: "Good experience overall. Daisy took a little time to settle, but Kaci was patient and understanding."
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
