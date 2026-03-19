import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC74_3Yf6I7Z1dWQfd4WSk0195mDcJteGQ",
  authDomain: "carbon27-app.firebaseapp.com",
  projectId: "carbon27-app",
  storageBucket: "carbon27-app.firebasestorage.app",
  messagingSenderId: "976085705330",
  appId: "1:976085705330:web:b8463ffe540908bcda98eb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
