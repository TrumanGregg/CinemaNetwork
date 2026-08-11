import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
const missing = requiredVars.filter((key) => !process.env[key] || process.env[key].includes("your-"));

if (missing.length > 0) {
  console.warn(
    `[firebaseAdmin] Missing/placeholder Firebase credentials: ${missing.join(
      ", "
    )}. Firebase-dependent routes will fail until backend/.env is filled in.`
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // .env stores literal \n, Firebase needs real newlines
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    });
  } catch (err) {
    console.error("[firebaseAdmin] Failed to initialize Firebase Admin SDK:", err.message);
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
export const auth = admin.apps.length ? admin.auth() : null;
export default admin;
