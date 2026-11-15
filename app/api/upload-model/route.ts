import { getAuth } from "firebase-admin/auth"
import { adminApp, adminDb } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return Response.json({ error: "Sign in as an admin to upload models." }, { status: 401 })
  if (!adminApp || !adminDb) return Response.json({ error: "Model uploads are temporarily unavailable." }, { status: 503 })
  let uid: string
  try {
    uid = (await getAuth(adminApp).verifyIdToken(token)).uid
  } catch {
    return Response.json({ error: "Your sign-in expired. Sign in again." }, { status: 401 })
  }
  try {
    const admin = await adminDb.collection("admins").doc(uid).get()
    if (!admin.exists || admin.data()?.role !== "admin") return Response.json({ error: "Admin access is required." }, { status: 403 })
  } catch {
    return Response.json({ error: "Admin access could not be verified." }, { status: 503 })
  }
  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a GLB file." }, { status: 400 })
  }
  const name = file.name.toLowerCase()
  if (!name.endsWith(".glb")) {
    return Response.json({ error: "Only .glb files can be uploaded." }, { status: 400 })
  }
  if (file.size > 180 * 1024 * 1024) {
    return Response.json({ error: "That GLB is over 180 MB. Use a smaller file." }, { status: 400 })
  }

  const outgoing = new FormData()
  outgoing.append("reqtype", "fileupload")
  outgoing.append("fileToUpload", file, file.name.replace(/[^a-zA-Z0-9.]/g, "_"))

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 110000)
  try {
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: outgoing,
      signal: controller.signal,
    })
    const body = (await response.text()).trim()
    if (!response.ok || !body.startsWith("https://")) {
      return Response.json({ error: body || "Free storage rejected the GLB." }, { status: 502 })
    }
    return Response.json({ url: body })
  } catch {
    return Response.json({ error: "Free storage upload timed out. Try again." }, { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
