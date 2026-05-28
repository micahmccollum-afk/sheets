import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let initFailed = false;

function parsePrivateKey(): string | undefined {
  const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim().replace(/\s/g, "");
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKeyBase64) {
    try {
      const decoded = Buffer.from(privateKeyBase64, "base64").toString("utf-8");
      if (!decoded.includes("-----BEGIN")) {
        return undefined;
      }
      return decoded;
    } catch {
      return undefined;
    }
  }
  if (privateKeyRaw) {
    const key = privateKeyRaw.replace(/\\n/g, "\n").trim();
    return key.includes("-----BEGIN") ? key : undefined;
  }
  return undefined;
}

function getFirebaseCredential(): ServiceAccount | undefined {
  if (initFailed) return undefined;

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = parsePrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    return undefined;
  }

  const credential = { projectId, clientEmail, privateKey };
  try {
    cert(credential); // Validate key format - throws if invalid PEM
    return credential;
  } catch {
    initFailed = true;
    return undefined;
  }
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
