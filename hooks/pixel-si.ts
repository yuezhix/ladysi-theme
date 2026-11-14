// A pixel 祀 lying on her side, 65 x 27, drawn cell by cell from her 3D model:
// head propped on her left hand, glowing yellow antlers, a black headband with gold
// studs over blunt pale-green bangs (one black lock), side buns, pointed ears, blue
// eyes and a slim, pointed chin; a small body in the white dress with its blue zip
// stripes, studs and grey triangles, her other hand on her hip with the yellow beads
// and sash, long hair draped over her, and long legs from under the green hem, one
// knee up. She breathes and blinks; the antlers glow, faster while Claude works.
// CSS only.
//
// Legend: . clear  K ink  H hair  h hair shade  L hair light  S skin  s skin shade
//         E eye blue  W white  w white shade  Z blue zip  C collar/glove dark
//         c glove blue-grey  G gold  N green layer  D shoe  Y glow yellow  y deep yellow
const GRID = [
  '....Y............Y...............................................',
  '....yY..........Yy...............................................',
  '.....Y.Y......Y.Y................................................',
  '.....yYy......yYy................................................',
  '......yY.KKKK.Yy.................................................',
  '.......YKHHHHKY..................................................',
  '......KHLLHHHHHK.................................................',
  '.....KHKGKKKKGKHK................................................',
  '....KHHHKHHHHHHHHK...............................................',
  '..KKHHHHKHHHHHHHHHKK.............................................',
  '.KhHKHHHKHHHHHHHHKHhK............................................',
  '.KhHKHSSKSSSSSSHHKHhK............................................',
  '.KhhKHSWESSSSEWSHKhhK............................................',
  '..KKsHSEESSSSEESHsKK.............................................',
  '...KHHSSSSSSSSSSHHK..............................................',
  '...KHHKSSSSssSSKHHK...........................KKK................',
  '...KHHHKSSSSSSKHHHK..........................KSSSK...............',
  '...KHHHHKKSSKKHHHHK.........................KSSSSSK..............',
  '..KHHKccKKKSSKKKKKKKKKKKKKKK...............KSSSKSSSK.............',
  '..KHKcccKCCGGCCKHHHHhhhHHHHHKK............KSSSK.KSSSK............',
  '.KHHKcccKCKWWWKKKKKKKKKKKKKKhHK..........KSSSK...KSSSK...........',
  '.KHKcccKCKWWWWKccccccccccccKcyYKNK.NK...KSSSK.....KSSSK..........',
  '.KhKccKCCKZZZZZZZZZZZZZZZZZKYyKWNNKNNK.KSSSK.......KSSSKK........',
  '.KhKccKCCKWWKWWKWWwWwwWwwWWKYKWWZNKWNNKSSSKKKKKKKKKKKSSDDK.......',
  'KhhKcKCCCKZZZZZZZZZZZZZZZZZKyKWWZNKWNNKSSSSSSSSSSSSSSSSSSSSSSSDDK',
  'KhhKcKKCCKWWWWWWWWWWWWWWWWWWKKWWWNKNNKSSSSSSSSSSSSSSSSSSSSSSSSDDK',
  '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
]

export const SPRITE_COLUMNS = 65
export const SPRITE_ROWS = GRID.length

const COLORS: Record<string, string> = {
  K: '#141614',
  H: '#c6dd72',
  h: '#9ab84a',
  L: '#e4f0a6',
  S: '#f8e2d2',
  s: '#e8c3ae',
  E: '#4a7fd6',
  W: '#eef1f4',
  w: '#c9d0d8',
  Z: '#2f4fb8',
  C: '#2a2e33',
  c: '#5a6b80',
  G: '#c8b47a',
  N: '#8fc79a',
  D: '#2b2f2b',
  Y: '#f2e14a',
  y: '#d9b81c',
}

// The head (antlers to chin) is the top-left box: rows 0-17, columns 0-21. It sways
// on its own; everything else, the raised knee included, is the body.
const isHead = (x: number, y: number): boolean => y < 18 && x < 22
// In the head, the eyes are E (blue) and W (their catch-light); they blink together.
const isEye = (c: string): boolean => c === 'E' || c === 'W'
const isGlow = (c: string): boolean => c === 'Y'

const cells = (pick: (c: string, x: number, y: number) => boolean, swap?: (c: string) => string): string =>
  GRID.flatMap((row, y) =>
    [...row].map((c, x) =>
      c !== '.' && pick(c, x, y)
        ? `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${COLORS[swap ? swap(c) : c]}"/>`
        : '',
    ),
  ).join('')

const sprite = (isWorking: boolean): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${SPRITE_COLUMNS + 2} ${SPRITE_ROWS + 2}" shape-rendering="crispEdges">
<style>
  .body { animation: breathe 2.4s steps(2) infinite; }
  @keyframes breathe { 50% { transform: translateY(0.5px) } }
  .head { animation: sway ${isWorking ? '0.9s' : '3.2s'} steps(2) infinite; }
  @keyframes sway { 50% { transform: translateY(${isWorking ? '-0.5px' : '0.5px'}) } }
  .eye { animation: blink 4.6s steps(1) infinite; }
  @keyframes blink { 0%, 94% { opacity: 1 } 95%, 100% { opacity: 0 } }
  .glow { animation: glow ${isWorking ? '0.7s' : '2.6s'} ease-in-out infinite; }
  @keyframes glow { 0%, 100% { opacity: 1 } 50% { opacity: 0.55 } }
  @media (prefers-reduced-motion: reduce) { .body, .head, .eye, .glow { animation: none } }
</style>
<ellipse cx="${SPRITE_COLUMNS / 2}" cy="${SPRITE_ROWS + 0.2}" rx="31" ry="1" fill="#141614" opacity="0.25"/>
<g class="body">${cells((c, x, y) => !isHead(x, y) && !isGlow(c))}<g class="glow">${cells((c, x, y) => !isHead(x, y) && isGlow(c))}</g></g>
<g class="head">${cells((c, x, y) => isHead(x, y) && !isGlow(c), c => (isEye(c) ? 'S' : c))}<g class="glow">${cells((c, x, y) => isHead(x, y) && isGlow(c))}</g><g class="eye">${cells((c, x, y) => isHead(x, y) && isEye(c))}</g></g>
</svg>`

export const PIXEL_SI_IDLE = sprite(false)
export const PIXEL_SI_WORKING = sprite(true)
export const PIXEL_SI_GRID = GRID
