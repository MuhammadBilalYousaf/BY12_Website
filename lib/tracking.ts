import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp, increment, QueryConstraint } from "firebase/firestore"
import { CustomerInteraction } from "@/lib/types"

const GUEST_ID_KEY = "guest_session_id"

/**
 * Remove undefined values from an object for Firestore compatibility
 */
function cleanUndefinedValues(obj: any): any {
  const cleaned: any = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

/**
 * Get or create a guest session ID for tracking guest users
 */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return ""
  
  let guestId = localStorage.getItem(GUEST_ID_KEY)
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }
  return guestId
}

/**
 * Clear guest session ID (call after user signs in or completes checkout)
 */
export function clearGuestId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(GUEST_ID_KEY)
}

/**
 * Link all guest interactions to a customer email
 * Call this when a guest provides their email (checkout or signup)
 */
export async function linkGuestInteractionsToEmail(email: string, guestId?: string): Promise<void> {
  try {
    const targetGuestId = guestId || (typeof window !== "undefined" ? localStorage.getItem(GUEST_ID_KEY) : null)
    if (!targetGuestId) return

    const interactionsRef = collection(db, "customerInteractions")
    const q = query(
      interactionsRef,
      where("guestSessionId", "==", targetGuestId)
    ) as any
    
    const snapshot = await getDocs(q)
    
    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, {
        email: email.toLowerCase(),
        guestSessionId: "", // Clear guest ID after linking
        updatedAt: serverTimestamp(),
      })
    }

    console.log(`Linked ${snapshot.docs.length} guest interactions to email: ${email}`)
  } catch (error) {
    console.error("Error linking guest interactions:", error)
  }
}

/**
 * Log a customer interaction to Firestore
 * Used for tracking contact forms, checkout, cart, signups, etc.
 */
