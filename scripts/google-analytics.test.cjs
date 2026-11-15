const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const product = { id: 'coffeeno', name: 'Coffeeno', brand: 'BY12', category: 'Men', price: 3499, sizeVariants: [{ size: 50, price: 3499, stock: 5 }, { size: 30, price: 2499, stock: 2 }] }
const cart = [{ product, quantity: 1, selectedSize: 30, selectedPrice: 2499 }]
const normalize = value => JSON.parse(JSON.stringify(value))

function fixture({ hostname = 'www.bilalyousaf12.store', pathname = '/checkout', storage = new Map(), blockedStorage = false } = {}) {
  const window = { location: { hostname, pathname, search: '?email=private-test-value#secret' } }
  const sessionStorage = { getItem: key => { if (blockedStorage) throw new Error('Blocked'); return storage.get(key) || null }, setItem: (key, value) => { if (blockedStorage) throw new Error('Blocked'); storage.set(key, value) } }
  const context = vm.createContext({ window, document: { title: 'BY12', referrer: 'https://example.com/?email=private-test-value' }, sessionStorage, URL, console })
  const modules = new Map()
  const load = name => {
    if (modules.has(name)) return modules.get(name).exports
    const module = { exports: {} }
    modules.set(name, module)
    const source = fs.readFileSync(path.join(root, name + '.ts'), 'utf8')
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
    const requireMock = spec => { if (spec.startsWith('@/')) return load(spec.slice(2)); throw new Error('Unexpected import: ' + spec) }
    vm.runInContext('(function(require,module,exports){' + js + '\n})', context)(requireMock, module, module.exports)
    return module.exports
  }
  return { api: load('lib/google-analytics'), window, storage, events: () => (window.dataLayer || []).map(value => Array.from(value)).filter(args => args[0] === 'event') }
}

test('public path filtering strips query data and excludes private/auth/order paths', () => {
  const { api } = fixture()
  assert.equal(api.analyticsPath('/shop?email=private-test-value'), '/shop')
  assert.equal(api.analyticsPath('/product/coffeeno?size=30#details'), '/product/coffeeno')
  for (const input of ['/admin', '/admin/products', '/profile', '/orders', '/track-order', '/sign-in', '/order-confirmation', '/product/private%40example.com', '//other.example/']) assert.equal(api.analyticsPath(input), null)
})
test('actual selected size and sale price produce PKR item values', () => {
  const { api } = fixture()
  const payload = api.ecommercePayload([{ product, quantity: 2, selectedSize: 30, selectedPrice: 2199 }])
  assert.equal(payload.currency, 'PKR')
  assert.equal(payload.value, 4398)
  assert.equal(payload.items[0].price, 2199)
  assert.equal(payload.items[0].item_variant, '30ml')
  assert.equal(api.analyticsItem({ ...product, sizeVariants: [{ size: 30, price: 2499, stock: 1, onSale: true, saleType: 'amount', saleValue: 300 }] }).price, 2199)
})
test('coupon rounding exactly reconciles item totals and keeps free testers free', () => {
  const { api } = fixture()
  const payload = api.ecommercePayload([
    { product, quantity: 3, selectedPrice: 33.33 },
    { product: { ...product, id: 'other' }, quantity: 2, selectedPrice: 24.99 },
    { product: { ...product, id: 'tester', isTester: true, testerSize: 3, price: 0 }, quantity: 1 },
  ], 17.17)
  assert.equal(payload.value, 132.8)
  assert.equal(Math.round(payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100), 13280)
  assert.equal(payload.items.find(item => item.item_id === 'tester').price, 0)
  assert.ok(payload.items.every(item => item.price >= 0 && item.discount >= 0))
})
test('invalid prices or quantities never generate malformed ecommerce items', () => {
  const { api } = fixture()
  for (const price of [-1, NaN, Infinity, Number.MAX_VALUE]) assert.equal(api.analyticsItem(product, 1, 30, price), null)
  for (const quantity of [0, -1, 1.5, Infinity]) assert.equal(api.analyticsItem(product, quantity, 30, 2499), null)
  assert.equal(api.ecommercePayload(cart, 999999).value, 0)
})
test('localhost and protected routes do not queue Analytics events', () => {
  const local = fixture({ hostname: '127.0.0.1' })
  assert.equal(local.api.syncAnalyticsPage(), false)
  assert.equal(local.api.recordEcommerce('add_to_cart', cart), false)
  assert.equal(local.events().length, 0)
  const privatePage = fixture({ pathname: '/admin/products' })
  assert.equal(privatePage.api.syncAnalyticsPage(), false)
  assert.equal(privatePage.events().length, 0)
})
test('navigation to a private page disables GA and returning to the store restores it', () => {
  const value = fixture({ pathname: '/shop' })
  assert.equal(value.api.syncAnalyticsPage(), true)
  value.window.location.pathname = '/profile'
  assert.equal(value.api.syncAnalyticsPage(), false)
  assert.equal(value.window['ga-disable-G-VQXGFCDSEL'], true)
  value.window.location.pathname = '/cart'
  assert.equal(value.api.syncAnalyticsPage(), true)
  assert.equal(value.window['ga-disable-G-VQXGFCDSEL'], false)
  assert.equal(value.window.dataLayer.map(args => Array.from(args)).filter(args => args[0] === 'config').length, 1)
})
test('payloads contain public product fields and never copy form/customer data', () => {
  const value = fixture()
  value.api.syncAnalyticsPage()
  value.api.recordEcommerce('add_to_cart', [{ ...cart[0], product: { ...product, customerEmail: 'private-test-value', cardNumber: 'private-test-value', token: 'private-test-value' } }])
  const sent = JSON.stringify(value.window.dataLayer.map(args => Array.from(args)))
  assert.ok(!sent.includes('private-test-value'))
  assert.ok(sent.includes('https://example.com'))
  assert.ok(sent.includes('https://www.bilalyousaf12.store/checkout'))
})
test('failed orders cannot create revenue, and accepted orders are sent once', () => {
  const value = fixture()
  const totals = { discount: 100, shipping: 250, tax: 0 }
  assert.equal(value.api.recordOrderResult({ success: false }, cart, totals), false)
  assert.equal(value.events().length, 0)
  assert.equal(value.api.recordOrderResult({ success: true, orderId: 'TEST-ONLY-ORDER' }, cart, totals), true)
  assert.equal(value.api.recordOrderResult({ success: true, orderId: 'TEST-ONLY-ORDER' }, cart, totals), false)
  const event = normalize(value.events()[0])
  assert.equal(event[1], 'purchase')
  assert.equal(event[2].value, 2399)
  assert.equal(event[2].shipping, 250)
  assert.equal(event[2].currency, 'PKR')
  const reloaded = fixture({ storage: value.storage })
  assert.equal(reloaded.api.recordOrderResult({ success: true, orderId: 'TEST-ONLY-ORDER' }, cart, totals), false)
})
test('blocked browser storage does not throw into checkout and still deduplicates in memory', () => {
  const value = fixture({ blockedStorage: true })
  const result = { success: true, orderId: 'TEST-STORAGE-ONLY' }
  const totals = { discount: 0, shipping: 250, tax: 0 }
  assert.equal(value.api.recordOrderResult(result, cart, totals), true)
  assert.equal(value.api.recordOrderResult(result, cart, totals), false)
  assert.equal(value.events().length, 1)
})
