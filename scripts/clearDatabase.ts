import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const collectionsToClear = [
  'products',
  'orders',
  'feedback_messages',
  'logs',
  'notes',
  'workers',
];

async function clearDatabase() {
  console.log('Starting database cleanup for publishing...');
  
  for (const collectionName of collectionsToClear) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      console.log(`Found ${querySnapshot.size} documents in '${collectionName}'`);
      
      const deletePromises = querySnapshot.docs.map((d) => deleteDoc(doc(db, collectionName, d.id)));
      await Promise.all(deletePromises);
      console.log(`Successfully cleared collection: '${collectionName}'`);
    } catch (err: any) {
      console.error(`Error clearing collection '${collectionName}':`, err?.message || err);
    }
  }

  console.log('Database cleanup completed successfully!');
  process.exit(0);
}

clearDatabase();
