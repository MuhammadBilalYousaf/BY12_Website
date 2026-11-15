const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const modules = new Map()

// Execute the actual pure TypeScript helpers without installing a test runtime.
function load(relative) {
  const filename = path.join(root, relative + '.ts')
  if (modules.has(filename)) return modules.get(filename).exports
  const module = { exports: {} }
  modules.set(filename, module)
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
  const localRequire = spec => spec.startsWith('@/') ? load(spec.slice(2)) : createRequire(filename)(spec)
  vm.runInThisContext('(function(require,module,exports){' + compiled + '\n})', { filename })(localRequire, module, module.exports)
  return module.exports
}
const pricing = load('lib/product-pricing')
const seo = load('lib/seo')
const { productStructuredData } = load('lib/product-schema')
const product = { id: 'example', name: 'Example', brand: 'BY12', category: 'Men', price: 3499, inStock: true, imageUrl: '/logo.png', sizeVariants: [ {size: 50, price: 3499, stock: 0}, {size: 30, price: 2499, stock: 2} ] }

test('default selection uses the available size; explicit size links remain addressable', () => {
  assert.deepEqual(pricing.defaultSelection(product), { size: 30, price: 2499 })
  assert.deepEqual(pricing.defaultSelection(product, 50), { size: 50, price: 3499 })
})
test('variant sales cannot create negative prices', () => {
  assert.equal(pricing.calculateSalePrice(2499, 'percent', 10), 2249)
  assert.equal(pricing.calculateSalePrice(2499, 'amount', 3000), 0)
  assert.equal(pricing.calculateSalePrice(2499, 'percent', 150), 0)
})
test('testers use their own size and zero price, not full-size variants', () => {
  const tester = { ...product, isTester: true, testerSize: 3, testerQuantity: 0, price: 0 }
  assert.deepEqual(pricing.defaultSelection(tester), { size: 3, price: 0 })
  const schema = productStructuredData(tester)
  assert.equal(schema['@type'], 'Product')
  assert.equal(schema.offers.price, 0)
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock')
})
test('product group describes both actual size offers and stock independently', () => {
  const schema = productStructuredData(product)
  assert.equal(schema['@type'], 'ProductGroup')
  assert.equal(schema.hasVariant.length, 2)
  assert.equal(schema.hasVariant[0].offers.price, 3499)
  assert.equal(schema.hasVariant[0].offers.availability, 'https://schema.org/OutOfStock')
  assert.equal(schema.hasVariant[1].offers.price, 2499)
  assert.equal(schema.hasVariant[1].size, '30 ml')
  assert.ok(schema.hasVariant[1].url.endsWith('?size=30'))
  assert.notEqual(schema.hasVariant[0].sku, schema.hasVariant[1].sku)
})
test('sale price and image belong to the same variant', () => {
  const schema = productStructuredData({ ...product, sizeVariants: [{ size: 30, price: 2499, stock: 2, onSale: true, saleType: 'amount', saleValue: 500, saleImageUrl: '/sale.png' }, product.sizeVariants[0]] })
  assert.equal(schema.hasVariant[0].offers.price, 1999)
  assert.equal(schema.hasVariant[0].image, seo.SITE_URL + '/sale.png')
})
test('zero-count and invalid aggregate ratings are not fabricated', () => {
  assert.equal(productStructuredData(product, 5, 0).aggregateRating, undefined)
  assert.equal(productStructuredData(product, 6, 2).aggregateRating, undefined)
  assert.equal(productStructuredData(product, 4, 1).aggregateRating.ratingValue, 4)
})
test('JSON-LD cannot terminate its script element through content', () => {
  const encoded = seo.jsonLd({ name: '</script><script>alert(1)</script>' })
  assert.ok(!encoded.includes('<'))
  assert.equal(JSON.parse(encoded).name, '</script><script>alert(1)</script>')
})
test('canonical metadata uses one preferred HTTPS host and one brand suffix', () => {
  const metadata = seo.pageMetadata({ title: 'Coffeeno', description: '<p>Compare sizes.</p>', path: '/product/example' })
  assert.equal(metadata.alternates.canonical, seo.SITE_URL + '/product/example')
  assert.equal(metadata.title.absolute, 'Coffeeno | BY12 Perfumes')
  assert.equal(metadata.description, 'Compare sizes.')
  assert.equal(seo.pageMetadata({ title: 'Coffeeno | BY12', description: 'Example', path: '/' }).title.absolute, 'Coffeeno | BY12')
})
test('search noindex also overrides the Googlebot-specific instruction', () => {
  const metadata = seo.pageMetadata({ title: 'Search', description: 'Search', path: '/shop', noindex: true })
  assert.equal(metadata.robots.index, false)
  assert.equal(metadata.robots.googleBot.index, false)
})
test('dates are ISO, invalid dates omitted, and deal/category URLs are predictable', () => {
  assert.equal(seo.isoDate('2026-11-15T00:00:00Z'), '2026-11-15T00:00:00.000Z')
  assert.equal(seo.isoDate('invalid'), undefined)
  assert.equal(seo.categoryPath('Women'), '/shop/women')
  assert.equal(seo.dealPath({ id: 'abc', title: 'A Useful Bundle' }), '/deals/a-useful-bundle')
})

