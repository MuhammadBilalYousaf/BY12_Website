"use client"

import { useState } from "react"
import ProductModelCanvas from "@/components/product-model-canvas"
import { isProductModelUrl } from "@/lib/product-model"

interface Props {
  url: string
  size: number
  sizes: number[]
  productName: string
  disabled: boolean
  onChange: (url: string, size: number) => void
}

export default function ProductModelField({ url, size, sizes, productName, disabled, onChange }: Props) {
  const [previewUrl, setPreviewUrl] = useState(isProductModelUrl(url) ? url.trim() : "")
  const [error, setError] = useState("")
  const [hasAssembly, setHasAssembly] = useState<boolean | null>(null)
  const showPreview = () => {
    const link = url.trim()
    if (!link) { setPreviewUrl(""); setError(""); return }
    if (!isProductModelUrl(link)) { setError("Enter a public HTTPS GLB link, or a model path on this website."); return }
    setError(""); setHasAssembly(null); onChange(link, size); setPreviewUrl(link)
  }
  return (
    <div className="md:col-span-2 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
      <label htmlFor="product-model-url" className="mb-2 block text-lg font-semibold text-white">GLB Model Link <span className="text-sm font-normal text-gray-400">(optional)</span></label>
      <p className="mb-3 text-xs text-gray-400">Paste the direct, publicly accessible GLB file link. Leave it empty for the normal product page. No file upload is required.</p>
      <input id="product-model-url" type="text" inputMode="url" value={url} disabled={disabled} placeholder="https://your-storage.example/coffeeno-50ml.glb" onChange={event => { onChange(event.target.value, size); setPreviewUrl(""); setError("") }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); showPreview() } }} className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button type="button" disabled={disabled || !url.trim()} onClick={showPreview} className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white disabled:opacity-50">Preview model</button>
        <label className="flex items-center gap-2 text-sm text-gray-300">Model size
          <select aria-label="3D model size" value={size} disabled={disabled} onChange={event => onChange(url, Number(event.target.value))} className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white">
            {Array.from(new Set([...sizes, size])).filter(value => value > 0).map(value => <option key={value} value={value}>{value}ml</option>)}
          </select>
        </label>
        {url.trim() && <button type="button" disabled={disabled} onClick={() => { onChange("", size); setPreviewUrl(""); setError(""); setHasAssembly(null) }} className="px-3 py-2 text-sm text-red-400 disabled:opacity-50">Remove link</button>}
      </div>
      {previewUrl && <div className="h-72 overflow-hidden rounded-lg bg-slate-950"><ProductModelCanvas key={previewUrl} modelUrl={previewUrl} productName={productName || "Product"} preview onReady={setHasAssembly} onError={() => setError("Preview could not load. Use a direct public GLB URL, not a sharing page, and allow cross-origin access on its host.")} /></div>}
      {previewUrl && <p className="mt-2 text-xs text-gray-400">Drag to rotate. {hasAssembly === false ? "No assembly animation found; the model displays as supplied." : "An embedded Assembly animation follows scrolling on the product page."}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  )
}
