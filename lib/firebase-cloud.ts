import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { storage as clientStorage, firestore as clientDb, isFirebaseConfigured } from "@/lib/firebase";
import { User, Asset, SystemNotification } from "@/lib/types";

/**
 * Uploads a local file or blob to Firebase Cloud Storage.
 * Returns the public or download URL.
 * Falls back to base64 DataURL if storage is not configured or in offline demo mode.
 */
export async function uploadFileToStorage(
  file: File | Blob,
  destinationPath: string
): Promise<string> {
  // If client Firebase Storage is initialized
  if (clientStorage && isFirebaseConfigured) {
    try {
      const storageRef = ref(clientStorage, destinationPath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn("Firebase Cloud Storage upload failed, falling back to local data URL:", err);
    }
  }

  // Graceful fallback to Data URL for instant rendering & persistence
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      if (typeof window !== "undefined" && file instanceof File) {
        resolve(URL.createObjectURL(file));
      } else {
        resolve("");
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Sync user profile & role to Cloud Firestore (users collection) and Firebase Auth
 */
export async function syncUserToCloud(user: User): Promise<boolean> {
  try {
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      status: user.status,
      assignedDivision: user.assignedDivision || "all",
      faydaFinNumber: user.faydaFinNumber || "",
      tinNumber: user.tinNumber || "",
      kycVerified: user.kycVerified ?? true,
      updatedAt: new Date().toISOString(),
    };

    if (clientDb && isFirebaseConfigured) {
      const userRef = doc(clientDb, "users", user.id);
      await setDoc(userRef, userData, { merge: true });
      return true;
    }
  } catch (err) {
    console.warn("Firestore syncUserToCloud error:", err);
  }
  return false;
}

/**
 * Delete user from Cloud Firestore
 */
export async function deleteUserFromCloud(userId: string): Promise<boolean> {
  try {
    if (clientDb && isFirebaseConfigured) {
      await deleteDoc(doc(clientDb, "users", userId));
      return true;
    }
  } catch (err) {
    console.warn("Firestore deleteUserFromCloud error:", err);
  }
  return false;
}

/**
 * Sync asset to Cloud Firestore (assets collection)
 */
export async function syncAssetToCloud(asset: Asset): Promise<boolean> {
  try {
    const assetData = {
      ...asset,
      updatedAt: new Date().toISOString(),
    };

    if (clientDb && isFirebaseConfigured) {
      await setDoc(doc(clientDb, "assets", asset.id), assetData, { merge: true });
      return true;
    }
  } catch (err) {
    console.warn("Firestore syncAssetToCloud error:", err);
  }
  return false;
}

/**
 * Delete asset from Cloud Firestore
 */
export async function deleteAssetFromCloud(assetId: string): Promise<boolean> {
  try {
    if (clientDb && isFirebaseConfigured) {
      await deleteDoc(doc(clientDb, "assets", assetId));
      return true;
    }
  } catch (err) {
    console.warn("Firestore deleteAssetFromCloud error:", err);
  }
  return false;
}

/**
 * Sync booking to Cloud Firestore (bookings collection)
 */
export async function syncBookingToCloud(booking: any): Promise<boolean> {
  try {
    const bookingData = {
      ...booking,
      updatedAt: new Date().toISOString(),
    };

    if (clientDb && isFirebaseConfigured) {
      await setDoc(doc(clientDb, "bookings", booking.id), bookingData, { merge: true });
      return true;
    }
  } catch (err) {
    console.warn("Firestore syncBookingToCloud error:", err);
  }
  return false;
}

/**
 * Sync notification to Cloud Firestore (notifications collection)
 */
export async function syncNotificationToCloud(notification: SystemNotification): Promise<boolean> {
  try {
    const notifData = {
      ...notification,
      updatedAt: new Date().toISOString(),
    };

    if (clientDb && isFirebaseConfigured) {
      await setDoc(doc(clientDb, "notifications", notification.id), notifData, { merge: true });
      return true;
    }
  } catch (err) {
    console.warn("Firestore syncNotificationToCloud error:", err);
  }
  return false;
}
