import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDA_OYOZsHvA-pN5SKZCK2fe1t7CV7JY8",
  authDomain: "central-home-a6779.firebaseapp.com",
  projectId: "central-home-a6779",
  storageBucket: "central-home-a6779.firebasestorage.app",
  messagingSenderId: "524918321734",
  appId: "1:524918321734:web:a883743b9c54fcfebb9047",
  measurementId: "G-MYLJHW2TYY"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const auth = getAuth(app);

export const isConfigured = true;

