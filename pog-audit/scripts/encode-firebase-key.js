#!/usr/bin/env node
/**
 * Generates FIREBASE_PRIVATE_KEY_BASE64 from a service account JSON file.
 * Usage: node scripts/encode-firebase-key.js path/to/your-service-account.json
 *
 * Copy the output and add it as FIREBASE_PRIVATE_KEY_BASE64 in Vercel.
 */

const fs = require("fs");
const path = require("path");

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: node scripts/encode-firebase-key.js <path-to-service-account.json>");
  console.error("Example: node scripts/encode-firebase-key.js ~/Downloads/your-firebase-key.json");
  process.exit(1);
}

const resolved = path.resolve(jsonPath);
if (!fs.existsSync(resolved)) {
  console.error("File not found:", resolved);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(resolved, "utf8"));
const privateKey = data.private_key;
if (!privateKey) {
  console.error("No private_key field in JSON");
  process.exit(1);
}

const base64 = Buffer.from(privateKey, "utf8").toString("base64");
console.log("\nFIREBASE_PRIVATE_KEY_BASE64 (copy this to Vercel):\n");
console.log(base64);
console.log("\nAlso set FIREBASE_PROJECT_ID:", data.project_id);
console.log("And FIREBASE_CLIENT_EMAIL:", data.client_email);
console.log("");
