import { db } from "./firebase.js";
import { collection, addDoc } from 
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function testWrite() {
  await addDoc(collection(db, "test"), {
    message: "Firebase works 🎉",
    created: new Date()
  });

  console.log("Firestore write successful");
}

testWrite();
