# Firebase Firestore Setup

This app uses Firebase Firestore for data storage. Follow these steps to get your credentials.

## Tokens You Need (Quick Reference)

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID (e.g. `storesight-sheets`) |
| `FIREBASE_CLIENT_EMAIL` | Service account email (e.g. `firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com`) |
| `FIREBASE_PRIVATE_KEY_BASE64` or `FIREBASE_PRIVATE_KEY` | Base64-encoded private key (recommended) or raw private key |

All come from the service account JSON. Use base64 for the private key to avoid newline issues on Vercel.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** (or use an existing project)
3. Enter a project name (e.g. "storesight-sheets") and follow the prompts
4. Enable **Google Analytics** if you want (optional)

## 2. Enable Firestore

1. In the Firebase Console, open your project
2. In the left sidebar, go to **Build** → **Firestore Database**
3. Click **Create database**
4. Choose **Start in production mode** (we use the Admin SDK with a service account, so security rules are not enforced the same way)
5. Select a location (e.g. `us-central1`)
6. Click **Enable**

## 3. Create a Service Account

1. Click the **gear icon** (Project settings) next to "Project Overview"
2. Go to the **Service accounts** tab
3. Click **Generate new private key** → **Generate key**
4. A JSON file will download. **Keep this file secure** — it contains your private key.

## 4. Extract the Credentials

Open the downloaded JSON file. You need three values:

| Env Variable | Where to find it in the JSON |
|--------------|------------------------------|
| `FIREBASE_PROJECT_ID` | `project_id` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` |
| `FIREBASE_PRIVATE_KEY` or `FIREBASE_PRIVATE_KEY_BASE64` | `private_key` |

**Option A – Base64 (recommended for Vercel):**

Encode the `private_key` value as base64 and set `FIREBASE_PRIVATE_KEY_BASE64`:

```bash
# macOS/Linux – from the JSON file
cat your-service-account.json | jq -r '.private_key' | base64 | tr -d '\n'
```

Or use any base64 tool: take the full `private_key` string (including newlines) and base64-encode it. Set that result as `FIREBASE_PRIVATE_KEY_BASE64`.

**Option B – Raw key:**

Use `FIREBASE_PRIVATE_KEY` with the full key. Replace newlines with `\n` if needed:
`"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

## 5. Create Firestore Collections

Firestore will create collections automatically when you first write data. The app uses:

- **`audits`** – one document per audit entry (created when you add entries)
- **`config`** – document `app` for custom issue types (created when you add a custom type)

No manual setup needed; they are created on first use.

## 6. Set Environment Variables

### Local development

Create `.env.local` in the project root:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=your-base64-encoded-private-key
```

Or use `FIREBASE_PRIVATE_KEY` with the raw key if you prefer.

### Vercel deployment

1. Go to your project on [Vercel](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Add each variable:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY_BASE64` (base64-encoded private key — recommended to avoid newline issues)
4. Redeploy the app

## 7. (Optional) Firestore Security Rules

If you plan to use the Firebase client SDK elsewhere, you can add rules. For this app (server-side Admin SDK only), the default rules are fine. Example rules for reference:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // Admin SDK bypasses these
    }
  }
}
```

## Remove Old Blob Credentials

You can remove `BLOB_READ_WRITE_TOKEN` from your environment — it is no longer used.
