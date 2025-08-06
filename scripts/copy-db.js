// scripts/copy-db.js
const fs = require('fs')
const path = require('path')

const sourcePath = path.resolve(__dirname, '../backend/gens.db')
const destDir = path.resolve(__dirname, '../dist/db')

// สร้างโฟลเดอร์ปลายทางถ้ายังไม่มี
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

fs.copyFileSync(sourcePath, path.join(destDir, 'gens.db'))
console.log('✅ Copied gens.db to dist/db/')
