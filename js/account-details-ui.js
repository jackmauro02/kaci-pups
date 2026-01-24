const form = document.getElementById("accountForm");
const status = document.getElementById("saveStatus");

/* Fake prefilled user data (replace with Firebase later) */
const user = {
  firstName: "Jack",
  lastName: "Mauro",
  email: "jack@email.com",
  phone: "07xxx xxx",
  address: "Bracknell",
  postcode: "RG12"
};

firstName.value = user.firstName;
lastName.value = user.lastName;
email.value = user.email;
phone.value = user.phone;
address.value = user.address;
postcode.value = user.postcode;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  status.classList.remove("hidden");

  setTimeout(() => {
    status.classList.add("hidden");
  }, 2000);
});
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
