import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";


/* Elements */
const modal = document.getElementById("dogModal");
const form = document.getElementById("dogForm");
const modalTitle = document.getElementById("modalTitle");
const dogsList = document.getElementById("dogsList");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");

const storage = getStorage();
const dogImage = document.getElementById("dogImage");


/* Fields */
const fields = {
  name: document.getElementById("dogName"),
  breed: document.getElementById("dogBreed"),
  age: document.getElementById("dogAge"),
  behaviour: document.getElementById("dogBehaviour"),
  offLead: document.getElementById("offLead"),
  leadNotes: document.getElementById("leadNotes"),
  fears: document.getElementById("dogFears"),
  allergies: document.getElementById("dogAllergies"),
  medical: document.getElementById("dogMedical"),
  vets: document.getElementById("dogVets")
};


let currentUserId = null;
let editingDogId = null;

/* Auth */
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  currentUserId = user.uid;
  loadDogs();
});

/* Open Add */
openModalBtn.onclick = () => {
  editingDogId = null;
  modalTitle.textContent = "Add Dog";
  form.reset();
  modal.classList.remove("hidden");
};

/* Close */
closeModalBtn.onclick = () => modal.classList.add("hidden");

/* Load Dogs */
async function loadDogs() {
  dogsList.innerHTML = "";

  const ref = collection(db, "users", currentUserId, "dogs");
  const snap = await getDocs(ref);

  snap.forEach(docSnap => {
    const d = docSnap.data();

    const card = document.createElement("div");
    card.className = "dog-card";

    card.innerHTML = `
      <h3>${d.name}</h3>

      <div class="dog-section"><strong>Breed</strong>${d.breed || "—"}</div>
      <div class="dog-section"><strong>Age</strong>${d.age || "—"}</div>
      <div class="dog-section"><strong>Behaviour</strong>${d.behaviour || "—"}</div>
      <div class="dog-section"><strong>Off lead</strong>${d.offLead ? "Yes" : "No"}</div>
      <div class="dog-section"><strong>Lead notes</strong>${d.leadNotes || "—"}</div>
      <div class="dog-section"><strong>Fears</strong>${d.fears || "—"}</div>
      <div class="dog-section"><strong>Allergies</strong>${d.allergies || "—"}</div>
      <div class="dog-section"><strong>Medical</strong>${d.medical || "—"}</div>
      <div class="dog-section"><strong>Vets</strong>${d.vets || "—"}</div>

      <div class="dog-actions">
        <button class="btn btn-secondary edit-btn">Edit</button>
        <button class="btn btn-danger delete-btn">Delete</button>
      </div>
    `;

    /* Edit */
    card.querySelector(".edit-btn").onclick = () => {
      editingDogId = docSnap.id;
      modalTitle.textContent = "Edit Dog";

      Object.keys(fields).forEach(key => {
        if (key === "offLead") {
          fields[key].checked = !!d[key];
        } else {
          fields[key].value = d[key] || "";
        }
      });

      modal.classList.remove("hidden");
    };

    /* Delete */
    card.querySelector(".delete-btn").onclick = async () => {
      await deleteDoc(doc(db, "users", currentUserId, "dogs", docSnap.id));
      loadDogs();
    };

    dogsList.appendChild(card);
  });
}

async function uploadDogImage(file, dogId) {
  const imageRef = ref(
    storage,
    `dogImages/${currentUserId}/${dogId}`
  );

  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}


/* Save (Add or Edit) */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: fields.name.value,
    breed: fields.breed.value,
    age: fields.age.value,
    behaviour: fields.behaviour.value,
    offLead: fields.offLead.checked,
    leadNotes: fields.leadNotes.value,
    fears: fields.fears.value,
    allergies: fields.allergies.value,
    medical: fields.medical.value,
    vets: fields.vets.value
  };

  if (editingDogId) {
    await updateDoc(
      doc(db, "users", currentUserId, "dogs", editingDogId),
      payload
    );
  } else {
    await addDoc(
      collection(db, "users", currentUserId, "dogs"),
      payload
    );
  }

  modal.classList.add("hidden");
  form.reset();
  loadDogs();
});

