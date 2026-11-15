import { db, auth } from "@/lib/firebase"
import { createTrackingAccessGuard } from "@/lib/tracking-access"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  limit,
} from "firebase/firestore"
import { CustomerInteraction } from "@/lib/types"

const GUEST_ID_KEY = "guest_session_id"
const interactionAccess = createTrackingAccessGuard()
const trackingIdentity = () => auth.currentUser?.uid || "guest"

function handleInteractionError(error: unknown, message: string, identity: string) {
  const firstFailure = interactionAccess.canAttempt(identity)
  if (interactionAccess.recordFailure(identity, error)) {
    if (firstFailure) console.warn("Custom interaction tracking is unavailable for this session: Firebase denied access. Shopping can continue; analytics collection is not verified.")
    return true
  }
  console.error(message, error)
  return false
}

export type TrackableFormType =
  | "contact_form"
  | "checkout"
  | "tester_request_form"
  | "newsletter"
  | "sign_up_form"

export type InteractionType = CustomerInteraction["interactionType"]

/**
 * Remove undefined values from an object for Firestore compatibility
 */
function cleanUndefinedValues(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase()
}

/**
 * Get or create a guest session ID for tracking guest users
 */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return ""

  let guestId = localStorage.getItem(GUEST_ID_KEY)
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
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

function getClientMeta() {
  if (typeof window === "undefined") {
    return { userAgent: undefined, referrer: undefined }
  }
  return {
    userAgent: navigator.userAgent,
    referrer: document.referrer || undefined,
  }
}

/**
 * Find an open (non-converted preferred) interaction for this visitor + type.
 * Uses single-field queries to avoid missing Firestore composite indexes.
 */
async function findOpenInteraction(
  interactionType: string,
  email?: string,
  guestSessionId?: string
): Promise<{ id: string; data: CustomerInteraction } | null> {
  const requestIdentity = trackingIdentity()
  if (!interactionAccess.canAttempt(requestIdentity)) return null
  const interactionsRef = collection(db, "customerInteractions")
  const normalized = normalizeEmail(email)

  try {
    if (normalized) {
      const byEmail = await getDocs(
        query(interactionsRef, where("email", "==", normalized), limit(25))
      )
      const matches = byEmail.docs
        .map((d) => ({ id: d.id, data: d.data() as CustomerInteraction }))
        .filter((d) => d.data.interactionType === interactionType)
      if (matches.length > 0) {
        const open = matches.find((m) => !m.data.converted)
        return open || matches[0]
      }
    }

    if (guestSessionId) {
      const byGuest = await getDocs(
        query(interactionsRef, where("guestSessionId", "==", guestSessionId), limit(25))
      )
      const matches = byGuest.docs
        .map((d) => ({ id: d.id, data: d.data() as CustomerInteraction }))
        .filter((d) => d.data.interactionType === interactionType)
      if (matches.length > 0) {
        const open = matches.find((m) => !m.data.converted)
        return open || matches[0]
      }
    }
  } catch (error) {
    handleInteractionError(error, "Error finding open interaction:", requestIdentity)
  }

  return null
}

/**
 * Link all guest interactions to a customer email
 */
export async function linkGuestInteractionsToEmail(email: string, guestId?: string): Promise<void> {
  const requestIdentity = trackingIdentity()
  if (!interactionAccess.canAttempt(requestIdentity)) return
  try {
    const targetGuestId =
      guestId || (typeof window !== "undefined" ? localStorage.getItem(GUEST_ID_KEY) : null)
    if (!targetGuestId) return

    const normalized = normalizeEmail(email)
    if (!normalized) return

    const interactionsRef = collection(db, "customerInteractions")
    const snapshot = await getDocs(
      query(interactionsRef, where("guestSessionId", "==", targetGuestId))
    )

    for (const snap of snapshot.docs) {
      await updateDoc(snap.ref, {
        email: normalized,
        updatedAt: serverTimestamp(),
      })
    }

    console.log(`Linked ${snapshot.docs.length} guest interactions to email: ${normalized}`)
  } catch (error) {
    handleInteractionError(error, "Error linking guest interactions:", requestIdentity)
  }
}

/**
 * Log a customer interaction to Firestore. Returns an empty ID when access is denied.
 */
