const fs = require('fs')
const path = require('path')

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, a)
    else a.push(p)
  }
  return a
}

const files = walk('dist').map((p) => {
  const rel = path.relative('dist', p).split(path.sep).join('/')
  return {
    file: rel,
    data: fs.readFileSync(p, 'utf8'),
  }
})

files.push({
  file: 'vercel.json',
  data: JSON.stringify(
    { rewrites: [{ source: '/(.*)', destination: '/index.html' }] },
    null,
    2,
  ),
})
files.push({
  file: 'favicon.svg',
  data: fs.readFileSync('public/favicon.svg', 'utf8'),
})

const payload = {
  target: 'production',
  name: 'ainii-taro',
  teamId: 'team_qwQavvCYACRL5HMKCMx12SWd',
  projectSettings: {
    framework: null,
    buildCommand: null,
    outputDirectory: null,
    installCommand: null,
  },
  files,
}

fs.writeFileSync('deploy-static.json', JSON.stringify(payload))
console.log(
  files.map((f) => `${f.file}:${Buffer.byteLength(f.data)}`).join('\n'),
)
console.log('total', fs.statSync('deploy-static.json').size)
