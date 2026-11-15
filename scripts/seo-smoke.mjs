import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'

const base = process.argv[2] || 'http://localhost:3100'
const staged = process.argv.includes('--staged')
const stagingHeaders = staged && process.env.SEO_STAGING_BYPASS ? { 'x-vercel-protection-bypass': process.env.SEO_STAGING_BYPASS } : {}
if (Object.keys(stagingHeaders).length) assert.match(base, /^https:\/\/bilalyousaf12store-[a-z0-9]+-bilal-yousafs-projects\.vercel\.app$/)
const reportName = process.argv.find(value => value.startsWith('--report='))?.slice(9) || 'smoke-results.json'
assert.match(reportName, /^[a-zA-Z0-9-]+\.json$/)
const results = []
const keywordPlan = JSON.parse(await fs.readFile(new URL('../seo-content/keyword-catalog.json', import.meta.url), 'utf8'))
const editorialPlan = JSON.parse(await fs.readFile(new URL('../seo-content/editorial-catalog.json', import.meta.url), 'utf8'))
async function get(path, options = {}) {
  const response = await fetch(base + path, { headers: stagingHeaders, redirect: 'manual', signal: AbortSignal.timeout(45000), ...options })
  const html = await response.text()
  return { response, html }
}
async function check(name, action) {
  try { await action(); results.push({ name, passed: true }); console.log('PASS ' + name) }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.log('FAIL ' + name + ': ' + error.message) }
}
const count = (html, expression) => [...html.matchAll(expression)].length
const h1 = html => /<h1\b/.test(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''))