export async function logCustomerInteraction(
  interaction: Omit<CustomerInteraction, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const requestIdentity = trackingIdentity()
  if (!interactionAccess.canAttempt(requestIdentity)) return ""
  try {
    const interactionsRef = collection(db, "customerInteractions")
    const meta = getClientMeta()
    const cleanedData = cleanUndefinedValues({
      ...interaction,
      email: normalizeEmail(interaction.email) || interaction.email || "",
      userAgent: interaction.userAgent || meta.userAgent,
      referrer: interaction.referrer || meta.referrer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const docRef = await addDoc(interactionsRef, cleanedData)
    console.log("Customer interaction logged:", docRef.id)
    return docRef.id
  } catch (error) {
    if (handleInteractionError(error, "Error logging customer interaction:", requestIdentity)) return ""
    throw error
  }
}

/**
 * Update an existing customer interaction
 */
export async function updateCustomerInteraction(
  interactionId: string,
  updates: Partial<CustomerInteraction>
): Promise<void> {
  const requestIdentity = trackingIdentity()
  if (!interactionAccess.canAttempt(requestIdentity)) return
  try {
    const interactionRef = doc(db, "customerInteractions", interactionId)
    const cleanedData = cleanUndefinedValues({
      ...updates,
      ...(updates.email !== undefined ? { email: normalizeEmail(updates.email) } : {}),
      updatedAt: serverTimestamp(),
    })
    await updateDoc(interactionRef, cleanedData)
  } catch (error) {
    if (handleInteractionError(error, "Error updating customer interaction:", requestIdentity)) return
    throw error
  }
}

/**
 * Track form field changes (typing) for guests and signed-in users.
 */
export async function trackFormFieldChange(
  email: string,
  fieldName: string,
  fieldValue: string | number | boolean,
  interactionType: TrackableFormType,
  customerId?: string,
  guestSessionId?: string
): Promise<void> {
  try {
    const guestId = guestSessionId || (!email ? getOrCreateGuestId() : undefined)
    const identifier = normalizeEmail(email) || guestId
    if (!identifier) return

    // Don't store empty values as "filled"
    const stringValue = typeof fieldValue === "string" ? fieldValue.trim() : fieldValue
    if (stringValue === "" || stringValue === null || stringValue === undefined) return

    const existing = await findOpenInteraction(interactionType, email, guestId)

    // If the user is typing their email, capture it on the interaction
    const typedEmail =
      fieldName.toLowerCase().includes("email") && typeof fieldValue === "string"
        ? normalizeEmail(fieldValue)
        : ""

    if (existing) {
      const fieldsFilled = { ...(existing.data.fieldsFilled || {}) }
      fieldsFilled[fieldName] = stringValue
      const fieldNames = Object.keys(fieldsFilled)

      const updateData = cleanUndefinedValues({
        fieldsFilled,
        fieldNames,
        fieldsCount: fieldNames.length,
        lastActivityAt: serverTimestamp(),
        ...(typedEmail ? { email: typedEmail } : {}),
        ...(customerId ? { customerId } : {}),
        ...(guestId && !existing.data.guestSessionId ? { guestSessionId: guestId } : {}),
      })

      await updateDoc(doc(db, "customerInteractions", existing.id), updateData)
    } else {
      await logCustomerInteraction({
        email: typedEmail || normalizeEmail(email) || "",
        customerId,
        guestSessionId: guestId,
        interactionType: interactionType as CustomerInteraction["interactionType"],
        interactionSource:
          interactionType === "checkout"
            ? "checkout_form"
            : interactionType === "contact_form"
              ? "contact_form"
              : undefined,
        fieldsFilled: { [fieldName]: stringValue },
        fieldNames: [fieldName],
        fieldsCount: 1,
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error tracking form field change:", error)
  }
}

/**
 * Mark a form interaction as submitted / converted
 */
export async function trackFormSubmission(options: {
  email: string
  name?: string
  interactionType: TrackableFormType
  messageId?: string
  customerId?: string
  guestSessionId?: string
  conversionType?: CustomerInteraction["conversionType"]
  extra?: Partial<CustomerInteraction>
}): Promise<void> {
  try {
    const {
      email,
      name,
      interactionType,
      messageId,
      customerId,
      guestSessionId,
      conversionType = "contact_submission",
      extra,
    } = options

    const guestId = guestSessionId || getOrCreateGuestId()
    const normalized = normalizeEmail(email)
    const existing = await findOpenInteraction(interactionType, normalized, guestId)

    if (existing) {
      await updateDoc(
        doc(db, "customerInteractions", existing.id),
        cleanUndefinedValues({
          converted: true,
          conversionType,
          notes: messageId,
          name: name || existing.data.name,
          email: normalized || existing.data.email || "",
          customerId: customerId || existing.data.customerId,
          guestSessionId: guestId,
          lastActivityAt: serverTimestamp(),
          ...extra,
        })
      )
    } else {
      await logCustomerInteraction({
        email: normalized || "",
        name,
        customerId,
        guestSessionId: guestId,
        interactionType: interactionType as CustomerInteraction["interactionType"],
        converted: true,
        conversionType,
        notes: messageId,
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
        ...extra,
      })
    }
  } catch (error) {
    console.error("Error tracking form submission:", error)
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
    const guestId = guestSessionId || (!email ? getOrCreateGuestId() : undefined)
    await logCustomerInteraction({
      email: normalizeEmail(email) || "",
      customerId,
      guestSessionId: guestId,
      interactionType: operationType,
      interactionSource: "cart",
      productId,
      productName,
      quantity,
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking cart operation:", error)
  }
}

/**
 * Track product page views
 */
export async function trackProductView(
  productId: string,
  productName: string,
  email?: string,
  customerId?: string
): Promise<void> {
  try {
    const guestId = !email ? getOrCreateGuestId() : undefined
    await logCustomerInteraction({
      email: normalizeEmail(email) || "",
      customerId,
      guestSessionId: guestId,
      interactionType: "product_view",
      interactionSource: "product_page",
      productId,
      productName,
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking product view:", error)
  }
}

/**
 * Track generic page / visitor activity
 */
export async function trackPageView(path: string, email?: string, customerId?: string): Promise<void> {
  try {
    const guestId = getOrCreateGuestId()
    await logCustomerInteraction({
      email: normalizeEmail(email) || "",
      customerId,
      guestSessionId: guestId,
      interactionType: "page_view",
      notes: path,
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking page view:", error)
  }
}

/**
 * Track newsletter subscribe attempts / completions
 */
export async function trackNewsletter(
  email: string,
  converted: boolean,
  guestSessionId?: string
): Promise<void> {
  try {
    const guestId = guestSessionId || getOrCreateGuestId()
    const normalized = normalizeEmail(email)
    if (!normalized) return

    if (converted) {
      await trackFormSubmission({
        email: normalized,
        interactionType: "newsletter",
        guestSessionId: guestId,
        conversionType: "contact_submission",
      })
    } else {
      await trackFormFieldChange(normalized, "email", normalized, "newsletter", undefined, guestId)
    }
  } catch (error) {
    console.error("Error tracking newsletter:", error)
  }
}

/**
 * Track user sign-up
 */
export async function trackSignUp(email: string, name: string, userId: string): Promise<void> {
  try {
    await logCustomerInteraction({
      email: normalizeEmail(email),
      name,
      customerId: userId,
      interactionType: "sign_up",
      interactionSource: "sign_up_form",
      converted: true,
      conversionType: "signup_completed",
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking sign-up:", error)
  }
}

/**
 * Track user sign-in
 */
export async function trackSignIn(email: string, userId: string, name?: string): Promise<void> {
  try {
    await logCustomerInteraction({
      email: normalizeEmail(email),
      name,
      customerId: userId,
      interactionType: "sign_in",
      interactionSource: "sign_in_form",
      startedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking sign-in:", error)
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
  paymentMethod?: string,
  guestSessionId?: string
): Promise<void> {
  try {
    const normalized = normalizeEmail(email)
    const guestId = guestSessionId || getOrCreateGuestId()
    const existing = await findOpenInteraction("checkout", normalized, guestId)

    if (existing) {
      await updateDoc(
        doc(db, "customerInteractions", existing.id),
        cleanUndefinedValues({
          converted: true,
          conversionType: "order_completed",
          orderId,
          orderTotal,
          paymentMethod,
          checkoutStep: "completed",
          email: normalized || existing.data.email || "",
          customerId: customerId || existing.data.customerId,
          lastActivityAt: serverTimestamp(),
        })
      )
    } else {
      await logCustomerInteraction({
        email: normalized || "",
        customerId,
        guestSessionId: guestId,
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
  }
}

/**
 * Track contact form submission (backward-compatible wrapper)
 */
export async function trackContactSubmission(
  email: string,
  name: string,
  messageId: string,
  customerId?: string,
  guestSessionId?: string
): Promise<void> {
  await trackFormSubmission({
    email,
    name,
    interactionType: "contact_form",
    messageId,
    customerId,
    guestSessionId,
    conversionType: "contact_submission",
  })
}

/**
 * Get customer interactions by email
 */
export async function getCustomerInteractionsByEmail(email: string): Promise<CustomerInteraction[]> {
  try {
    const interactionsRef = collection(db, "customerInteractions")
    const docs = await getDocs(query(interactionsRef, where("email", "==", normalizeEmail(email))))
    return docs.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        }) as CustomerInteraction
    )
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
    const docs = interactionType
      ? await getDocs(query(interactionsRef, where("interactionType", "==", interactionType)))
      : await getDocs(interactionsRef)
    return docs.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        }) as CustomerInteraction
    )
  } catch (error) {
    console.error("Error fetching all customer interactions:", error)
    return []
  }
}
