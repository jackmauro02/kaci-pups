// --- FIREBASE AUTH REDIRECT ---
import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Logged-in users should not use public bookings page
    window.location.replace("loggedBookings.html");
  }
});

// --- BOOKING FORM UX ---
document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const button = e.target.querySelector("button");
  button.disabled = true;
  button.textContent = "Sending request...";

  setTimeout(() => {
    e.target.reset();
    button.textContent = "Request Sent ✓";
  }, 1200);
});

// --- MOBILE NAV ---
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
