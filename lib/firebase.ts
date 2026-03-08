import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseCredential(): ServiceAccount | undefined {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return undefined;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

export function isFirebaseConfigured(): boolean {
  return !!getFirebaseCredential();
}

function initFirebase(): void {
  if (getApps().length > 0) return;

  const credential = getFirebaseCredential();
  if (!credential) return;

  initializeApp({ credential: cert(credential) });
}

export function getDb() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY. See FIREBASE_SETUP.md."
    );
  }
  initFirebase();
  return getFirestore();
}
