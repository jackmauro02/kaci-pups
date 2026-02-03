import { auth, db } from "../js/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  Timestamp
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= DOM ================= */
const pendingContainer = document.getElementById("pendingBookings");
const upcomingContainer = document.getElementById("approvedBookings");
const previousContainer = document.getElementById("previousBookings");
const changeRequestsContainer = document.getElementById("changeRequests"); 

/* ===== CALENDAR DOM ===== */
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const dayDetails = document.getElementById("calendarDayDetails");
const dayTitle = document.getElementById("selectedDayTitle");
const dayBookings = document.getElementById("selectedDayBookings");

/* ================= STATE ================= */
let allBookings = [];
let calendarDate = new Date();

/* ================= AUTH ================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }
  loadBookings();
});

/* ================= LOAD BOOKINGS ================= */
async function loadBookings() {
  pendingContainer.innerHTML = "";
  upcomingContainer.innerHTML = "";
  previousContainer.innerHTML = "";
  changeRequestsContainer.innerHTML = "";

  const now = new Date();
  const snap = await getDocs(query(collection(db, "bookings")));
  const bookings = [];

  snap.forEach(d => {
    const b = d.data();
    let bookingDate;

    if (b.bookingAt?.toDate) {
      bookingDate = b.bookingAt.toDate();
    } else if (b.date && b.time) {
      bookingDate = new Date(`${b.date}T${b.time}`);
    } else {
      return;
    }

    bookings.push({ id: d.id, ...b, bookingDate });
  });

  bookings.sort((a, b) => a.bookingDate - b.bookingDate);

  allBookings = bookings;
  renderCalendar();

  bookings.forEach(b => renderBooking(b, now));
}

/* ================= CALENDAR ================= */
function renderCalendar() {
  if (!calendarGrid) return;

  calendarGrid.innerHTML = "";
  dayDetails.classList.add("hidden");

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  calendarTitle.textContent = calendarDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.innerHTML = `<strong>${day}</strong>`;

    const dayBookingsList = allBookings.filter(b =>
      b.bookingDate.getFullYear() === year &&
      b.bookingDate.getMonth() === month &&
      b.bookingDate.getDate() === day
    );

    if (dayBookingsList.length) {
      const badge = document.createElement("div");
      badge.className = "count";
      badge.textContent = dayBookingsList.length;
      cell.appendChild(badge);

      cell.onclick = () =>
        openCalendarDay(dayBookingsList, day, month, year);
    }

    calendarGrid.appendChild(cell);
  }
}

function openCalendarDay(bookings, day, month, year) {
  dayDetails.classList.remove("hidden");
  dayBookings.innerHTML = "";

  dayTitle.textContent = new Date(year, month, day)
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

  bookings.forEach(b => {
    const div = document.createElement("div");
    div.className = "calendar-day-booking";
    div.innerHTML = `
      <strong>${b.dogName || "Dog booking"}</strong><br>
      ${b.service}<br>
      ${b.bookingDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      })} – £${b.price}
    `;
    dayBookings.appendChild(div);
  });
}

prevMonthBtn?.addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn?.addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});

/* ================= RENDER BOOKINGS ================= */
function renderBooking(b, now) {
  const status = b.status || "pending";

  const card = document.createElement("div");
  card.className = "booking-card";

  const dateStr = b.bookingDate.toLocaleDateString("en-GB");
  const timeStr = b.bookingDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  /* ===== FIX #1: SAFELY READ REQUESTED CHANGE ===== */
  let requestedHtml = "";

  if (b.requestedChange) {
    let reqDate = b.requestedChange.date;
    let reqTime = b.requestedChange.time;

    if (!reqDate && b.requestedChange.bookingAt?.toDate) {
      const d = b.requestedChange.bookingAt.toDate();
      reqDate = d.toISOString().split("T")[0];
      reqTime = d.toTimeString().slice(0, 5);
    }

    requestedHtml = `
      <div class="requested-change">
        <p><strong>Requested change:</strong></p>
        <p>${reqDate || "—"} – ${reqTime || "—"}</p>
        <small>
          Requested at:
          ${b.requestedChange.requestedAt?.toDate?.().toLocaleString("en-GB") || "—"}
        </small>
      </div>
    `;
  }

  card.innerHTML = `
    <strong>${b.dogName || "Dog booking"}</strong>
    <p>${b.service}</p>
    <p>${dateStr} – ${timeStr}</p>
    ${requestedHtml}
    <p>£${b.price}</p>

    <span class="status ${status}">${status.replace("_", " ")}</span>

    <button class="details-btn">View details</button>
    <div class="details hidden"></div>

    <div class="edit-panel hidden">
      <input type="date" class="edit-date" value="${b.date || ""}">
      <input type="time" class="edit-time" value="${b.time || ""}">
      <button class="primary save-edit">Save</button>
      <button class="danger cancel-edit">Cancel</button>
    </div>

    <div class="admin-actions"></div>
  `;


  
  /* ================= DETAILS ================= */
  const detailsBtn = card.querySelector(".details-btn");
  const detailsBox = card.querySelector(".details");

  detailsBtn.onclick = async () => {
    const userSnap = await getDoc(doc(db, "users", b.userId));
    const dogSnap = await getDoc(doc(db, "users", b.userId, "dogs", b.dogId));

    const user = userSnap.data() || {};
    const dog = dogSnap.data() || {};

    detailsBox.innerHTML = `
      <hr>
      <h4>Owner</h4>
      <p>${user.firstName || ""} ${user.lastName || ""}</p>
      <p>${user.email || ""}</p>
      <p>${user.phone || ""}</p>
      <p><strong>Pickup:</strong> ${user.address || "—"}</p>

      <h4>Dog</h4>
      <p>Name: ${dog.name || ""}</p>
      <p>Breed: ${dog.breed || ""}</p>
      <p>Age: ${dog.age || ""}</p>
      <p>Behaviour: ${dog.behaviour || "—"}</p>
      <p>Fears: ${dog.fears || "—"}</p>
      <p>Vet: ${dog.vets || "—"}</p>
      <p>Notes: ${dog.leadNotes || "—"}</p>
    `;

    detailsBox.classList.toggle("hidden");
  };

  const actions = card.querySelector(".admin-actions");
  const editPanel = card.querySelector(".edit-panel");

  /* ================= EDIT ================= */
  addBtn(actions, "Edit date/time", () => {
    editPanel.classList.remove("hidden");
  });

  card.querySelector(".cancel-edit").onclick = () => {
    editPanel.classList.add("hidden");
  };

  card.querySelector(".save-edit").onclick = async () => {
    const newDate = card.querySelector(".edit-date").value;
    const newTime = card.querySelector(".edit-time").value;
    if (!newDate || !newTime) return;

    await updateDoc(doc(db, "bookings", b.id), {
      bookingAt: Timestamp.fromDate(new Date(`${newDate}T${newTime}`)),
      date: newDate,
      time: newTime
    });

    loadBookings();
  };

    /* ================= STATUS LOGIC ================= */

  /* ===== FIX #2: CHANGE REQUESTS ALWAYS FIRST ===== */
  if (status === "change_requested" && b.requestedChange) {
    addBtn(actions, "Approve change", async () => {
      await updateDoc(doc(db, "bookings", b.id), {
        bookingAt: Timestamp.fromDate(
          new Date(`${b.requestedChange.date}T${b.requestedChange.time}`)
        ),
        date: b.requestedChange.date,
        time: b.requestedChange.time,
        requestedChange: null,
        status: "approved"
      });
      loadBookings();
    });

    addBtn(actions, "Decline change", async () => {
      await updateDoc(doc(db, "bookings", b.id), {
        requestedChange: null,
        status: "approved"
      });
      loadBookings();
    }, "danger");

    changeRequestsContainer.appendChild(card);
    return; // ⬅️ IMPORTANT: never fall through
  }


  
  if (status === "pending") {
    addBtn(actions, "Approve", () => setStatus(b.id, "approved"));
    addBtn(actions, "Decline", () => setStatus(b.id, "declined"), "danger");
    pendingContainer.appendChild(card);
    return;
  }

  if (status === "approved" && b.bookingDate >= now) {
    upcomingContainer.appendChild(card);
    return;
  }

  previousContainer.appendChild(card);
}

/* ================= HELPERS ================= */
function addBtn(container, text, fn, type = "primary") {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = type;
  btn.onclick = fn;
  container.appendChild(btn);
}

async function setStatus(id, status) {
  await updateDoc(doc(db, "bookings", id), { status });
  loadBookings();
}
