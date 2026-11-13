"use client"

import { useState } from "react"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import ProductModelCanvas from "@/components/product-model-canvas"
import { storage } from "@/lib/firebase"
import { isProductModelUrl } from "@/lib/product-model"

interface ModelRow {
  size: number
  modelUrl?: string
}

interface Props {
  variants: ModelRow[]
  productName: string
  disabled: boolean
  onChange: (index: number, url: string) => void
}

export default function ProductModelField({ variants, productName, disabled, onChange }: Props) {
  const [previewUrl, setPreviewUrl] = useState("")
  const [error, setError] = useState("")
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [hasAssembly, setHasAssembly] = useState<boolean | null>(null)

  const showPreview = (url: string) => {
    const link = url.trim()
    if (!link) { setPreviewUrl(""); setError(""); return }
    if (!isProductModelUrl(link)) { setError("Enter a public HTTPS GLB link, or a model path on this website."); return }
    setError(""); setHasAssembly(null); setPreviewUrl(link)
  }

  const uploadModel = (index: number, file: File) => {
    const name = file.name.toLowerCase()
    if (!name.endsWith(".glb") && file.type !== "model/gltf-binary") {
      setError("Choose a .glb file.")
      return
    }
    setError("")
    setUploadingIndex(index)
    setProgress(0)
    const fileName = `models/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const uploadTask = uploadBytesResumable(ref(storage, fileName), file, { contentType: "model/gltf-binary" })
    const timeout = setTimeout(() => {
      uploadTask.cancel()
      setUploadingIndex(null)
      setError("Upload timed out. Try again, or paste a direct GLB link.")
    }, 180000)
    uploadTask.on("state_changed",
      (snapshot) => setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      (uploadError) => {
        clearTimeout(timeout)
        setUploadingIndex(null)
        setError(uploadError.code === "storage/unauthorized"
          ? "Firebase Storage blocked the upload. In Firebase Console → Storage → Rules, allow signed-in admin writes."
          : uploadError.message || "GLB upload failed.")
      },
      async () => {
        clearTimeout(timeout)
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          onChange(index, downloadUrl)
          setPreviewUrl(downloadUrl)
          setHasAssembly(null)
        } catch (downloadError: any) {
          setError(downloadError?.message || "Upload finished, but the file link could not be read.")
        } finally {
          setUploadingIndex(null)
        }
      },
    )
  }

  return (
    <div className="md:col-span-2 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
      <h3 className="mb-2 text-lg font-semibold text-white">GLB models <span className="text-sm font-normal text-gray-400">(one per size, optional)</span></h3>
      <p className="mb-4 text-xs text-gray-400">Each size can have its own bottle. Upload a .glb into the site&apos;s Firebase Storage, or paste a direct public HTTPS link. Leave a size empty and that size stays on the normal product page.</p>
      <div className="space-y-4">
        {variants.map((variant, index) => {
          const url = variant.modelUrl || ""
          return (
            <div key={`${variant.size}-${index}`} className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
              <p className="mb-2 text-sm font-semibold text-white">{variant.size}ml</p>
              <input
                aria-label={`${variant.size}ml GLB link`}
                type="text"
                inputMode="url"
                value={url}
                disabled={disabled || uploadingIndex !== null}
                placeholder={`https://.../${variant.size}ml.glb`}
                onChange={(event) => { onChange(index, event.target.value); setPreviewUrl(""); setError("") }}
                className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <div className="flex flex-wrap items-center gap-3">
                <label className={`rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white ${disabled || uploadingIndex !== null ? "opacity-50" : "cursor-pointer"}`}>
                  {uploadingIndex === index ? `Uploading ${progress}%` : "Upload GLB"}
                  <input type="file" accept=".glb,model/gltf-binary" className="hidden" disabled={disabled || uploadingIndex !== null} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) uploadModel(index, file) }} />
                </label>
                <button type="button" disabled={disabled || !url.trim()} onClick={() => showPreview(url)} className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white disabled:opacity-50">Preview</button>
                {url.trim() && <button type="button" disabled={disabled || uploadingIndex !== null} onClick={() => { onChange(index, ""); if (previewUrl === url.trim()) setPreviewUrl(""); setError("") }} className="px-3 py-2 text-sm text-red-400 disabled:opacity-50">Remove</button>}
              </div>
            </div>
          )
        })}
      </div>
      {previewUrl && <div className="mt-4 h-72 overflow-hidden rounded-lg bg-slate-950"><ProductModelCanvas key={previewUrl} modelUrl={previewUrl} productName={productName || "Product"} preview onReady={setHasAssembly} onError={() => setError("Preview could not load. Use a direct public GLB URL, not a sharing page, and allow cross-origin access on its host.")} /></div>}
      {previewUrl && <p className="mt-2 text-xs text-gray-400">Drag to rotate. {hasAssembly === false ? "No assembly animation found; the model displays as supplied." : "An embedded Assembly animation follows scrolling on the product page."}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  )
}
