import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsd7qxrpmKea4ls5kutdOv7mchJHju1ck",
  authDomain: "kacis-pups.firebaseapp.com",
  projectId: "kacis-pups",
  storageBucket: "kacis-pups.appspot.com",
  messagingSenderId: "884101669914",
  appId: "1:884101669914:web:abea63885130e0b5905da3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
