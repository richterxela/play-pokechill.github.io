const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const repo = path.resolve(__dirname, '..')
const checkoutArg = process.argv[2] || path.join(repo, '.sites-runtime', 'source')

if (process.argv.length > 3) {
  console.error('Usage: node scripts/sync-site-main.cjs [site-checkout-path]')
  process.exit(2)
}

function git(cwd, args, options = {}) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  if (result.error) throw result.error
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(result.stderr.trim() || `git ${args[0]} failed in ${cwd}`)
  }
  return result
}

function readManifest(directory) {
  return JSON.parse(fs.readFileSync(path.join(directory, '.openai', 'hosting.json'), 'utf8'))
}

try {
  if (!fs.existsSync(checkoutArg)) throw new Error('Site checkout missing; open the existing Site source first')
  const checkout = fs.realpathSync(path.resolve(checkoutArg))
  if (checkout === fs.realpathSync(repo)) throw new Error('Use the separate Site checkout, not the GitHub repository')

  const expected = readManifest(repo)
  const actual = readManifest(checkout)
  if (actual.project_id !== expected.project_id) throw new Error('The Site checkout belongs to another project')
  if (actual.static?.directory !== expected.static?.directory) throw new Error('The Site build settings differ from this repository')

  const siteGit = (...args) => git(checkout, ['-c', `safe.directory=${checkout}`, ...args])
  if (path.resolve(siteGit('rev-parse', '--show-toplevel').stdout.trim()) !== checkout) {
    throw new Error('The Site checkout must be the root of its own Git repository')
  }
  if (siteGit('branch', '--show-current').stdout.trim() !== 'main') throw new Error('The Site checkout must be on main')
  if (siteGit('status', '--porcelain').stdout.trim()) throw new Error('The Site checkout has uncommitted changes')

  git(repo, ['fetch', '--no-tags', 'origin', 'refs/heads/main:refs/remotes/origin/main'])
  const target = git(repo, ['rev-parse', 'refs/remotes/origin/main^{commit}']).stdout.trim()
  siteGit('fetch', '--no-tags', repo, 'refs/remotes/origin/main')
  const fetched = siteGit('rev-parse', 'FETCH_HEAD^{commit}').stdout.trim()
  if (fetched !== target) throw new Error('The Site checkout fetched a different main commit')
  const ancestor = git(checkout, ['-c', `safe.directory=${checkout}`, 'merge-base', '--is-ancestor', 'HEAD', 'FETCH_HEAD'], { allowFailure: true })
  if (ancestor.status !== 0) {
    throw new Error('The Site source diverged from origin/main; reconcile it before publishing')
  }

  siteGit('merge', '--ff-only', 'FETCH_HEAD')
  if (siteGit('rev-parse', 'HEAD').stdout.trim() !== target) throw new Error('The Site checkout did not reach origin/main')
  if (siteGit('status', '--porcelain').stdout.trim()) throw new Error('The Site checkout is not clean after syncing')
  console.log(`Site source is at origin/main: ${target}`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
