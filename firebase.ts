import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQ-qbbdQMYP8C2AdcnqsKonecSAWylRFw",
  authDomain: "ideaworksgestion.firebaseapp.com",
  projectId: "ideaworksgestion",
  storageBucket: "ideaworksgestion.appspot.com",
  messagingSenderId: "514012378160",
  appId: "1:514012378160:web:5b3bce80e23dd7255ce9f5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  db,
  storage
}