export async function logCustomerInteraction(
  interaction: Omit<CustomerInteraction, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const interactionsRef = collection(db, "customerInteractions")
    const cleanedData = cleanUndefinedValues({
      ...interaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const docRef = await addDoc(interactionsRef, cleanedData)
    console.log("Customer interaction logged:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error logging customer interaction:", error)
    throw error
  }
}

/**
 * Update an existing customer interaction
 * Used when adding more data to an ongoing interaction
 */
export async function updateCustomerInteraction(
  interactionId: string,
  updates: Partial<CustomerInteraction>
): Promise<void> {
  try {
    const interactionRef = doc(db, "customerInteractions", interactionId)
    const cleanedData = cleanUndefinedValues({
      ...updates,
      updatedAt: serverTimestamp(),
    })
    await updateDoc(interactionRef, cleanedData)
    console.log("Customer interaction updated:", interactionId)
  } catch (error) {
    console.error("Error updating customer interaction:", error)
    throw error
  }
}

/**
 * Track form field changes (for contact form, checkout, etc.)
 * Logs when a user fills in a field
 * Works for both authenticated users and guests
 */
export async function trackFormFieldChange(
  email: string,
  fieldName: string,
  fieldValue: string | number | boolean,
  interactionType: "contact_form" | "checkout",
  customerId?: string,
  guestSessionId?: string
): Promise<void> {
  try {
    // Use email if available, otherwise use guest session ID
    const identifier = email || guestSessionId
    if (!identifier) return

    // Check if there's an existing interaction for this email/guest and type
    const interactionsRef = collection(db, "customerInteractions")
    
    let q
    if (email) {
      q = query(
        interactionsRef,
        where("email", "==", email),
        where("interactionType", "==", interactionType)
      )
    } else if (guestSessionId) {
      q = query(
        interactionsRef,
        where("guestSessionId", "==", guestSessionId),
        where("interactionType", "==", interactionType)
      )
    } else {
      return
    }

    const existingDocs = await getDocs(q)

    if (existingDocs.size > 0) {
      // Update existing interaction
      const existingDoc = existingDocs.docs[0]
      const existingData = existingDoc.data() as CustomerInteraction
      
      const fieldsFilled = existingData.fieldsFilled || {}
      fieldsFilled[fieldName] = fieldValue
      
      const fieldNames = Object.keys(fieldsFilled)
      const fieldsCount = fieldNames.length

      const updateData = cleanUndefinedValues({
        fieldsFilled,
        fieldNames,
        fieldsCount,
        lastActivityAt: serverTimestamp(),
      })

      await updateDoc(doc(db, "customerInteractions", existingDoc.id), updateData)
    } else {
      // Create new interaction
      const newInteraction = {
        email,
        customerId,
        guestSessionId,
        interactionType,
        fieldsFilled: { [fieldName]: fieldValue },
        fieldNames: [fieldName],
        fieldsCount: 1,
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      }

      await logCustomerInteraction(newInteraction)
    }
  } catch (error) {
    console.error("Error tracking form field change:", error)
    // Don't throw - tracking should not break user interactions
  }
}

/**
 * Track cart operations
 */
export async function trackCartOperation(
  email: string,
  productName: string,
  productId: string,
  quantity: number,
  operationType: "cart_add" | "cart_remove",
  customerId?: string,
  guestSessionId?: string
): Promise<void> {
  try {
    await logCustomerInteraction({
      email,
      customerId,
      guestSessionId,
      interactionType: operationType,
      productId,
      productName,
      quantity,
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking cart operation:", error)
    // Don't throw - tracking should not break user interactions
  }
}

/**
 * Track user sign-up
 */
export async function trackSignUp(
  email: string,
  name: string,
  userId: string
): Promise<void> {
  try {
    await logCustomerInteraction({
      email,
      name,
      customerId: userId,
      interactionType: "sign_up",
      converted: true,
      conversionType: "signup_completed",
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking sign-up:", error)
    // Don't throw - tracking should not break user interactions
  }
}

/**
 * Track user sign-in
 */
export async function trackSignIn(email: string, userId: string, name?: string): Promise<void> {
  try {
    await logCustomerInteraction({
      email,
      name,
      customerId: userId,
      interactionType: "sign_in",
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking sign-in:", error)
    // Don't throw - tracking should not break user interactions
  }
}

/**
 * Track completed checkout/order
 */
export async function trackOrderCompletion(
  email: string,
  orderId: string,
  orderTotal: number,
  customerId?: string,
  paymentMethod?: string
): Promise<void> {
  try {
    // Check if there's an existing checkout interaction
    const interactionsRef = collection(db, "customerInteractions")
    const q = query(
      interactionsRef,
      where("email", "==", email),
      where("interactionType", "==", "checkout")
    )
    const existingDocs = await getDocs(q)

    if (existingDocs.size > 0) {
      // Update the checkout interaction as converted
      await updateDoc(doc(db, "customerInteractions", existingDocs.docs[0].id), {
        converted: true,
        conversionType: "order_completed",
        orderId,
        orderTotal,
        paymentMethod,
        checkoutStep: "completed",
        lastActivityAt: serverTimestamp(),
      })
    } else {
      // Create new interaction (in case they checked out without filling tracked fields)
      await logCustomerInteraction({
        email,
        customerId,
        interactionType: "checkout",
        converted: true,
        conversionType: "order_completed",
        orderId,
        orderTotal,
        paymentMethod,
        checkoutStep: "completed",
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error tracking order completion:", error)
    // Don't throw - tracking should not break user interactions
  }
}

/**
 * Track contact form submission
 */
export async function trackContactSubmission(
  email: string,
  name: string,
  messageId: string,
  customerId?: string
): Promise<void> {
  try {
    // Check if there's an existing contact form interaction
    const interactionsRef = collection(db, "customerInteractions")
    const q = query(
      interactionsRef,
      where("email", "==", email),
      where("interactionType", "==", "contact_form")
    )
    const existingDocs = await getDocs(q)

    if (existingDocs.size > 0) {
      // Update the interaction as converted
      await updateDoc(doc(db, "customerInteractions", existingDocs.docs[0].id), cleanUndefinedValues({
        converted: true,
        conversionType: "contact_submission",
        notes: messageId,
        customerId,
        lastActivityAt: serverTimestamp(),
      }))
    } else {
      // Create new interaction
      await logCustomerInteraction({
        email,
        name,
        customerId,
        interactionType: "contact_form",
        converted: true,
        conversionType: "contact_submission",
        notes: messageId,
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error tracking contact submission:", error)
    // Don't throw - tracking should not break user interactions
  }
}

/**
 * Get customer interactions by email
 */
export async function getCustomerInteractionsByEmail(email: string): Promise<CustomerInteraction[]> {
  try {
    const interactionsRef = collection(db, "customerInteractions")
    const q = query(interactionsRef, where("email", "==", email))
    const docs = await getDocs(q)
    return docs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CustomerInteraction))
  } catch (error) {
    console.error("Error fetching customer interactions:", error)
    return []
  }
}

/**
 * Get all customer interactions with optional filtering
 */
export async function getAllCustomerInteractions(
  interactionType?: string
): Promise<CustomerInteraction[]> {
  try {
    const interactionsRef = collection(db, "customerInteractions")
    let q
    if (interactionType) {
      q = query(interactionsRef, where("interactionType", "==", interactionType))
    } else {
      q = query(interactionsRef)
    }
    const docs = await getDocs(q)
    return docs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CustomerInteraction))
  } catch (error) {
    console.error("Error fetching all customer interactions:", error)
    return []
  }
}
