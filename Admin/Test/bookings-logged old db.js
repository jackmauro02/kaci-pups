import { auth, db } from "../../js/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= SERVICES & PRICES ================= */
const SERVICES = {
  "Solo Walk (From Home) – 30 minutes": 12,
  "Solo Walk (From Home) – 45 minutes": 15,
  "Solo Walk (Driven) – 30 minutes": 14,
  "Solo Walk (Driven) – 45 minutes": 17,
  "Group Walk – 30 minutes": 11,
  "Group Walk – 60 minutes": 15,
  "Drop-In Visit – 30 minutes": 10,
  "Drop-In Visit – 60 minutes": 16,
  "Holiday Care – Per Day/Night": 30,
  "Holiday Care – Weekend Constant Care": 90,
  "Vet Visit – Per Hour": 14
};

/* ================= ELEMENTS ================= */
const form = document.getElementById("bookingForm");
const dogSelect = document.getElementById("dogSelect");
const serviceSelect = document.getElementById("service");
const upcomingList = document.getElementById("upcomingBookings");
const pastList = document.getElementById("pastBookings");

let currentUserId = null;

/* ================= AUTH ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUserId = user.uid;
  loadServices();
  await loadDogs();
  await loadBookings();
});

/* ================= LOAD SERVICES ================= */
function loadServices() {
  serviceSelect.innerHTML = `<option value="">Select service</option>`;

  Object.entries(SERVICES).forEach(([name, price]) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = `${name} – £${price}`;
    option.dataset.price = price;
    serviceSelect.appendChild(option);
  });
}

/* ================= LOAD DOGS ================= */
async function loadDogs() {
  dogSelect.innerHTML = `<option value="">Select dog</option>`;

  const dogsSnap = await getDocs(
    collection(db, "users", currentUserId, "dogs")
  );

  dogsSnap.forEach(docSnap => {
    const dog = docSnap.data();
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = dog.name;
    dogSelect.appendChild(option);
  });
}

/* ================= CREATE BOOKING ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUserId) return;

  const dogId = dogSelect.value;
  const dogName = dogSelect.options[dogSelect.selectedIndex].text;

  const serviceOption = serviceSelect.options[serviceSelect.selectedIndex];
  const service = serviceOption.value;
  const price = Number(serviceOption.dataset.price);

  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const notes = document.getElementById("notes").value;

  if (!dogId || !service || !date || !time) return;

  await addDoc(
    collection(db, "users", currentUserId, "bookings"),
    {
      dogId,
      dogName,
      service,
      price,
      date,
      time,
      notes,
      status: "pending",
      createdAt: Timestamp.now()
    }
  );

  form.reset();
  loadBookings();
});

/* ================= LOAD BOOKINGS ================= */
async function loadBookings() {
  upcomingList.innerHTML = "";
  pastList.innerHTML = "";

  const q = query(
    collection(db, "users", currentUserId, "bookings"),
    orderBy("date", "desc")
  );

  const snap = await getDocs(q);
  const today = new Date().toISOString().split("T")[0];

  snap.forEach(docSnap => {
    const b = docSnap.data();
    const isPast = b.date < today;

    const item = document.createElement("div");
    item.className = "booking-item";

    const reportButton = isPast
      ? `<button class="btn-report" data-report="${b.serviceReportUrl || ""}">
           Service Report
         </button>`
      : "";

    item.innerHTML = `
      <div class="booking-info">
        <h4>${b.dogName} – ${b.service}</h4>
        <p>${b.date} • ${b.time} • £${b.price}</p>
        <span class="status ${b.status}">${capitalize(b.status)}</span>
      </div>
      ${reportButton}
    `;

    isPast ? pastList.appendChild(item) : upcomingList.appendChild(item);
  });

  attachReportHandlers();
}

/* ================= SERVICE REPORT HANDLING ================= */
function attachReportHandlers() {
  document.querySelectorAll(".btn-report").forEach(button => {
    button.addEventListener("click", () => {
      const reportUrl = button.dataset.report;
      reportUrl
        ? window.open(reportUrl, "_blank")
        : showPopup("Service report coming soon");
    });
  });
}

/* ================= POPUP ================= */
function showPopup(message) {
  let popup = document.querySelector(".report-popup");

  if (!popup) {
    popup = document.createElement("div");
    popup.className = "report-popup";
    document.body.appendChild(popup);
  }

  popup.textContent = message;
  popup.classList.add("show");

  setTimeout(() => popup.classList.remove("show"), 2500);
}

/* ================= HELPERS ================= */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ================= MOBILE NAV ================= */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
