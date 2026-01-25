import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= SERVICES ================= */
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

/* MODAL */
const modal = document.getElementById("changeModal");
const changeDate = document.getElementById("changeDate");
const changeTime = document.getElementById("changeTime");
const changeNote = document.getElementById("changeNote");

let currentUserId = null;
let activeBookingId = null;

const today = new Date().toISOString().split("T")[0];

document.getElementById("date").min = today;
document.getElementById("changeDate").min = today;


/* ================= AUTH ================= */
onAuthStateChanged(auth, async user => {
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
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `${name} – £${price}`;
    opt.dataset.price = price;
    serviceSelect.appendChild(opt);
  });
}

/* ================= LOAD DOGS ================= */
async function loadDogs() {
  dogSelect.innerHTML = `<option value="">Select dog</option>`;
  const snap = await getDocs(collection(db, "users", currentUserId, "dogs"));
  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.data().name;
    dogSelect.appendChild(opt);
  });
}

/* ================= CREATE BOOKING ================= */
form.addEventListener("submit", async e => {
  e.preventDefault();

  if (!dogSelect.value || !serviceSelect.value || !date.value || !time.value) {
    alert("Please fill in all required fields.");
    return;
  }

  const bookingAt = new Date(`${date.value}T${time.value}`);
  const now = new Date();

  // strip seconds for fairness
  now.setSeconds(0, 0);

  if (bookingAt < now) {
    alert("Booking date must be today or in the future.");
    return;
  }

  const serviceOpt = serviceSelect.options[serviceSelect.selectedIndex];

  await addDoc(collection(db, "bookings"), {
    userId: currentUserId,
    dogId: dogSelect.value,
    dogName: dogSelect.options[dogSelect.selectedIndex].text,
    service: serviceOpt.value,
    price: Number(serviceOpt.dataset.price),
    bookingAt: Timestamp.fromDate(bookingAt),
    notes: notes.value || "",
    status: "pending",
    createdAt: Timestamp.now()
  });

  form.reset();
  loadBookings();
});


/* ================= LOAD BOOKINGS ================= */
async function loadBookings() {
  upcomingList.innerHTML = "";
  pastList.innerHTML = "";

  const snap = await getDocs(
    query(collection(db, "bookings"), where("userId", "==", currentUserId))
  );

  const now = new Date();
  const bookings = [];

  snap.forEach(d => {
    const b = d.data();
    if (!b.bookingAt?.toDate) return;

    bookings.push({
      id: d.id,
      ...b,
      bookingDate: b.bookingAt.toDate()
    });
  });

  bookings.sort((a, b) => a.bookingDate - b.bookingDate);

  bookings.forEach(b => {
    const isPast = b.bookingDate < now;

    const item = document.createElement("div");
    item.className = "booking-item";

    item.innerHTML = `
      <div class="booking-info">
        <h4>${b.dogName} – ${b.service}</h4>
        <p>${formatDate(b.bookingDate)} • ${formatTime(b.bookingDate)} • £${b.price}</p>
        <span class="status ${b.status}">${formatStatus(b.status)}</span>
      </div>

      ${!isPast ? `
      <div class="booking-actions">
        <button class="btn-sm btn-secondary" data-change="${b.id}">Request change</button>
        <button class="btn-sm btn-danger" data-cancel="${b.id}">Request cancel</button>
      </div>` : ""}
    `;

    isPast ? pastList.appendChild(item) : upcomingList.appendChild(item);
  });

  attachHandlers();
}

/* ================= ACTION HANDLERS ================= */
function attachHandlers() {

  document.querySelectorAll("[data-change]").forEach(btn => {
    btn.onclick = () => {
      activeBookingId = btn.dataset.change;
      modal.classList.remove("hidden");
    };
  });

  document.querySelectorAll("[data-cancel]").forEach(btn => {
    btn.onclick = async () => {
  if (!confirm("Are you sure you want to request cancellation?")) return;

  await updateDoc(doc(db, "bookings", btn.dataset.cancel), {
    status: "cancel_requested",
    cancelRequest: { requestedAt: Timestamp.now() }
  });

  loadBookings();
};

  });
}

document.getElementById("cancelChange").onclick = () => {
  modal.classList.add("hidden");
  activeBookingId = null;
};

document.getElementById("submitChange").onclick = async () => {
  if (!activeBookingId) return;

  if (!changeDate.value || !changeTime.value) {
    alert("Please select a new date and time.");
    return;
  }

  const requestedDate = new Date(`${changeDate.value}T${changeTime.value}`);
  const now = new Date();

  now.setSeconds(0, 0);

  if (requestedDate < now) {
    alert("Change request must be for a future date.");
    return;
  }

  await updateDoc(doc(db, "bookings", activeBookingId), {
    status: "change_requested",
    changeRequest: {
      requestedAt: Timestamp.now(),
      requestedDate: Timestamp.fromDate(requestedDate),
      note: changeNote.value || ""
    }
  });

  modal.classList.add("hidden");
  changeDate.value = "";
  changeTime.value = "";
  changeNote.value = "";
  activeBookingId = null;

  loadBookings();
};


/* ================= HELPERS ================= */
function formatDate(d) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(d) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function formatStatus(s) {
  return s.replace("_", " ");
}
