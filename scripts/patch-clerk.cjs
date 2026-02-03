// Patches @clerk/shared to add the missing loadClerkUiScript export
// that @clerk/react 5.54 expects. Both are latest — packaging bug in Clerk.
// .cjs extension forces CommonJS even when "type": "module" is set.
const fs = require('fs')
const path = require('path')

const p = path.resolve(__dirname, '..', 'node_modules', '@clerk', 'shared', 'dist', 'runtime', 'loadClerkJsScript.mjs')

try {
  let c = fs.readFileSync(p, 'utf8')
  if (!c.includes('loadClerkUiScript')) {
    c = c.replace(
      'export { buildClerkJsScriptAttributes',
      'async function loadClerkUiScript(){}\nexport { buildClerkJsScriptAttributes'
    )
    c = c.replace(
      'setClerkJsLoadingErrorPackageName };',
      'setClerkJsLoadingErrorPackageName, loadClerkUiScript };'
    )
    fs.writeFileSync(p, c)
    console.log('Patched @clerk/shared: added loadClerkUiScript stub')
  }
} catch (_e) {
  // file not found or already patched — nothing to do
}
