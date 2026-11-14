// The terminal's pictures: cell drawings (Raster) that every terminal shows, and
// real pictures (Image) for the terminals that draw pixels.

import { AUTUMN_RGB, FACE_RGB, PANE_RGB } from './terminal-pixels'

// The hooks environment has these (ES2026); es2023's lib does not name them.
declare global {
  interface Uint8ArrayConstructor {
    fromBase64(base64: string): Uint8Array
  }
  interface Uint8Array {
    toBase64(): string
  }
}

type Rgb ={ width: number; height: number; data: string }
type Pixels = { width: number; height: number; bytes: Uint8Array }

// 0x01000000 is "the terminal's own color" in a Raster cell.
export const DEFAULT = 0x01000000
const SPACE = 0x20

// Quadrant blocks: a cell is 2 x 2 pixels in two colors. The index is which
// quadrants take the foreground: top-left 1, top-right 2, bottom-left 4, bottom-right 8.
const QUADRANT = [
  SPACE, 0x2598, 0x259d, 0x2580, 0x2596, 0x258c, 0x259e, 0x259b,
  0x2597, 0x259a, 0x2590, 0x259c, 0x2584, 0x2599, 0x259f, 0x2588,
]

const channels = (c: number): [number, number, number] => [(c >> 16) & 255, (c >> 8) & 255, c & 255]
const join = (r: number, g: number, b: number): number =>
  (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)

// The best two colors for four pixels, and which pixels take the first.
const fit = (px: readonly number[]): [glyph: number, fg: number, bg: number] => {
  const blank = px.map(c => c === DEFAULT)
  if (blank.every(Boolean)) return [SPACE, DEFAULT, DEFAULT]
  if (blank.some(Boolean)) {
    // The blank part keeps the terminal's color; the rest is their average.
    let mask = 0
    let r = 0
    let g = 0
    let b = 0
    let n = 0
    px.forEach((c, i) => {
      if (blank[i]) return
      mask |= 1 << i
      const [cr, cg, cb] = channels(c)
      r += cr
      g += cg
      b += cb
      n++
    })
    return [QUADRANT[mask] ?? SPACE, join(r / n, g / n, b / n), DEFAULT]
  }
  const rgb = px.map(channels)
  let best: [number, number, number] = [SPACE, DEFAULT, DEFAULT]
  let bestError = Infinity
  // Masks 1 to 15: 15 is one color for the whole cell.
  for (let mask = 1; mask < 16; mask++) {
    const sum = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    rgb.forEach(([r, g, b], i) => {
      const s = sum[(mask >> i) & 1 ? 0 : 1]!
      s[0]! += r
      s[1]! += g
      s[2]! += b
      s[3]! += 1
    })
    const mean = sum.map(([r, g, b, n]) => (n ? [r! / n, g! / n, b! / n] : [0, 0, 0]))
    let error = 0
    rgb.forEach(([r, g, b], i) => {
      const m = mean[(mask >> i) & 1 ? 0 : 1]!
      error += (r - m[0]!) ** 2 + (g - m[1]!) ** 2 + (b - m[2]!) ** 2
    })
    if (error < bestError) {
      bestError = error
      const fg = join(mean[0]![0]!, mean[0]![1]!, mean[0]![2]!)
      const bg = mask === 15 ? fg : join(mean[1]![0]!, mean[1]![1]!, mean[1]![2]!)
      best = [QUADRANT[mask] ?? SPACE, fg, bg]
    }
  }
  return best
}

const decoded = new Map<Rgb, Pixels>()
const pixels = (src: Rgb): Pixels => {
  let p = decoded.get(src)
  if (p === undefined) {
    p = { width: src.width, height: src.height, bytes: Uint8Array.fromBase64(src.data) }
    decoded.set(src, p)
  }
  return p
}

type Crop = { x: number; y: number; w: number; h: number }

// The average color of a box of source pixels.
const average = (p: Pixels, x0: number, y0: number, x1: number, y1: number): number => {
  const xa = Math.max(0, Math.floor(x0))
  const ya = Math.max(0, Math.floor(y0))
  const xb = Math.min(p.width, Math.max(xa + 1, Math.ceil(x1)))
  const yb = Math.min(p.height, Math.max(ya + 1, Math.ceil(y1)))
  let r = 0
  let g = 0
  let b = 0
  let n = 0
  for (let y = ya; y < yb; y++) {
    for (let x = xa; x < xb; x++) {
      const i = (y * p.width + x) * 3
      r += p.bytes[i] ?? 0
      g += p.bytes[i + 1] ?? 0
      b += p.bytes[i + 2] ?? 0
      n++
    }
  }
  if (n === 0) return DEFAULT
  return (Math.round(r / n) << 16) | (Math.round(g / n) << 8) | Math.round(b / n)
}

// A mask may replace a pixel: given where the pixel's centre falls in the box
// (0 to 1 across and down), return a color, DEFAULT for none, or undefined to keep it.
export type Mask = (u: number, v: number) => number | undefined

// Packs `columns` x `rows` cells, each 2 x 2 pixels in quadrant blocks.
const pack = (src: Rgb, columns: number, rows: number, crop: Crop, mask?: Mask): string => {
  const p = pixels(src)
  const w = columns * 2
  const h = rows * 2
  const sx = crop.w / w
  const sy = crop.h / h
  const pixel = (x: number, y: number): number => {
    const m = mask?.((x + 0.5) / w, (y + 0.5) / h)
    if (m !== undefined) return m
    const x0 = crop.x + x * sx
    const y0 = crop.y + y * sy
    return average(p, x0, y0, x0 + sx, y0 + sy)
  }
  const words = new Uint32Array(columns * rows * 3)
  let i = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * 2
      const y = row * 2
      words.set(fit([pixel(x, y), pixel(x + 1, y), pixel(x, y + 1), pixel(x + 1, y + 1)]), i)
      i += 3
    }
  }
  return new Uint8Array(words.buffer).toBase64()
}

// Fills the box with the picture, cut to the box's shape around `focusX` (0 to 1).
const cover = (src: Rgb, columns: number, rows: number, focusX = 0.5): Crop => {
  const want = columns / (rows * 2)
  const have = src.width / src.height
  if (want < have) {
    const w = src.height * want
    const x = Math.min(src.width - w, Math.max(0, src.width * focusX - w / 2))
    return { x, y: 0, w, h: src.height }
  }
  const h = src.width / want
  return { x: 0, y: (src.height - h) / 2, w: src.width, h }
}

const cache = new Map<string, string>()
const memo = (key: string, make: () => string): string => {
  let v = cache.get(key)
  if (v === undefined) {
    v = make()
    if (cache.size > 32) cache.clear()
    cache.set(key, v)
  }
  return v
}

// The portrait in a round frame: a dark band, or a teal one while Claude works.
// A cell is about twice as tall as wide, so a square is `rows * 2` columns.
export const faceCells = (rows: number, ring: number): string =>
  memo(`face:${rows}:${ring}`, () =>
    pack(FACE_RGB, rows * 2, rows, { x: 0, y: 0, w: FACE_RGB.width, h: FACE_RGB.height }, (u, v) => {
      const d = Math.hypot(u - 0.5, v - 0.5)
      if (d > 0.5) return DEFAULT
      if (d > 0.5 - 0.9 / (rows * 2)) return ring
      return undefined
    }),
  )

// The autumn strip, the two figures kept in view.
export const autumnCells = (columns: number, rows: number): string =>
  memo(`autumn:${columns}x${rows}`, () => pack(AUTUMN_RGB, columns, rows, cover(AUTUMN_RGB, columns, rows, 0.5)))

// The wallpaper, whole, at a width.
export const PANE_ASPECT = PANE_RGB.height / PANE_RGB.width
export const paneRows = (columns: number): number => Math.max(1, Math.round((columns * PANE_ASPECT) / 2))
export const paneCells = (columns: number): string =>
  memo(`pane:${columns}`, () =>
    pack(PANE_RGB, columns, paneRows(columns), { x: 0, y: 0, w: PANE_RGB.width, h: PANE_RGB.height }),
  )

// Whether this terminal draws pixels: kitty, Ghostty and iTerm2 say so in their
// environment.
export const looksGraphical = (env: {
  term?: string
  program?: string
  lcTerminal?: string
  kitty?: string
  ghostty?: string
}): boolean => {
  const term = (env.term ?? '').toLowerCase()
  const program = (env.program ?? '').toLowerCase()
  return (
    env.kitty !== undefined ||
    env.ghostty !== undefined ||
    term.includes('kitty') ||
    term.includes('ghostty') ||
    program === 'iterm.app' ||
    program === 'ghostty' ||
    (env.lcTerminal ?? '').toLowerCase() === 'iterm2'
  )
}
