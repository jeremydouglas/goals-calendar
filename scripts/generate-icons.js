#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

async function gen(srcPath) {
  if (!fs.existsSync(srcPath)) {
    console.error('Source image not found at', srcPath)
    process.exit(1)
  }

  const outDir = path.dirname(srcPath)
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 }
  ]

  for (const s of sizes) {
    const out = path.join(outDir, s.name)
    await sharp(srcPath)
      .resize(s.size, s.size, { fit: 'cover' })
      .png()
      .toFile(out)
    console.log('Wrote', out)
  }

  console.log('Icons generated in', outDir)
}

const src = process.argv[2] || 'public/icons/source.png'
gen(src).catch(err => { console.error(err); process.exit(2) })
