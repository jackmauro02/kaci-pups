console.log("ADMIN REGISTER JS LOADED");

import { auth, db } from "../js/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("Firebase auth:", auth);
console.log("Firebase db:", db);



const btn = document.getElementById("registerBtn");
const errorText = document.getElementById("error");

btn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
    console.log("REGISTER BUTTON CLICKED");
  errorText.textContent = "";

  // ✅ Secret check MUST be inside click handler
  if (!email || !password) {
    errorText.textContent = "Email and password required";
    return;
  }

  try {
    console.log("Creating auth user...");

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    console.log("Auth user created:", cred.user.uid);

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      role: "admin",
      createdAt: new Date()
    });

    console.log("Admin saved to Firestore");

    alert("Admin created successfully");
    window.location.href = "admin-dashboard.html";

  } catch (err) {
    console.error(err);
    errorText.textContent = err.message;
  }
});
