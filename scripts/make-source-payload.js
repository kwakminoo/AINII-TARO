const fs = require('fs')
const path = require('path')

const want = [
  'package.json',
  'package-lock.json',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'vercel.json',
  'public/favicon.svg',
  'src/main.tsx',
  'src/index.css',
  'src/App.tsx',
  'src/App.css',
  'src/data/fortunes.ts',
  'README.md',
  '.gitignore',
]

const files = want.map((f) => ({
  file: f,
  data: fs.readFileSync(path.join(process.cwd(), f), 'utf8'),
}))
files.push({
  file: 'src/vite-env.d.ts',
  data: '/// <reference types="vite/client" />\n',
})

const payload = {
  target: 'production',
  name: 'ainii-taro',
  teamId: 'team_qwQavvCYACRL5HMKCMx12SWd',
  projectSettings: { framework: 'vite' },
  files,
}

fs.writeFileSync('deploy-mcp-payload.json', JSON.stringify(payload))
console.log(
  'files',
  files.length,
  'bytes',
  fs.statSync('deploy-mcp-payload.json').size,
)
