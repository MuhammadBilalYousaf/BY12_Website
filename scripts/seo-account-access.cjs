// Read-only discovery using the project's existing service account. No permission changes.
process.loadEnvFile('.env.local')
const { createRequire } = require('node:module')
const adminRequire = createRequire(require.resolve('firebase-admin/app'))
const firestoreRequire = createRequire(adminRequire.resolve('@google-cloud/firestore'))
const { GoogleAuth } = firestoreRequire('google-auth-library')
const fs = require('node:fs/promises')

async function main() {
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) throw new Error('Existing project credentials are unavailable')
  const client = await new GoogleAuth({
    credentials: { client_email: process.env.FIREBASE_CLIENT_EMAIL, private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/analytics.readonly'],
  }).getClient()
  const targets = [
    ['searchConsole', 'https://www.googleapis.com/webmasters/v3/sites', data => ({ matchingSites: (data.siteEntry || []).filter(site => site.siteUrl.includes('bilalyousaf12.store')) })],
    ['analytics', 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries', data => ({ matchingProperties: (data.accountSummaries || []).flatMap(account => account.propertySummaries || []).filter(property => /by12|bilalyousaf12/i.test(property.displayName || '')) })],
  ]
  const results = await Promise.all(targets.map(async ([service, url, summarize]) => {
    try {
      const response = await client.request({ url, method: 'GET', timeout: 20000 })
      return { service, status: response.status, ...summarize(response.data) }
    } catch (error) {
      return { service, status: error.response?.status || 'unavailable', reason: error.response?.data?.error?.status || 'request_failed' }
    }
  }))
  const report = { checkedAt: new Date().toISOString(), method: 'existing project service account, read-only scopes', results }
  await fs.mkdir('SEO-verification', { recursive: true })
  await fs.writeFile('SEO-verification/account-access.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}
main().catch(() => { console.error('Account-access discovery could not complete. No permissions were changed.'); process.exitCode = 1 })
