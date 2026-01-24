import { auth, db } from "../js/firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const errorText = document.getElementById("error");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    const userDoc = await getDoc(doc(db, "users", cred.user.uid));

    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      throw new Error("Not authorised");
    }

    window.location.href = "admin-dashboard.html";
  } catch (err) {
    errorText.textContent = err.message;
  }
});
