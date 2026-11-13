import test from 'node:test'
import assert from 'node:assert/strict'
import { isProductModelUrl, resolveProductModel } from '../lib/product-model.ts'

test('products without a saved GLB link have no 3D story, including Coffeeno', () => {
  assert.equal(resolveProductModel({ id: 'coffeeno_impression_of_khamrah_qahwa' }, 50), null)
  assert.equal(resolveProductModel({ id: 'ravla', modelUrl: ' ' }, 50), null)
})
test('saved links are trimmed and used only for the selected model size', () => {
  const product = { modelUrl: ' https://example.com/bottle.glb?token=public ', modelSize: 50 }
  assert.equal(resolveProductModel(product, 50)?.url, 'https://example.com/bottle.glb?token=public')
  assert.equal(resolveProductModel(product, 30), null)
  assert.equal(resolveProductModel({ modelUrl: '' }, 50), null)
})
test('public HTTPS and same-site model paths are supported', () => {
  assert.equal(isProductModelUrl('https://cdn.example.com/model.glb?signature=123'), true)
  assert.equal(isProductModelUrl('/models/coffeeno-50ml.glb'), true)
  assert.equal(isProductModelUrl('http://127.0.0.1:3000/models/test.glb'), true)
})
test('unsafe protocols, embedded credentials and insecure remote links are rejected', () => {
  for (const url of ['javascript:alert(1)', 'data:model/gltf-binary;base64,AAA', '//other.example/model.glb', 'https://user:secret@example.com/model.glb', 'http://external.example/model.glb', 'not a link', '']) assert.equal(isProductModelUrl(url), false, url)
  assert.equal(resolveProductModel({ modelUrl: 'javascript:alert(1)' }), null)
})
