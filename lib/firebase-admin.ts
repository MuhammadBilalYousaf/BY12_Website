import { initializeApp, getApps, cert, App, applicationDefault } from "firebase-admin/app"
import { getFirestore, Firestore } from "firebase-admin/firestore"

let adminApp: App | undefined
let adminDb: Firestore | undefined

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0]
    adminDb = getFirestore(adminApp)
    return
  }

  try {
    // Check if we have a service account private key
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "by12-b3606",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "by12-b3606",
      })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use default credentials if available
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "by12-b3606",
      })
    } else {
      // Initialize without credentials - will only work for emulator or limited operations
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "by12-b3606",
      })
    }
    adminDb = getFirestore(adminApp)
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error)
    adminApp = undefined
    adminDb = undefined
  }
}

// Initialize on module load
initializeFirebaseAdmin()

export { adminDb, adminApp }
