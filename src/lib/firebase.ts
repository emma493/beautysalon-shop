import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Firestore's rules can only gate on `request.auth` if a Firebase Auth
 * session actually exists. This app has no sign-up/sign-in screen backed by
 * Firebase Auth (its own "login" is an app-level email/password check
 * against Firestore documents), so without this, every visitor was
 * completely unauthenticated at the Firebase layer — which is what let the
 * previous rules fall back to `allow read, write: if true`.
 *
 * Signing in anonymously as soon as the app loads gives every client a
 * `request.auth.uid`, so the rules can require authentication instead of
 * being wide open. This is a floor, not a ceiling: anyone can still create
 * an anonymous session, so it stops drive-by/unauthenticated scraping of
 * the raw REST API but does not by itself add per-user permissions. Real
 * per-role authorization (e.g. only admins can write products) needs actual
 * Firebase Auth sign-in tied to the app's user records, which requires a
 * backend function and is out of scope for this pass.
 */
export function ensureFirebaseSession(): Promise<void> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve();
      } else {
        signInAnonymously(auth).catch((err: any) => {
          // Log a mild warning if Anonymous Auth provider is restricted or offline
          console.warn('Firebase session note:', err?.code || err?.message || err);
          unsub();
          resolve();
        });
      }
    });
  });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('unavailable') || message.includes('offline') || message.includes('Could not reach Cloud Firestore')) {
    console.warn(`[Firestore Offline Mode] ${operationType} on ${path}: ${message}`);
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export default app;
