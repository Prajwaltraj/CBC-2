import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
});

const db = getDatabase(app);
const r = ref(db, 'registeredTeams/cc1340975_gmail_com');
get(r).then(s => {
  if (s.exists()) console.log("FOUND!");
  else console.log("NOT FOUND!");
  process.exit();
}).catch(console.error);
