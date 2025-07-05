// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIWNClwodCpDmYLLfAPkyjFJT7eshGeYc",
  authDomain: "nepala-913f5.firebaseapp.com",
  projectId: "nepala-913f5",
  storageBucket: "nepala-913f5.firebasestorage.app",
  messagingSenderId: "673278687432",
  appId: "1:673278687432:web:9c70198799f5f8574d8dfd",
  measurementId: "G-YJSXD4243P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };