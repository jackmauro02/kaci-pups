import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ELEMENTS */
const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
const googleBtn = document.getElementById("googleLogin");

/* AUTH STATE */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
  } else {
    authSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
  }
});

/* LOGIN */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(
      auth,
      loginEmail.value,
      loginPassword.value
    );
  } catch (err) {
    alert(err.message);
  }
});

/* REGISTER */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      registerEmail.value,
      registerPassword.value
    );

    await setDoc(doc(db, "users", cred.user.uid), {
      firstName: firstName.value,
      lastName: lastName.value,
      email: registerEmail.value,
      phone: phone.value,
      address: address.value,
      postcode: postcode.value,
      provider: "password",
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    alert(err.message);
  }
});

/* LOGOUT */
logoutBtn.addEventListener("click", () => signOut(auth));

/* ================= GOOGLE SIGN IN ================= */

const provider = new GoogleAuthProvider();

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      // Create Firestore user ONLY if first time
      if (!snap.exists()) {
        const nameParts = user.displayName?.split(" ") || [];

        await setDoc(userRef, {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email,
          provider: "google",
          createdAt: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    }
  });
}
