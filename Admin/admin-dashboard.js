import { auth, db } from "../js/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const pendingContainer = document.getElementById("pendingBookings");
const upcomingContainer = document.getElementById("approvedBookings");
const previousContainer = document.getElementById("previousBookings");

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }
  loadBookings();
});

async function loadBookings() {
  pendingContainer.innerHTML = "";
  upcomingContainer.innerHTML = "";
  previousContainer.innerHTML = "";

  const now = new Date();

  const q = query(
    collection(db, "bookings"),
    orderBy("date", "asc")
  );

  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    const b = docSnap.data();

    // ✅ Guard against broken bookings
    if (!b.date) return;

    const bookingDate = b.date.toDate();
    const status = b.status || "pending";

    const card = document.createElement("div");
    card.className = "booking-card";

    card.innerHTML = `
      <strong>${b.dogName || "Unknown Dog"}</strong>
      <p>${b.service || ""}</p>
      <p>${bookingDate.toDateString()} – ${b.time || ""}</p>
      <p>£${b.price || "0"}</p>
      <p>Status: ${status}</p>
    `;

    // 🟡 PENDING
    if (status === "pending") {
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => approveBooking(docSnap.id);

      card.appendChild(approveBtn);
      pendingContainer.appendChild(card);
      return;
    }

    // 🟢 UPCOMING
    if (status === "approved" && bookingDate >= now) {
      upcomingContainer.appendChild(card);
      return;
    }

    // ⚪ PREVIOUS
    if (status === "approved" && bookingDate < now) {
      previousContainer.appendChild(card);
    }
  });
}

async function approveBooking(id) {
  await updateDoc(doc(db, "bookings", id), {
    status: "approved"
  });
  loadBookings();
}
