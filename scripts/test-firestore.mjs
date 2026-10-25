import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// Read .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

console.log("Connecting to Firestore project:", env.FIREBASE_PROJECT_ID);

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

const db = getFirestore(app);

async function testConnection() {
  console.log("Writing test document to 'system_health' collection...");
  const docRef = db.collection("system_health").doc("ping");
  await docRef.set({
    status: "connected",
    platform: "DEL Services Cloud ERP",
    testedAt: new Date().toISOString(),
    engine: "Google Cloud Firestore Standard Edition",
  });
  console.log("Document successfully written!");

  const snap = await docRef.get();
  console.log("Read back from Firestore:", snap.data());
  console.log("SUCCESS: Firebase Firestore is 100% connected and functional!");
}

testConnection().catch(console.error);
