const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

test('desktop hero keeps responsive priority while mobile has no external fallback image', () => {
  const filename = path.join(__dirname, '../components/hero.tsx')
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  const mockRequire = name => {
    if (name === '@/lib/hooks/use-site-stats') return { useSiteStats: () => ({ stats: {}, loading: false }) }
    if (name === '@/components/animated-section') return { HeroReveal: props => props.children }
    if (name === 'framer-motion') return { motion: { div: props => React.createElement('div', { className: props.className, style: props.style }, props.children) }, useReducedMotion: () => false }
    return require(name)
  }
  vm.runInThisContext('(function(require,module,exports){' + compiled + '\n})', { filename })(mockRequire, module, module.exports)
  const html = renderToStaticMarkup(React.createElement(module.exports.default))
  const preload = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]).find(tag => tag.includes('all_png.png'))
  assert.ok(preload.includes('media="(min-width: 1024px)"'))
  assert.ok(preload.includes('fetchPriority="high"'))
  const source = html.match(/<source\b[^>]*>/)[0]
  assert.ok(source.includes('media="(min-width: 1024px)"'))
  assert.ok(source.includes('srcSet=') && source.includes('sizes="50vw"'))
  const fallback = html.match(/<img\b[^>]*>/)[0]
  assert.ok(fallback.includes('src="data:image/gif;base64,'))
  assert.ok(!fallback.includes('srcSet='))
  assert.ok(fallback.includes('loading="eager"'))
})