for (const route of ['/', '/shop', '/shop/men', '/shop/women', '/product/coffeeno_impression_of_khamrah_qahwa', '/product/ravla_inspired_by_gucci_flora', '/product/coffeeno---3ml-tester', '/product/ravla---3ml-tester', '/testers', '/blog/ke8yY9PLMbeXhUbEli7Z', ...editorialPlan.patches.map(patch => `/blog/${patch.id}`), '/deals/coffeeno-double-dose-50ml-30ml-oud-coffee-duo-by-by12', '/guides', '/guides/30ml-vs-50ml-perfume', '/guides/inspired-perfumes-pakistan', '/guides/coffeeno-vs-ravla', '/refund']) {
  await check('HTML SEO ' + route, async () => {
    const { response, html } = await get(route)
    assert.equal(response.status, 200)
    assert.equal(count(html, /<meta name="description"/g), 1)
    assert.ok(h1(html), 'H1 missing from server HTML')
    assert.equal(count(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''), /<h1\b/g), 1, 'expected one visible main heading')
    assert.ok(html.includes('rel="canonical" href="https://www.bilalyousaf12.store'), 'preferred-host canonical missing')
    assert.ok(!html.includes('<title>Product Details'), 'generic product title')
    if (route.includes('/product/')) {
      const patch = keywordPlan.patches.find(patch => patch.collection === 'products' && route === `/product/${patch.id}`)
      assert.ok(html.includes('"@type":"' + (route.includes('tester') ? 'Product' : 'ProductGroup') + '"'), 'server product schema missing')
      assert.ok(html.includes(`<title>${patch.fields.metaTitle}</title>`), 'keyword-informed CMS title missing')
      assert.ok(html.includes(patch.fields.description.split('.')[0]), 'updated product introduction missing from server HTML')
    }
    const article = editorialPlan.patches.find(patch => route === `/blog/${patch.id}`)
    if (article) assert.ok(html.includes(`<title>${article.fields.title} | BY12 Perfumes</title>`), 'reviewed article metadata missing')
  })
}
await check('Homepage preloads desktop artwork only for desktop and defers blog artwork', async () => {
  const { html } = await get('/')
  const tags = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]).filter(tag => tag.includes('rel="preload"') && tag.includes('as="image"'))
  const hero = tags.find(tag => tag.includes('all_png.png'))
  assert.ok(hero?.includes('media="(min-width: 1024px)"'), 'desktop-only preload media missing')
  assert.ok(tags.every(tag => tag.includes('all_png.png') || tag.includes('logo.png')), 'below-fold image is competing for preload priority')
  assert.ok(/<source\b[^>]*media="\(min-width: 1024px\)"/.test(html))
})
await check('Organization references the published return policy without inventing terms', async () => {
  const { response, html } = await get('/')
  assert.equal(response.status, 200)
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]))
  const organization = schemas.find(schema => schema['@type'] === 'Organization')
  assert.ok(organization, 'Organization schema missing')
  assert.equal(organization['@id'], 'https://www.bilalyousaf12.store/#organization')
  assert.match(organization.description, /inspired perfumes/i)
  assert.deepEqual(organization.hasMerchantReturnPolicy, {
    '@type': 'MerchantReturnPolicy',
    merchantReturnLink: 'https://www.bilalyousaf12.store/refund',
  })
})
for (const route of ['/product/seo-nonexistent-20261115', '/blog/seo-nonexistent-20261115', '/deals/seo-nonexistent-20261115', '/shop/seo-nonexistent-20261115', '/guides/seo-nonexistent-20261115']) {
  await check('Real 404 ' + route, async () => assert.equal((await get(route)).response.status, 404))
}
await check('Permanent category alias', async () => {
  const { response } = await get('/shop?category=Men')
  assert.equal(response.status, 308)
  assert.ok(response.headers.get('location').endsWith('/shop/men'))
})
if (!staged) await check('Permanent preferred-host redirect', async () => {
  // Node fetch may rewrite Host; a raw request exercises the actual host matcher.
  const target = new URL('/shop', base)
  const result = await new Promise((resolve, reject) => {
    const transport = target.protocol === 'https:' ? https : http
    const request = transport.get(target, { headers: { Host: 'bilalyousaf12.store' } }, response => {
      resolve({ status: response.statusCode, location: response.headers.location })
      response.resume()
    })
    request.setTimeout(45000, () => request.destroy(new Error('Host redirect check timed out')))
    request.on('error', reject)
  })
  assert.equal(result.status, 308)
  assert.equal(result.location, 'https://www.bilalyousaf12.store/shop')
})
await check('Permanent deal ID alias', async () => {
  const { response } = await get('/deals/20OJEQc7L55wNTdwSzuv')
  assert.equal(response.status, 308)
  const location = response.headers.get('location')
  assert.ok(location.includes('/deals/') && !location.includes('/20OJEQc7L55wNTdwSzuv'))
  assert.equal((await get(new URL(location, base).pathname)).response.status, 200)
})
await check('Sitemap only lists intended preferred-host URLs', async () => {
  const { response, html } = await get('/sitemap.xml')
  assert.equal(response.status, 200)
  assert.ok(html.includes('/blog/ke8yY9PLMbeXhUbEli7Z'))
  assert.ok(html.includes('/shop/men'))
  assert.ok(html.includes('/testers'))
  assert.ok(html.includes('/guides/30ml-vs-50ml-perfume'))
  assert.ok(html.includes('/guides/inspired-perfumes-pakistan'))
    assert.ok(html.includes('/guides/coffeeno-vs-ravla'))
  assert.ok(!/<loc>[^<]*\/(cart|checkout|wishlist|profile|orders|track-order)<\/loc>/.test(html))
  assert.ok([...html.matchAll(/<loc>(.*?)<\/loc>/g)].every(match => match[1].startsWith('https://www.bilalyousaf12.store')))
})
await check('Robots uses one maintained policy', async () => {
  const { response, html } = await get('/robots.txt')
  assert.equal(response.status, 200)
  assert.ok(html.includes('https://www.bilalyousaf12.store/sitemap.xml'))
  assert.ok(!html.includes('by12.pk'))
})
await check('Working search is noindex', async () => {
  const { response, html } = await get('/shop?search=Coffeeno')
  assert.equal(response.status, 200)
  assert.ok(/name="robots" content="noindex, follow"/.test(html))
})
await check('Direct size link starts on the requested size', async () => {
  const { response, html } = await get('/product/coffeeno_impression_of_khamrah_qahwa?size=30')
  assert.equal(response.status, 200)
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
  assert.ok(/Selected Size\s+30\s+ml/.test(text))
})
await check('Transactional pages remain noindex', async () => {
  const { response, html } = await get('/cart')
  assert.equal(response.status, 200)
  assert.ok(/name="robots" content="noindex/.test(html))
})
await check('Order confirmation is noindex for Googlebot too', async () => {
  const { response, html } = await get('/order-confirmation')
  assert.equal(response.status, 200)
  assert.ok(/name="robots" content="noindex/.test(html))
  assert.ok(/name="googlebot" content="noindex/.test(html))
})
await check('Product buying advice links to matching testers and the size guide', async () => {
  const { html } = await get('/product/coffeeno_impression_of_khamrah_qahwa')
  const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ')
  assert.ok(text.includes('Before you choose Coffeeno'))
  assert.ok(content.includes('Compare bottle sizes'))
  assert.ok(content.includes('href="/guides/30ml-vs-50ml-perfume"'))
  assert.ok(content.includes('href="/product/coffeeno---3ml-tester"'))
})
await check('Guide has Article markup and real product links in server HTML', async () => {
  const { html } = await get('/guides/30ml-vs-50ml-perfume')
  assert.ok(html.includes('"@type":"Article"'))
  assert.ok(html.includes('href="/product/coffeeno_impression_of_khamrah_qahwa?size=30"'))
  assert.ok(html.includes('href="/product/ravla_inspired_by_gucci_flora?size=50"'))
})
await check('Homepage connects brand perfumes and the comparison guide in server HTML', async () => {
  const { html } = await get('/')
  const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ')
  assert.ok(text.includes('Coffeeno perfume by BY12'))
  assert.ok(text.includes('Ravla perfume by BY12'))
  assert.ok(content.includes('href="/guides/coffeeno-vs-ravla"'))
})
await check('Comparison guide includes actual size and matching tester links', async () => {
  const { html } = await get('/guides/coffeeno-vs-ravla')
  const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  assert.ok(html.includes('"@type":"Article"'))
  for (const id of ['coffeeno_impression_of_khamrah_qahwa', 'ravla_inspired_by_gucci_flora']) {
    assert.ok(content.includes(`href="/product/${id}?size=30"`))
    assert.ok(content.includes(`href="/product/${id}?size=50"`))
  }
  for (const id of ['coffeeno---3ml-tester', 'ravla---3ml-tester']) assert.ok(content.includes(`href="/product/${id}"`))
})
await check('Winter article title promise matches its actual BY12 buying guide', async () => {
  const { html } = await get('/blog/ke8yY9PLMbeXhUbEli7Z')
  const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  assert.ok(html.includes('<title>Winter Perfumes in Pakistan: A Practical BY12 Buying Guide'))
  assert.ok(content.includes('Explore Coffeeno for a warm coffee-style profile'))
  assert.ok(content.includes('href="/guides/coffeeno-vs-ravla"'))
  assert.ok(!content.includes('The Top 10 Luxury Fragrances'))
})
await check('Existing blog content connects to product and buying-guide pages', async () => {
  const { html } = await get('/blog/ke8yY9PLMbeXhUbEli7Z')
  const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  assert.ok(content.includes('Fragrance buying resources'))
  assert.ok(content.includes('href="/product/coffeeno_impression_of_khamrah_qahwa"'))
  assert.ok(content.includes('href="/guides/30ml-vs-50ml-perfume"'))
})
await check('Social image is an actual image response', async () => {
  const response = await fetch(base + '/opengraph-image', { headers: stagingHeaders, signal: AbortSignal.timeout(45000) })
  assert.equal(response.status, 200)
  assert.ok(response.headers.get('content-type').includes('image/png'))
  await response.arrayBuffer()
})
await check('Coffeeno fallback model is served as a valid GLB', async () => {
  const response = await fetch(base + '/models/coffeeno-50ml.glb', { headers: stagingHeaders, signal: AbortSignal.timeout(45000) })
  assert.equal(response.status, 200)
  const body = Buffer.from(await response.arrayBuffer())
  assert.equal(body.toString('ascii', 0, 4), 'glTF')
  assert.equal(body.readUInt32LE(4), 2)
})
await check('Anonymous model uploads require admin authentication', async () => {
  const { response } = await get('/api/upload-model', { method: 'POST' })
  assert.equal(response.status, 401)
})
await fs.mkdir('SEO-verification', { recursive: true })
await fs.writeFile(`SEO-verification/${reportName}`, JSON.stringify({ checkedAt: new Date().toISOString(), base, staged, results }, null, 2))
console.log(`${results.filter(result => result.passed).length}/${results.length} checks passed`)
if (results.some(result => !result.passed)) process.exitCode = 1
