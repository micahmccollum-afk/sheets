import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseCredential(): ServiceAccount | undefined {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  const privateKey = privateKeyBase64
    ? Buffer.from(privateKeyBase64, "base64").toString("utf-8")
    : privateKeyRaw?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return undefined;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function isFirebaseConfigured(): boolean {
  return !!getFirebaseCredential();
}

export function getMissingFirebaseVars(): string[] {
  const missing: string[] = [];
  if (!process.env.FIREBASE_PROJECT_ID) missing.push("FIREBASE_PROJECT_ID");
  if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push("FIREBASE_CLIENT_EMAIL");
  const hasKey =
    process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY;
  if (!hasKey) missing.push("FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY");
  return missing;
}

function initFirebase(): void {
  if (getApps().length > 0) return;

  const credential = getFirebaseCredential();
  if (!credential) return;

  initializeApp({ credential: cert(credential) });
}

export function getDb() {
  if (!isFirebaseConfigured()) {
    const missing = getMissingFirebaseVars();
    throw new Error(
      `Firebase not configured. Missing in Vercel env: ${missing.join(", ")}. See FIREBASE_SETUP.md.`
    );
  }
  initFirebase();
  return getFirestore();
}
