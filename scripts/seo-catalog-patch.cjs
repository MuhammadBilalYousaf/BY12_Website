// Public catalog copy only. Default: save a reviewable preview, without writes.
// --apply requires the same preview and unchanged target fields.
// --rollback restores that preview's original fields, only if our copy is still current.
const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { isDeepStrictEqual } = require('node:util')
const root = path.resolve(__dirname, '..')
const planKey = process.argv.includes('--plan=editorial') ? 'editorial' : 'keyword'
const planPath = path.join(root, `seo-content/${planKey}-catalog.json`)
const recordPath = path.join(root, `SEO-verification/${planKey}-content-preview.json`)
const resultPath = path.join(root, `SEO-verification/${planKey}-content-release.json`)
const allowed = {
  products: new Set(['metaTitle', 'metaDescription', 'description', 'altText']),
  blogs: new Set(['title', 'excerpt', 'content', 'tags', 'readTime']),
}

function selectedFields(data, fields) {
  return Object.fromEntries(Object.keys(fields).map(key => [key, Object.hasOwn(data, key) ? { present: true, value: data[key] } : { present: false }]))
}

async function main() {
  const args = process.argv.slice(2).filter(arg => arg !== '--plan=editorial')
  assert.ok(args.length <= 1 && args.every(arg => ['--apply', '--rollback'].includes(arg)), 'Use no argument for preview, --apply, or --rollback; optionally --plan=editorial')
  const plan = JSON.parse(await fs.readFile(planPath, 'utf8'))
  assert.equal(plan.version, 1)
  assert.ok(plan.patches.length > 0)
  const ids = new Set()
  for (const patch of plan.patches) {
    assert.ok(allowed[patch.collection] && /^[A-Za-z0-9_-]+$/.test(patch.id), 'Only public product/blog document IDs are allowed')
    const key = `${patch.collection}/${patch.id}`
    assert.ok(!ids.has(key), 'Duplicate patch')
    ids.add(key)
    for (const [field, value] of Object.entries(patch.fields)) {
      assert.ok(allowed[patch.collection].has(field), 'Field outside SEO copy scope: ' + field)
      assert.ok(typeof value === 'string' || (field === 'tags' && Array.isArray(value) && value.every(tag => typeof tag === 'string')), 'Invalid copy value')
    }
  }
  process.loadEnvFile(path.join(root, '.env.local'))
  const { initializeApp, cert } = require('firebase-admin/app')
  const { getFirestore, FieldValue } = require('firebase-admin/firestore')
  assert.ok(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY, 'Existing project credentials are unavailable')
  initializeApp({ credential: cert({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) })
  const db = getFirestore()
  db.settings({ preferRest: true })
  const snapshots = await db.getAll(...plan.patches.map(patch => db.collection(patch.collection).doc(patch.id)))
  assert.ok(snapshots.every(snapshot => snapshot.exists), 'An expected catalog document is missing')
  const changes = plan.patches.map((patch, index) => ({ collection: patch.collection, id: patch.id, before: selectedFields(snapshots[index].data(), patch.fields), after: patch.fields }))
  if (!args.length) {
    let release
    try { release = JSON.parse(await fs.readFile(resultPath, 'utf8')) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    assert.ok(release?.mode !== 'apply', 'This plan is already published; preserve its preview for rollback and use a separate plan for new edits')
    await fs.mkdir(path.dirname(recordPath), { recursive: true })
    await fs.writeFile(recordPath, JSON.stringify({ previewedAt: new Date().toISOString(), changes }, null, 2))
    console.log(JSON.stringify({ mode: 'preview', writes: 0, record: path.relative(root, recordPath), documents: changes.map(({ collection, id, after }) => ({ collection, id, fields: Object.keys(after), title: after.metaTitle || after.title })) }, null, 2))
    return
  }
  const preview = JSON.parse(await fs.readFile(recordPath, 'utf8'))
  assert.equal(preview.changes.length, changes.length, 'Preview differs from the current plan')
  const rollback = args[0] === '--rollback'
  const batch = db.batch()
  for (const [index, change] of changes.entries()) {
    const saved = preview.changes[index]
    assert.ok(saved.collection === change.collection && saved.id === change.id && isDeepStrictEqual(saved.after, change.after), 'Plan changed after preview; make a new preview')
    const expected = rollback ? selectedFields(saved.after, saved.after) : saved.before
    assert.ok(isDeepStrictEqual(change.before, expected), `Copy changed since ${rollback ? 'release' : 'preview'} for ${change.id}; refusing to overwrite concurrent edits`)
    const fields = rollback ? Object.fromEntries(Object.entries(saved.before).map(([key, entry]) => [key, entry.present ? entry.value : FieldValue.delete()])) : change.after
    batch.update(snapshots[index].ref, { ...fields, updatedAt: FieldValue.serverTimestamp() }, { lastUpdateTime: snapshots[index].updateTime })
  }
  await batch.commit()
  const result = { completedAt: new Date().toISOString(), mode: rollback ? 'rollback' : 'apply', documents: changes.map(({collection,id,after})=>({collection,id,fields:Object.keys(after)})), originalFields: path.relative(root, recordPath) }
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
}

module.exports = { main }
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })
