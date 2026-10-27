// Gera ícones PNG do PWA sem dependências externas (PNG desenhado à mão com zlib).
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
  return Buffer.concat([len, td, c])
}

function icon(size) {
  const green = [21, 128, 61], white = [255, 255, 255], soft = [220, 252, 231]
  const rows = []
  const s = size
  for (let y = 0; y < s; y++) {
    const row = [0]
    for (let x = 0; x < s; x++) {
      const u = x / s, v = y / s
      let col = green
      // cesta: trapézio
      const inBasket = v > 0.42 && v < 0.78 && u > 0.22 + (v - 0.42) * 0.25 && u < 0.78 - (v - 0.42) * 0.25
      // alça: arco
      const dx = u - 0.5, dy = v - 0.42
      const r = Math.sqrt(dx * dx + dy * dy)
      const inHandle = dy < 0 && r > 0.17 && r < 0.22
      if (inBasket) col = (Math.floor(u * 10) % 2 === 0 && v > 0.5) ? soft : white
      if (inHandle) col = white
      row.push(...col)
    }
    rows.push(Buffer.from(row))
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(s, 0); ihdr.writeUInt32BE(s, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', icon(192))
writeFileSync('public/icons/icon-512.png', icon(512))
writeFileSync('public/icons/apple-touch-icon.png', icon(180))
writeFileSync(
  'public/icons/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#15803D"/><path d="M21 27a11 11 0 0 1 22 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M14 27h36l-5 23H19z" fill="#fff"/><path d="M26 33v11M32 33v11M38 33v11" stroke="#15803D" stroke-width="3" stroke-linecap="round"/></svg>`,
)
console.log('Ícones gerados em public/icons')