test('renaming a product updates the same document without deleting its URL or reviews', async () => {
  const calls = []
  const filename = path.join(root, 'lib/hooks/use-products.ts')
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const module = { exports: {} }
  const api = {
    doc: (_db, collection, id) => ({ collection, id }),
    getDoc: async () => ({ exists: () => true, id: 'existing-url', data: () => ({ name: 'Old name' }) }),
    updateDoc: async (ref, data) => calls.push({ action: 'update', ref, data }),
    setDoc: async () => calls.push({ action: 'create' }),
    deleteDoc: async () => calls.push({ action: 'delete' }),
    serverTimestamp: () => 'timestamp',
  }
  const requireMock = spec => {
    if (spec === 'react') return { useState: initial => [initial, () => {}], useEffect: () => {} }
    if (spec === 'firebase/firestore') return api
    if (spec === '@/lib/firebase') return { db: {} }
    throw new Error('Unexpected dependency: ' + spec)
  }
  vm.runInThisContext('(function(require,module,exports){' + compiled + '\n})', { filename })(requireMock, module, module.exports)
  const result = await module.exports.useProducts().updateProduct('existing-url', { name: 'New name' })
  assert.equal(result.success, true)
  assert.equal(result.id, 'existing-url')
  assert.equal(calls.length, 1)
  assert.equal(calls[0].action, 'update')
  assert.equal(calls[0].ref.id, 'existing-url')
  assert.equal(calls[0].data.name, 'New name')
})

const buying = load('lib/buying-guide')
test('size comparison uses actual sale prices, volume and per-size availability', () => {
  const options = buying.bottleOptions({ ...product, sizeVariants: [{ size: 50, price: 3499, stock: 0 }, { size: 30, price: 2499, stock: 2, onSale: true, saleType: 'amount', saleValue: 300 }] })
  assert.equal(options[0].size, 30)
  assert.equal(options[0].price, 2199)
  assert.equal(options[0].perMl, 73.3)
  assert.equal(options[1].available, false)
  assert.equal(buying.money(options[0].perMl), 'Rs. 73.30')
})
test('comparison excludes invalid sizes and never divides by zero', () => {
  assert.deepEqual(buying.bottleOptions({ ...product, sizeVariants: [{ size: 0, price: 200, stock: 1 }] }), [])
})
test('sample links match fragrance names, not just the same gender category', () => {
  const full = { ...product, name: 'Coffeeno - Impression of Khamrah Qahwa' }
  const tester = { ...product, id: 'sample', name: 'Coffeeno - 3ml Tester', isTester: true }
  const other = { ...tester, id: 'other', name: 'Ravla - 3ml Tester' }
  assert.deepEqual(buying.matchingTesters(full, [tester, other]).map(p => p.id), ['sample'])
  assert.deepEqual(buying.matchingTesters(tester, [tester]), [])
})
test('no note pyramid is guessed from a product name or gender', () => {
  assert.deepEqual(buying.listedNotes({}), { top: [], middle: [], base: [] })
  assert.deepEqual(buying.listedNotes({ fragranceNotes: { top: [' Rose ', '', 'Rose'], middle: [], base: ['Amber'] } }), { top: ['Rose'], middle: [], base: ['Amber'] })
})

