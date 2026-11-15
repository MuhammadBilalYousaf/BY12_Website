// Public HTTP/resource diagnostics, not a browser Lighthouse or Core Web Vitals score.
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'

const base = 'https://www.bilalyousaf12.store'
const label = process.argv[2] || 'sample'
assert.match(label, /^[a-z0-9-]+$/)
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
async function measure(path, extra = {}) {
  const start = performance.now()
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(45000), ...extra })
  const headersAt = performance.now()
  const bytes = Buffer.from(await response.arrayBuffer())
  return { url: response.url, status: response.status, headersMs: Math.round(headersAt - start), totalMs: Math.round(performance.now() - start), decodedBytes: bytes.length, contentLengthHeader: response.headers.get('content-length'), contentEncoding: response.headers.get('content-encoding'), contentType: response.headers.get('content-type'), cache: response.headers.get('x-vercel-cache'), body: bytes }
}
const results = []
for (const path of ['/', '/shop', '/product/coffeeno_impression_of_khamrah_qahwa', '/product/ravla_inspired_by_gucci_flora']) {
  const samples = []
  let html = ''
  for (let index = 0; index < 3; index++) {
    const { body, ...sample } = await measure(path)
    samples.push(sample)
    html = body.toString('utf8')
  }
  const scriptPaths = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]).filter(src => src.startsWith('/_next/static/')))]
  const scripts = await Promise.all(scriptPaths.map(async src => { const {body, ...result} = await measure(src); return result }))
  results.push({ path, samples, medianHeadersMs: median(samples.map(sample => sample.headersMs)), medianTotalMs: median(samples.map(sample => sample.totalMs)), scripts, totalScriptDecodedBytes: scripts.reduce((sum, script) => sum + script.decodedBytes, 0), imageTags: [...html.matchAll(/<img\b[^>]*>/g)].slice(0, 3).map(match => match[0]), preloadTags: [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)].map(match => match[0]) })
}
const images = []
for (const path of ['/all_png.png', '/_next/image?url=%2Fall_png.png&w=1080&q=75', '/_next/image?url=%2Fall_png.png&w=1080&q=90', '/_next/image?url=%2Flogo.png&w=256&q=75']) {
  const { body, ...result } = await measure(path, { headers: { Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' } })
  images.push(result)
}
const report = { measuredAt: new Date().toISOString(), base, label, limitations: 'Three HTTP samples per route from this execution environment; decoded response bytes and supplied Content-Length are distinct. No browser rendering, mobile CPU/network emulation, LCP/INP/CLS, global latency or field score is measured.', results, images }
await fs.mkdir('SEO-verification', { recursive: true })
await fs.writeFile(`SEO-verification/performance-${label}.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify({ measuredAt: report.measuredAt, routes: results.map(({path,medianHeadersMs,medianTotalMs,totalScriptDecodedBytes,scripts})=>({path,medianHeadersMs,medianTotalMs,totalScriptDecodedBytes,scriptCount:scripts.length})), images }, null, 2))
