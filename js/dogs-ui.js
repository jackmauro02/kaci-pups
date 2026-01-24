const dogsList = document.getElementById("dogsList");
const modal = document.getElementById("dogModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const form = document.getElementById("dogForm");

let dogs = [];
let editIndex = null;

openModalBtn.onclick = () => {
  modal.classList.remove("hidden");
  form.reset();
  editIndex = null;
};

closeModalBtn.onclick = () => modal.classList.add("hidden");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const dog = {
    name: dogName.value,
    breed: dogBreed.value,
    age: dogAge.value,
    behaviour: dogBehaviour.value,
    lead: dogLead.value,
    allergies: dogAllergies.value,
    medical: dogMedical.value
  };

  if (editIndex !== null) {
    dogs[editIndex] = dog;
  } else {
    dogs.push(dog);
  }

  modal.classList.add("hidden");
  renderDogs();
});

function renderDogs() {
  dogsList.innerHTML = "";

  dogs.forEach((dog, index) => {
    const card = document.createElement("div");
    card.className = "dog-card";

    card.innerHTML = `
      <h3>${dog.name}</h3>
      <div class="dog-meta">${dog.breed || "Unknown breed"} • Age ${dog.age || "N/A"}</div>

      <div class="dog-info">
        <p><strong>Behaviour:</strong> ${dog.behaviour || "—"}</p>
        <p><strong>Lead:</strong> ${dog.lead || "—"}</p>
        <p><strong>Allergies:</strong> ${dog.allergies || "—"}</p>
        <p><strong>Medical:</strong> ${dog.medical || "—"}</p>
      </div>

      <div class="dog-actions">
        <button class="btn btn-secondary" onclick="editDog(${index})">Edit</button>
      </div>
    `;

    dogsList.appendChild(card);
  });
}

window.editDog = (index) => {
  const dog = dogs[index];
  editIndex = index;

  dogName.value = dog.name;
  dogBreed.value = dog.breed;
  dogAge.value = dog.age;
  dogBehaviour.value = dog.behaviour;
  dogLead.value = dog.lead;
  dogAllergies.value = dog.allergies;
  dogMedical.value = dog.medical;

  modal.classList.remove("hidden");
};
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
