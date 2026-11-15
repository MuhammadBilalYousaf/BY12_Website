const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function routeFixture({ validToken = true, role = 'admin' } = {}) {
  let reads = 0
  const source = fs.readFileSync(require('node:path').join(__dirname, '../app/api/upload-model/route.ts'), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const module = { exports: {} }
  const requireMock = name => {
    if (name === 'firebase-admin/auth') return { getAuth: () => ({ verifyIdToken: async () => { if (!validToken) throw new Error('Invalid token'); return { uid: 'test-admin' } } }) }
    if (name === '@/lib/firebase-admin') return { adminApp: {}, adminDb: { collection: () => ({ doc: () => ({ get: async () => { reads++; return { exists: true, data: () => ({ role }) } } }) }) } }
    throw new Error('Unexpected dependency: ' + name)
  }
  vm.runInThisContext('(function(require,module,exports){' + compiled + '\n})')(requireMock, module, module.exports)
  return { POST: module.exports.POST, reads: () => reads }
}

test('anonymous model uploads are rejected before reading file data', async () => {
  const fixture = routeFixture()
  const response = await fixture.POST({ headers: new Headers(), formData: () => { throw new Error('Must not read anonymous file') } })
  assert.equal(response.status, 401)
  assert.equal(fixture.reads(), 0)
})
test('invalid tokens and non-admin users cannot use the upload proxy', async () => {
  for (const [options, status] of [[{ validToken: false }, 401], [{ role: 'customer' }, 403]]) {
    const fixture = routeFixture(options)
    const response = await fixture.POST({ headers: new Headers({ Authorization: 'Bearer test-only-token' }), formData: () => { throw new Error('Must not read unauthorized file') } })
    assert.equal(response.status, status)
  }
})
test('verified admins reach file validation without making an external upload', async () => {
  const fixture = routeFixture()
  const response = await fixture.POST({ headers: new Headers({ Authorization: 'Bearer test-only-token' }), formData: async () => new FormData() })
  assert.equal(response.status, 400)
  assert.equal(fixture.reads(), 1)
})
