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
  addDoc,
  Timestamp
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= Book ================= */
const adminUserSelect = document.getElementById("adminUserSelect");
const adminDogSelect = document.getElementById("adminDogSelect");
const adminServiceSelect = document.getElementById("adminServiceSelect");
const adminDateInput = document.getElementById("adminDate");
const adminTimeInput = document.getElementById("adminTime");
const adminPriceInput = document.getElementById("adminPrice");
const adminPaymentStatus = document.getElementById("adminPaymentStatus");
const adminCreateBtn = document.getElementById("adminCreateBookingBtn");

const SERVICE_PRICES = {
  solo_home_30: 12,
  solo_home_45: 15,

  solo_driven_30: 14,
  solo_driven_45: 17,

  group_30: 11,
  group_60: 15,

  dropin_30: 10,
  dropin_60: 16,

  holiday_day: 30,
  holiday_constant: 90,

  vet_hour: 14
};


/* ================= DOM ================= */
const pendingContainer = document.getElementById("pendingBookings");
const upcomingContainer = document.getElementById("approvedBookings");
const previousContainer = document.getElementById("previousBookings");
const changeRequestsContainer = document.getElementById("changeRequests");
const bookingSearch = document.getElementById("bookingSearch");


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
  loadUsersForAdmin();
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

  for (const d of snap.docs) {
  const b = d.data();
  let bookingDate;

  if (b.bookingAt?.toDate) {
    bookingDate = b.bookingAt.toDate();
  } else if (b.date && b.time) {
    bookingDate = new Date(`${b.date}T${b.time}`);
  } else {
    continue;
  }

  // 🔥 fetch owner safely
  let ownerName = "";
  if (b.userId) {
    try {
      const userSnap = await getDoc(doc(db, "users", b.userId));
      const userData = userSnap.data() || {};
      ownerName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }

  bookings.push({
    id: d.id,
    ...b,
    bookingDate,
    ownerName
  });
}


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

  if (b.changeRequest?.requestedDate?.toDate) {

  const requestedDateObj = b.changeRequest.requestedDate.toDate();

  const reqDateStr = requestedDateObj.toISOString().split("T")[0];
  const reqTimeStr = requestedDateObj.toTimeString().slice(0, 5);

  const reqDisplayDate = requestedDateObj.toLocaleDateString("en-GB");
  const reqDisplayTime = requestedDateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const note = b.changeRequest.note || "—";

  requestedHtml = `
    <div class="requested-change">
      <p><strong>Requested change:</strong></p>
      <p>${reqDisplayDate} – ${reqDisplayTime}</p>
      <p><strong>Notes:</strong> ${note}</p>
      <small>
        Requested at:
        ${b.changeRequest.requestedAt?.toDate?.().toLocaleString("en-GB") || "—"}
      </small>
    </div>
  `;
}


  card.innerHTML = `
    <strong>${b.dogName || "Dog booking"}</strong>
    <p>${b.service}</p>
    <p>${dateStr} – ${timeStr}</p>
    ${requestedHtml}
    <p>£${b.price}
      <strong class="${b.paymentStatus === "paid" ? "paid" : "unpaid"}">
        ${b.paymentStatus === "paid" ? "Paid" : "Unpaid"}
      </strong>
      </p>

    <span class="status ${status}">${status.replace("_", " ")}</span>
    

    <button class="details-btn">View details</button>
    <div class="details hidden"></div>

   <div class="edit-panel">
  <input type="date" class="edit-date" value="${
    b.changeRequest?.requestedDate?.toDate
      ? b.changeRequest.requestedDate.toDate().toISOString().split("T")[0]
      : b.bookingDate.toISOString().split("T")[0]
  }">

  <input type="time" class="edit-time" value="${
    b.changeRequest?.requestedDate?.toDate
      ? b.changeRequest.requestedDate.toDate().toTimeString().slice(0, 5)
      : b.bookingDate.toTimeString().slice(0, 5)
  }">

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

  // ================= PAYMENT ACTION =================
if (b.paymentStatus !== "paid") {
  addBtn(
    actions,
    "Mark as paid",
    () => {
      if (!confirm("Mark this booking as paid?")) return;
      markAsPaid(b.id);
    },
    "success"
  );
}

  /* ================= EDIT ================= */
  card.querySelector(".cancel-edit").onclick = () => {
  loadBookings(); // simple reset
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
  /* ================= CHANGE & CANCEL REQUESTS ================= */

if (status === "change_requested") {

  addBtn(actions, "Approve change", async () => {

    if (!b.changeRequest?.requestedDate?.toDate) return;

    const newDateObj = b.changeRequest.requestedDate.toDate();

    await updateDoc(doc(db, "bookings", b.id), {
      bookingAt: Timestamp.fromDate(newDateObj),
      date: newDateObj.toISOString().split("T")[0],
      time: newDateObj.toTimeString().slice(0, 5),
      changeRequest: null,
      status: "approved"
    });

    loadBookings();
  });

  addBtn(actions, "Decline change", async () => {
    await updateDoc(doc(db, "bookings", b.id), {
      changeRequest: null,
      status: "approved"
    });

    loadBookings();
  }, "danger");

  changeRequestsContainer.appendChild(card);
  return;
}


if (status === "cancel_requested") {

  addBtn(actions, "Approve cancel", async () => {
    await updateDoc(doc(db, "bookings", b.id), {
      status: "cancelled",
      cancelledAt: Timestamp.now()
    });

    loadBookings();
  }, "danger");

  addBtn(actions, "Keep booking", async () => {
    await updateDoc(doc(db, "bookings", b.id), {
      status: "approved"
    });

    loadBookings();
  });

  changeRequestsContainer.appendChild(card);
  return;
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


async function markAsPaid(id) {
  await updateDoc(doc(db, "bookings", id), {
    paymentStatus: "paid",
    paidAt: Timestamp.now()
  });
  loadBookings();
}

async function loadUsersForAdmin() {
  const usersSnap = await getDocs(collection(db, "users"));

  adminUserSelect.innerHTML =
    `<option value="">Select Customer</option>`;

  usersSnap.forEach(docSnap => {
    const user = docSnap.data();

    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = `${user.firstName || ""} ${user.lastName || ""}`;

    adminUserSelect.appendChild(option);
  });
}

adminUserSelect.addEventListener("change", async () => {

  const userId = adminUserSelect.value;
  adminDogSelect.innerHTML = `<option value="">Select Dog</option>`;

  if (!userId) return;

  const dogsSnap = await getDocs(collection(db, "users", userId, "dogs"));

  dogsSnap.forEach(docSnap => {
    const dog = docSnap.data();

    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = dog.name;

    adminDogSelect.appendChild(option);
  });
});

adminCreateBtn.addEventListener("click", async () => {

  const userId = adminUserSelect.value;
  const dogId = adminDogSelect.value;
  const serviceKey = adminServiceSelect.value;
  const date = adminDateInput.value;
  const time = adminTimeInput.value;
  const price = parseFloat(adminPriceInput.value);
  const paymentStatus = adminPaymentStatus.value;

  if (!userId || !dogId || !serviceKey || !date || !time || !price) {
    alert("Please fill all fields.");
    return;
  }

  const bookingDateObj = new Date(`${date}T${time}`);

  const dogSnap = await getDoc(doc(db, "users", userId, "dogs", dogId));
  const dogData = dogSnap.data();

  const serviceLabel =
    adminServiceSelect.options[adminServiceSelect.selectedIndex].text;

  await addDoc(collection(db, "bookings"), {
    userId,
    dogId,
    dogName: dogData.name,

    service: serviceLabel,   // CLEAN NAME
    serviceKey,              // INTERNAL KEY (future use)

    bookingAt: Timestamp.fromDate(bookingDateObj),
    date,
    time,

    price,
    originalPrice: SERVICE_PRICES[serviceKey], // track discount if edited

    paymentStatus,
    status: "approved",

    createdBy: "admin",
    createdAt: Timestamp.now()
  });

  alert("Booking created successfully.");

  adminUserSelect.value = "";
  adminDogSelect.innerHTML = `<option value="">Select Dog</option>`;
  adminServiceSelect.value = "";
  adminDateInput.value = "";
  adminTimeInput.value = "";
  adminPriceInput.value = "";
  adminPaymentStatus.value = "unpaid";

  loadBookings();
});


adminServiceSelect.addEventListener("change", () => {
  const serviceKey = adminServiceSelect.value;
  const price = SERVICE_PRICES[serviceKey];

  if (price) {
    adminPriceInput.value = price;
  }
});

function filterAndRenderBookings(searchTerm) {
  pendingContainer.innerHTML = "";
  upcomingContainer.innerHTML = "";
  previousContainer.innerHTML = "";
  changeRequestsContainer.innerHTML = "";

  const now = new Date();

  const filtered = allBookings.filter(b => {
    const text = `
      ${b.dogName || ""}
      ${b.ownerName || ""}
      ${b.service || ""}
      ${b.status || ""}
      ${b.paymentStatus || ""}
      ${b.date || ""}
    `.toLowerCase();

    return text.includes(searchTerm.toLowerCase());
  });

  filtered.forEach(b => renderBooking(b, now));
}
bookingSearch?.addEventListener("input", e => {
  const value = e.target.value.trim();

  if (!value) {
    loadBookings(); // reset
  } else {
    filterAndRenderBookings(value);
  }
});

