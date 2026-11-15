const { test } = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const fs = require('node:fs')
const path = require('node:path')
const source = fs.readFileSync(path.join(__dirname, 'seo-catalog-patch.cjs'), 'utf8')

async function run({ mode, data = {}, before, fields = { metaTitle: 'Coffeeno Perfume | BY12' }, collection = 'products', savedFields = fields }) {
  const writes = [], files = new Map()
  let commits = 0
  const plan = { version: 1, patches: [{ collection, id: 'coffeeno', fields }] }
  const saved = { changes: [{ collection, id: 'coffeeno', before: before || {}, after: savedFields }] }
  const mockFs = {
    readFile: async filename => JSON.stringify(filename.endsWith('keyword-catalog.json') ? plan : saved),
    mkdir: async () => {},
    writeFile: async (filename, text) => files.set(path.basename(filename), JSON.parse(text)),
  }
  const db = {
    settings() {}, collection: name => ({ doc: id => `${name}/${id}` }),
    getAll: async () => [{ exists: true, data: () => data, ref: 'products/coffeeno', updateTime: 'observed-update-time' }],
    batch: () => ({ update: (...args) => writes.push(args), commit: async () => { commits++ } }),
  }
  const module = { exports: {} }
  const mockRequire = spec => spec === 'node:fs/promises' ? mockFs : spec === 'firebase-admin/app' ? { initializeApp() {}, cert: input => input } : spec === 'firebase-admin/firestore' ? { getFirestore: () => db, FieldValue: { serverTimestamp: () => 'server-time', delete: () => 'delete-field' } } : require(spec)
  const context = { module, exports: module.exports, require: mockRequire, __dirname, console: { log() {}, error() {} }, process: { argv: ['node', 'script', ...(mode ? [mode] : [])], loadEnvFile() {}, env: { FIREBASE_CLIENT_EMAIL: 'existing-service@example.test', FIREBASE_PRIVATE_KEY: 'mock-key' } } }
  vm.runInNewContext(source, context, { filename: 'seo-catalog-patch.cjs' })
  try { await module.exports.main(); return { writes, commits, files } }
  catch (error) { return { writes, commits, files, error } }
}

test('catalog preview records original and absent SEO fields without publishing', async () => {
  const result = await run({ data: { price: 2499, stock: 2 } })
  assert.equal(result.error, undefined)
  assert.equal(result.commits, 0)
  assert.equal(result.writes.length, 0)
  assert.equal(result.files.get('keyword-content-preview.json').changes[0].before.metaTitle.present, false)
})
test('catalog apply preserves inventory and uses a write precondition', async () => {
  const result = await run({ mode: '--apply', data: { metaTitle: 'Old', price: 2499, stock: 2, name: 'Coffeeno' }, before: { metaTitle: { present: true, value: 'Old' } } })
  assert.equal(result.error, undefined)
  assert.equal(result.commits, 1)
  assert.deepEqual(Object.keys(result.writes[0][1]).sort(), ['metaTitle', 'updatedAt'])
  assert.equal(result.writes[0][2].lastUpdateTime, 'observed-update-time')
})
test('catalog apply refuses to overwrite a concurrent content edit', async () => {
  const result = await run({ mode: '--apply', data: { metaTitle: 'Owner changed this' }, before: { metaTitle: { present: true, value: 'Old' } } })
  assert.match(result.error.message, /refusing to overwrite concurrent edits/)
  assert.equal(result.commits, 0)
})
test('catalog plan cannot write prices or private collections', async () => {
  for (const input of [{ fields: { price: 0 } }, { collection: 'orders' }]) {
    const result = await run({ mode: '--apply', ...input })
    assert.ok(result.error)
    assert.equal(result.commits, 0)
    assert.equal(result.writes.length, 0)
  }
})
test('catalog apply refuses a plan changed after preview', async () => {
  const result = await run({ mode: '--apply', savedFields: { metaTitle: 'Different plan' } })
  assert.match(result.error.message, /Plan changed after preview/)
  assert.equal(result.commits, 0)
})
test('catalog rollback restores absent fields without replacing the document', async () => {
  const result = await run({ mode: '--rollback', data: { metaTitle: 'Coffeeno Perfume | BY12', stock: 2 }, before: { metaTitle: { present: false } } })
  assert.equal(result.error, undefined)
  assert.equal(result.commits, 1)
  assert.equal(result.writes[0][1].metaTitle, 'delete-field')
  assert.equal(result.writes[0][1].stock, undefined)
})
test('catalog rollback refuses to overwrite later owner edits', async () => {
  const result = await run({ mode: '--rollback', data: { metaTitle: 'A later title' }, before: { metaTitle: { present: false } } })
  assert.match(result.error.message, /refusing to overwrite concurrent edits/)
  assert.equal(result.commits, 0)
})
