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

const pendingContainer = document.getElementById("pendingBookings");
const upcomingContainer = document.getElementById("approvedBookings");
const previousContainer = document.getElementById("previousBookings");

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
  bookings.forEach(b => renderBooking(b, now));
}

/* ================= RENDER ================= */
function renderBooking(b, now) {
  const status = b.status || "pending";

  const card = document.createElement("div");
  card.className = "booking-card";

  const dateStr = b.bookingDate.toLocaleDateString("en-GB");
  const timeStr = b.bookingDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  card.innerHTML = `
    <strong>${b.dogName || "Dog booking"}</strong>
    <p>${b.service}</p>
    <p>${dateStr} – ${timeStr}</p>
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

  if (status === "pending") {
    addBtn(actions, "Approve", () => setStatus(b.id, "approved"));
    addBtn(actions, "Decline", () => setStatus(b.id, "declined"), "danger");
    pendingContainer.appendChild(card);
    return;
  }

  if (status === "change_requested") {
    let requestedDateStr = "—";
    let requestedTimeStr = "—";

    if (b.changeRequest?.requestedDate?.toDate) {
      requestedDateStr =
        b.changeRequest.requestedDate.toDate().toLocaleDateString("en-GB");
    }

    if (b.changeRequest?.requestedTime) {
      requestedTimeStr = b.changeRequest.requestedTime;
    }

    card.insertAdjacentHTML("beforeend", `
      <p><strong>Requested:</strong> ${requestedDateStr} – ${requestedTimeStr}</p>
    `);

    addBtn(actions, "Approve change", async () => {
      if (!b.changeRequest?.requestedDate || !b.changeRequest?.requestedTime) {
        alert("Change request missing date or time.");
        return;
      }

      await updateDoc(doc(db, "bookings", b.id), {
        bookingAt: b.changeRequest.requestedDate,
        date: requestedDateStr.split("/").reverse().join("-"),
        time: b.changeRequest.requestedTime,
        status: "approved",
        changeRequest: null
      });

      loadBookings();
    });

    addBtn(actions, "Reject change", async () => {
      await updateDoc(doc(db, "bookings", b.id), {
        status: "approved",
        changeRequest: null
      });
      loadBookings();
    }, "danger");

    pendingContainer.appendChild(card);
    return;
  }

  if (status === "cancel_requested") {
    addBtn(actions, "Confirm cancel", () =>
      setStatus(b.id, "declined"), "danger");
    addBtn(actions, "Keep booking", () =>
      setStatus(b.id, "approved"));
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
