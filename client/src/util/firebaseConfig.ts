import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZgOKEPiY9QMd1t9F-xBWi0dRjA1tKjPU",
  authDomain: "badminton-64842.firebaseapp.com",
  projectId: "badminton-64842",
  storageBucket: "badminton-64842.firebasestorage.app",
  messagingSenderId: "1092295214116",
  appId: "1:1092295214116:web:7c479b9c966c8c13f804b1",
  measurementId: "G-4X07NJ62QB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
