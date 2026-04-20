import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAGEFUovIV-So20yceBIrlXozsIjuSO_TA",
  authDomain: "by12-b3606.firebaseapp.com",
  projectId: "by12-b3606",
  storageBucket: "by12-b3606.firebasestorage.app",
  messagingSenderId: "19426192891",
  appId: "1:19426192891:web:d94bd2bef1286b8466ef5e",
  measurementId: "G-VQXGFCDSEL"
};

// Log configuration for debugging (remove in production)
console.log("Firebase Config Check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
})

// Verify all required config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys)
  console.error('Please check your .env.local file')
}

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Admin verification utility
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", userId))
    const isAdmin = adminDoc.exists() && adminDoc.data()?.role === "admin"
    console.log("Admin status check for", userId, ":", isAdmin)
    return isAdmin
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export default app

