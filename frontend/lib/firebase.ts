import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCR8fby_tcyI6u31sYc8k8X5dzoD6IYLvQ",
  authDomain: "adaptify-83958.firebaseapp.com",
  databaseURL: "https://adaptify-83958-default-rtdb.firebaseio.com",
  projectId: "adaptify-83958",
  storageBucket: "adaptify-83958.firebasestorage.app",
  messagingSenderId: "767704331681",
  appId: "1:767704331681:web:75e399c7b73102dad1c7e0",
  measurementId: "G-SL6P80MXCK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);