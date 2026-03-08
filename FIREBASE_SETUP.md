# Firebase Firestore Setup

This app uses Firebase Firestore for data storage. Follow these steps to get your credentials.

## Tokens You Need (Quick Reference)

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID (e.g. `storesight-sheets`) |
| `FIREBASE_CLIENT_EMAIL` | Service account email (e.g. `firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com`) |
| `FIREBASE_PRIVATE_KEY` | Full private key from the service account JSON, including `-----BEGIN/END PRIVATE KEY-----` |

All three come from the service account JSON you download in Step 3.

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
| `FIREBASE_PRIVATE_KEY` | `private_key` (the full value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) |

**Important for `FIREBASE_PRIVATE_KEY`:**
- Copy the entire key including the `\n` characters (or actual newlines)
- When setting in Vercel or `.env.local`, if the key has actual newlines, you may need to replace them with `\n` as a literal two-character sequence
- Some platforms require: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

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
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### Vercel deployment

1. Go to your project on [Vercel](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Add each variable:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (paste the full key; Vercel handles multi-line values)
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
