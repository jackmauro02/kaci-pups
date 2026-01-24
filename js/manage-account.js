import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("accountForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const postcode = document.getElementById("postcode");

const editSaveBtn = document.getElementById("editSaveBtn");
const saveStatus = document.getElementById("saveStatus");

let currentUserId = null;
let isEditing = false;

/* Lock fields by default */
function setReadOnly(state) {
  [firstName, lastName, phone, address, postcode].forEach(input => {
    input.readOnly = state;
    input.classList.toggle("editable", !state);
  });
}

email.readOnly = true;
setReadOnly(true);

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUserId = user.uid;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const data = snap.data();

  firstName.value = data.firstName || "";
  lastName.value = data.lastName || "";
  email.value = data.email || user.email || "";
  phone.value = data.phone || "";
  address.value = data.address || "";
  postcode.value = data.postcode || "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isEditing) {
    isEditing = true;
    editSaveBtn.textContent = "Save changes";
    setReadOnly(false);
    return;
  }

  try {
    await updateDoc(doc(db, "users", currentUserId), {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      phone: phone.value.trim(),
      address: address.value.trim(),
      postcode: postcode.value.trim(),
      updatedAt: new Date().toISOString()
    });

    isEditing = false;
    editSaveBtn.textContent = "Edit details";
    setReadOnly(true);

    saveStatus.classList.remove("hidden");
    setTimeout(() => saveStatus.classList.add("hidden"), 2000);

  } catch (err) {
    alert("Failed to save changes");
    console.error(err);
  }
});
