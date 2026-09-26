const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname)
const output = path.resolve(root, 'dist')
if (path.dirname(output) !== root) throw new Error('Build output must stay in the project')
if (fs.existsSync(output)) {
  if (fs.lstatSync(output).isSymbolicLink()) throw new Error('Build output cannot be a symlink')
  fs.rmSync(output, { recursive: true })
}
fs.mkdirSync(output)

for (const name of ['index.html', 'styles.css', 'font', 'img', 'scripts']) {
  fs.cpSync(path.join(root, name), path.join(output, name), { recursive: true })
}

if (!fs.statSync(path.join(output, 'index.html')).isFile()) {
  throw new Error('Site build is missing index.html')
}