function trackingFixture(addDoc) {
  const auth = { currentUser: null }
  const stats = { warnings: 0 }
  const filename = path.join(root, 'lib/tracking.ts')
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const module = { exports: {} }
  const requireMock = spec => {
    if (spec === '@/lib/firebase') return { db: {}, auth }
    if (spec === '@/lib/tracking-access') return load('lib/tracking-access')
    if (spec === 'firebase/firestore') return { collection: () => ({}), addDoc, serverTimestamp: () => 'timestamp' }
    throw new Error('Unexpected dependency: ' + spec)
  }
  const logger = { warn: () => stats.warnings++, log() {}, error() {} }
  vm.runInThisContext('(function(require,module,exports,console){' + compiled + '\n})', { filename })(requireMock, module, module.exports, logger)
  return { api: module.exports, auth, stats }
}
test('denied interaction tracking stops repeat writes without throwing into shopping UI', async () => {
  let attempts = 0
  const fixture = trackingFixture(async () => { attempts++; throw { code: 'permission-denied' } })
  assert.equal(await fixture.api.logCustomerInteraction({ email: '', interactionType: 'page_view' }), '')
  assert.equal(await fixture.api.logCustomerInteraction({ email: '', interactionType: 'page_view' }), '')
  assert.equal(attempts, 1)
  assert.equal(fixture.stats.warnings, 1)
})
test('a late guest denial does not disable a newly signed-in identity', async () => {
  let attempts = 0, rejectGuest
  const fixture = trackingFixture(() => {
    attempts++
    if (attempts === 1) return new Promise((_resolve, reject) => { rejectGuest = reject })
    return Promise.resolve({ id: 'accepted' })
  })
  const pending = fixture.api.logCustomerInteraction({ email: '', interactionType: 'page_view' })
  fixture.auth.currentUser = { uid: 'signed-in-user' }
  rejectGuest({ code: 'permission-denied' })
  await pending
  assert.equal(await fixture.api.logCustomerInteraction({ email: '', interactionType: 'page_view' }), 'accepted')
  assert.equal(attempts, 2)
})
test('temporary network failures are not mistaken for permission denials', async () => {
  let attempts = 0
  const fixture = trackingFixture(async () => { attempts++; throw new Error('Network unavailable') })
  await assert.rejects(fixture.api.logCustomerInteraction({ email: '', interactionType: 'page_view' }))
  await assert.rejects(fixture.api.logCustomerInteraction({ email: '', interactionType: 'page_view' }))
  assert.equal(attempts, 2)
  assert.equal(fixture.stats.warnings, 0)
})

test('local Coffeeno model fallback is limited to its matching 50ml legacy source', () => {
  const { resolveProductModel } = load('lib/product-model')
  const model = { id: 'coffeeno_impression_of_khamrah_qahwa', modelUrl: 'https://files.catbox.moe/example.glb', modelSize: 50 }
  assert.equal(resolveProductModel(model, 50).fallbackUrl, '/models/coffeeno-50ml.glb')
  assert.equal(resolveProductModel(model, 30), null)
  assert.equal(resolveProductModel({ ...model, id: 'another-fragrance' }, 50).fallbackUrl, undefined)
  assert.equal(resolveProductModel({ ...model, modelUrl: 'https://example.com/new-model.glb' }, 50).fallbackUrl, undefined)
})
test('the hosted fallback preserves the supplied GLB bytes and Assembly animation', () => {
  const crypto = require('node:crypto')
  const hosted = fs.readFileSync(path.join(root, 'public/models/coffeeno-50ml.glb'))
  assert.equal(crypto.createHash('sha256').update(hosted).digest('hex'), '78213d19a4d7b65fd1eeba85efeb6095a43490d3ad42d58efb82748e15d0f731')
  assert.equal(hosted.toString('ascii', 0, 4), 'glTF')
  const jsonLength = hosted.readUInt32LE(12)
  const gltf = JSON.parse(hosted.toString('utf8', 20, 20 + jsonLength).trim())
  assert.ok(gltf.animations.some(animation => animation.name === 'Assembly'))
})
