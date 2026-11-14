import type { Register, ThemeResult, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { AUTUMN_IMAGE, FACE_IMAGE, LINE_IMAGE, NAME_IMAGE, PANE_IMAGE } from './pane-image'
import { autumnCells, faceCells, looksGraphical, paneCells, paneRows } from './terminal'

// The terminal band's height in rows.
const BAND_ROWS = 14

const PANE = 'ladysi-pane'
const LINE = '管理员，这次要答应我哦'
const PANE_TITLE = 'LadySi'

// LadySi palette, taken from the wallpaper:
//   sage paper   #dde5c8  the pale green-grey of the page
//   chartreuse   #c9d65a  the yellow-green bands at the frame's edges
//   hair teal    #1f8a78  her long blue-green hair
//   ink          #111511  the heavy manga blacks
//   eye red      #d42a3c  the red markings under her eyes
const SAGE = '#dde5c8'
const CHARTREUSE = '#c9d65a'
const TEAL = '#1f8a78'
const INK = '#111511'
const RED = '#d42a3c'

const { theme, problems } = makeColors({
  label: 'LadySi',
  only: 'light',
  roles: {
    accent: TEAL,
    danger: RED,
    success: '#6b9a1f',
    warning: '#c08a12',
    pro: '#2e6f8e',
  },
  light: {
    gray: {
      anchors: {
        'surface-0': SAGE,
        'surface-1': '#e6ecd6',
        'surface-2': '#f1f4e6',
        'text-primary': INK,
        'text-secondary': '#333b33',
        'text-muted': '#4f5a4f',
      },
    },
    git: { added: '#5f8f1a', removed: RED, modified: TEAL },
  },
  codeTheme: { light: 'github-light' },
})

// Deterministic random, so grass and leaves fall the same way on every draw.
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const MAPLE = 'M0 -8 L2 -3 L7 -5 L5 0 L9 2 L3 3 L3 8 L0 5 L-3 8 L-3 3 L-9 2 L-5 0 L-7 -5 L-2 -3 Z'
const LEAF_COLORS = ['#c8321e', '#e0552a', '#d9441f', '#f08a2c', '#b52a1c']

// The bar above the prompt, 960 x 160: your autumn picture with the two figures
// right of centre and the golden rock against the right edge, a paper veil on the
// left, the portrait in a round frame drawn in your avatar's frame style (dark
// band, gold inner line, gold fret ornament, grey corner arcs, ink splash, cherry
// branch), 祀 as tall as the frame, and the line centred in the blank area.
// Maple and grass are soft-focused for haze. While Claude works, a teal ring turns.
const BAR_H = 160
const CX = 86 // centre of the round frame
const CY = 80

const arc = (r: number, from: number, to: number): string => {
  const p = (a: number) => {
    const t = (a * Math.PI) / 180
    return `${(CX + r * Math.cos(t)).toFixed(1)} ${(CY + r * Math.sin(t)).toFixed(1)}`
  }
  return `M${p(from)} A${r} ${r} 0 0 1 ${p(to)}`
}

const blossom = (x: number, y: number, s: number): string => {
  const petals = [0, 72, 144, 216, 288]
    .map(a => {
      const t = (a * Math.PI) / 180
      return `<circle cx="${(x + 3.4 * s * Math.cos(t)).toFixed(1)}" cy="${(y + 3.4 * s * Math.sin(t)).toFixed(1)}" r="${(2.8 * s).toFixed(1)}"/>`
    })
    .join('')
  return `<g fill="#f2a9b3">${petals}</g><circle cx="${x}" cy="${y}" r="${(1.4 * s).toFixed(1)}" fill="#c94a5a"/>`
}

const FRAME = `
<g filter="url(#splash)" fill="#141414">
  <ellipse cx="34" cy="26" rx="24" ry="16" transform="rotate(-35 34 26)"/>
  <ellipse cx="18" cy="44" rx="9" ry="14"/>
  <circle cx="58" cy="12" r="6"/>
  <ellipse cx="30" cy="140" rx="18" ry="9" transform="rotate(25 30 140)"/>
</g>
<g fill="#141414"><circle cx="70" cy="5" r="2"/><circle cx="8" cy="20" r="1.6"/><circle cx="62" cy="24" r="1.3"/><circle cx="12" cy="128" r="1.5"/></g>
<path d="${arc(74, 200, 250)}" stroke="#bdbdbd" stroke-width="6" fill="none"/>
<path d="${arc(74, 20, 70)}" stroke="#bdbdbd" stroke-width="6" fill="none"/>
<g fill="#c9c9c9"><rect x="6" y="150" width="9" height="5"/><rect x="18" y="150" width="6" height="5"/><rect x="27" y="152" width="11" height="4"/></g>
<image href="${FACE_IMAGE}" x="${CX - 64}" y="${CY - 64}" width="128" height="128" clip-path="url(#c)"/>
<circle cx="${CX}" cy="${CY}" r="66.5" fill="none" stroke="#1b1b1b" stroke-width="5"/>
<circle cx="${CX}" cy="${CY}" r="63.3" fill="none" stroke="#c8b47a" stroke-width="1.2"/>
<g transform="translate(133.5 32.5) rotate(45)">
  <rect x="-8" y="-8" width="16" height="16" fill="#1b1b1b"/>
  <path d="M-6 -6 H6 V6 H-6 Z M-2.5 -2.5 H2.5 V2.5 H-2.5 Z M-6 0 H-2.5 M2.5 0 H6" stroke="#c8b47a" stroke-width="1.4" fill="none"/>
</g>
<path d="M50 4 Q12 46 20 94 Q27 130 54 154" stroke="#3b2318" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M20 70 Q8 74 4 84" stroke="#3b2318" stroke-width="2" fill="none" stroke-linecap="round"/>
${blossom(36, 22, 1.1)}${blossom(18, 52, 1)}${blossom(8, 80, 0.9)}${blossom(22, 112, 1.05)}${blossom(42, 140, 0.95)}${blossom(146, 122, 0.9)}${blossom(156, 110, 0.75)}`

const buildRow = (isWorking: boolean): string => {
  const rand = seeded(11)
  const grass = Array.from({ length: 140 }, () => {
    const x = Math.round(rand() * 960)
    const h = Math.round(12 + rand() * 30)
    const lean = Math.round((rand() - 0.5) * 14)
    const c = ['#d9a441', '#c98f2e', '#e8bb5a', '#b8802a'][Math.floor(rand() * 4)]
    return `<path d="M${x} ${BAR_H + 2} Q${x + lean / 2} ${BAR_H - h / 2} ${x + lean} ${BAR_H - h}" stroke="${c}" stroke-width="${(1.2 + rand() * 1.4).toFixed(1)}" fill="none" stroke-linecap="round"/>`
  }).join('')
  const leaves = Array.from({ length: 12 }, () => {
    const x = Math.round(380 + rand() * 600)
    const dx = -Math.round(120 + rand() * 220)
    const dur = (7 + rand() * 6).toFixed(1)
    const delay = (-rand() * 12).toFixed(1)
    const s = (0.7 + rand() * 0.7).toFixed(2)
    const c = LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)]
    return `<g class="fall" style="--x:${x}px;--dx:${dx}px;animation-duration:${dur}s;animation-delay:${delay}s"><g transform="scale(${s})"><path class="spin" d="${MAPLE}" fill="${c}"/></g></g>`
  }).join('')
  const branchLeaves = Array.from({ length: 12 }, () => {
    const t = rand()
    const x = Math.round(960 - t * 80 + (rand() - 0.5) * 16)
    const y = Math.round(2 + t * 12 + rand() * 12)
    const s = (0.8 + rand() * 0.7).toFixed(2)
    const r = Math.round(rand() * 360)
    const c = LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)]
    return `<path d="${MAPLE}" fill="${c}" transform="translate(${x} ${y}) rotate(${r}) scale(${s})"/>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${BAR_H}" width="960" height="${BAR_H}">
<style>
  .ring { transform-origin: ${CX}px ${CY}px; animation: turn 2.6s linear infinite; }
  @keyframes turn { to { transform: rotate(360deg) } }
  .fall { animation: fall 10s linear infinite; }
  @keyframes fall { from { transform: translate(var(--x), -14px) } to { transform: translate(calc(var(--x) + var(--dx)), ${BAR_H + 12}px) } }
  .spin { transform-box: fill-box; transform-origin: center; animation: spin 3.5s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .grass { transform-origin: 0 ${BAR_H}px; animation: sway 5s ease-in-out infinite; }
  @keyframes sway { 0%,100% { transform: skewX(0deg) } 50% { transform: skewX(-3deg) } }
</style>
<defs>
  <clipPath id="card"><rect width="960" height="${BAR_H}" rx="14"/></clipPath>
  <clipPath id="c"><circle cx="${CX}" cy="${CY}" r="64.5"/></clipPath>
  <filter id="ink" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d"/>
    <feGaussianBlur in="d" stdDeviation="0.35"/>
  </filter>
  <filter id="splash" x="-40%" y="-40%" width="180%" height="180%">
    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="5" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="14" result="d"/>
    <feGaussianBlur in="d" stdDeviation="0.6"/>
  </filter>
  <filter id="haze" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="haze-far" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="2.6"/></filter>
  <linearGradient id="veil" x1="0" x2="1">
    <stop offset="0" stop-color="#f3f1e6" stop-opacity="0.94"/>
    <stop offset="0.6" stop-color="#f3f1e6" stop-opacity="0.84"/>
    <stop offset="0.645" stop-color="#f3f1e6" stop-opacity="0.45"/>
    <stop offset="0.69" stop-color="#f3f1e6" stop-opacity="0"/>
    <stop offset="0.97" stop-color="#fdf6ec" stop-opacity="0"/>
    <stop offset="1" stop-color="#fdf6ec" stop-opacity="0.4"/>
  </linearGradient>
</defs>
<g clip-path="url(#card)">
  <!-- The picture (950 x 160) sits 246 px to the right, so the golden rock meets the
       right edge and the figures stand right of centre; the left gap is paper under the veil. -->
  <rect width="960" height="${BAR_H}" fill="#ece6d6"/>
  <image href="${AUTUMN_IMAGE}" x="246" width="950" height="${BAR_H}"/>
  <rect width="960" height="${BAR_H}" fill="url(#veil)"/>
  <g filter="url(#haze-far)" opacity="0.8">
    <path d="M962 -2 C 935 6, 905 12, 880 18" stroke="#3b2318" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${branchLeaves}
  </g>
  <g filter="url(#haze)" opacity="0.7"><g class="grass">${grass}</g></g>
  <g filter="url(#haze)" opacity="0.75">${leaves}</g>
</g>
<rect x="0.5" y="0.5" width="959" height="${BAR_H - 1}" rx="14" fill="none" stroke="${INK}" stroke-opacity="0.18"/>
${FRAME}
${isWorking ? `<circle class="ring" cx="${CX}" cy="${CY}" r="76" fill="none" stroke="${TEAL}" stroke-width="1.8" stroke-dasharray="48 16"/>` : ''}
<!-- 祀 is as tall as the frame (y 13 to 147). The line is centred across the bar
     (its strokes fill about 234 of its 272 px, so x 363 puts their middle at 480)
     and in the blank area's height. -->
<image href="${NAME_IMAGE}" x="176" y="13" width="149" height="134" filter="url(#ink)"/>
<image href="${LINE_IMAGE}" x="363" y="65" width="272" height="34" filter="url(#ink)"/>
</svg>`
}

const BAND_IDLE = buildRow(false)
const BAND_WORKING = buildRow(true)

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { image: { source: 'ladysi.jpg' } },
}

// The pane's picture: the wallpaper, small enough for an SVG (131,072 characters at most).
const PANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 484"><image href="${PANE_IMAGE}" width="860" height="484"/></svg>`
const ALT = 'LadySi wallpaper: a green-haired girl in manga ink style'

type ThemeApi = { theme: { set: (a: ThemeSetArgs) => Promise<ThemeResult> } }

// Never throws, so the command always answers.
const applyLook = async ($: ThemeApi): Promise<ThemeResult> => {
  try {
    return await $.theme.set(LOOK)
  } catch (error) {
    return { isDrawn: false, reason: `the theme was refused: ${String(error)}` }
  }
}

// The terminal's pictures. `auto` shows real pictures where the terminal says it
// draws pixels (kitty, Ghostty, iTerm2), and cell drawings everywhere else.
type ImageMode = 'auto' | 'on' | 'off'
const IMAGE_MODE_KEY = 'imageMode'
let imageMode: ImageMode = 'auto'
let graphical = false
const useImages = (): boolean => imageMode === 'on' || (imageMode === 'auto' && graphical)

type Pngs = { pane: string; face: string; autumn: string }
let pngs: Promise<Pngs | undefined> | undefined

type FsApi = {
  plugin: { root: string }
  fs: { read: (path: string, options: { as: 'bytes' }) => Promise<{ base64: string }> }
}
// Read once, when first needed; undefined where they cannot be read.
const loadPngs = ($: FsApi): Promise<Pngs | undefined> => {
  pngs ??= (async () => {
    try {
      const read = async (name: string) =>
        (await $.fs.read(`${$.plugin.root}/assets/${name}`, { as: 'bytes' })).base64
      const [pane, face, autumn] = await Promise.all([read('pane.png'), read('face.png'), read('autumn.png')])
      return { pane, face, autumn }
    } catch {
      return undefined
    }
  })()
  return pngs
}

const hex = (color: string): number => Number.parseInt(color.slice(1), 16)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'ladysi',
      description:
        'LadySi theme: /ladysi turns it on, /ladysi pane shows the wallpaper in a pane, /ladysi off removes it, /ladysi image on|off|auto picks real pictures or cell drawings in the terminal',
    })
    try {
      const stored = await $.store.get(IMAGE_MODE_KEY)
      imageMode = stored === 'on' || stored === 'off' ? stored : 'auto'
      graphical = looksGraphical({
        term: await $.env.get('TERM'),
        program: await $.env.get('TERM_PROGRAM'),
        lcTerminal: await $.env.get('LC_TERMINAL'),
        kitty: await $.env.get('KITTY_WINDOW_ID'),
        ghostty: await $.env.get('GHOSTTY_RESOURCES_DIR'),
      })
    } catch {
      // keep the cell drawings
    }
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(`LadySi: ${unpainted}`)
    }
    const result = await applyLook($)
    if (!result.isDrawn) {
      // The app can't draw themes yet: show her beside the chat instead.
      void $.ui.open({ id: PANE, title: PANE_TITLE })
    }

    return next(e)
  })

  on('command.run', { command: 'ladysi' }, async ($, e) => {
    const image = /^\s*image(?:\s+(\S+))?\s*$/i.exec(e.args)
    if (image) {
      const want = (image[1] ?? '').toLowerCase()
      if (want !== 'on' && want !== 'off' && want !== 'auto') {
        return {
          text: `Terminal pictures: ${imageMode} (now ${useImages() ? 'real pictures' : 'cell drawings'}). Use /ladysi image on, off or auto.`,
        }
      }
      imageMode = want
      await $.store.set(IMAGE_MODE_KEY, want)
      $.ui.invalidate('ui.render')
      return {
        text: `Terminal pictures: ${want} (now ${useImages() ? 'real pictures, for kitty, Ghostty and iTerm2' : 'cell drawings'}).`,
      }
    }
    if (/^\s*off\s*$/i.test(e.args)) {
      try {
        await $.theme.clear()
      } catch {
        // nothing stood to clear
      }
      return { text: 'LadySi removed for this session. Run /ladysi to bring her back.' }
    }
    const result = await applyLook($)
    if (result.isDrawn && !/^\s*pane\s*$/i.test(e.args)) {
      $.ui.toast('LadySi ✦')
      return { text: 'LadySi theme on.' }
    }
    const opened = await $.ui.open({ id: PANE, title: PANE_TITLE })
    return {
      text: opened.isPlaced
        ? 'LadySi opened in a pane.'
        : 'No surface could place the LadySi pane right now.',
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    if (e.surface === 'terminal' && 'Raster' in ui && 'Image' in ui) {
      const { Raster, Image } = ui
      const columns = Math.max(8, Math.min(200, e.props.bodyColumns))
      const rows = Math.min(120, paneRows(columns))
      const png = useImages() ? await loadPngs($) : undefined
      return (
        <Box flexDirection="column">
          {png ? (
            <Image key="pane" source={{ png: png.pane }} columns={columns} rows={rows} alt={ALT} />
          ) : (
            <Raster key="pane" columns={columns} rows={rows} cells={paneCells(columns)} />
          )}
          <Text color={TEAL}>
            ✦ 祀 · {LINE}
          </Text>
        </Box>
      )
    }
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    if (!Svg) {
      return (
        <Box padding={1}>
          <Text color={TEAL}>✦ LadySi ✦  (this surface cannot draw the picture)</Text>
        </Box>
      )
    }

    return (
      <Box width="100%" flexDirection="column" backgroundColor={INK}>
        <Svg source={PANE_SVG} alt={ALT} />
      </Box>
    )
  })

  // The portrait row above the prompt.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }
    const ui = $.ui.resolve(e)
    if (e.surface === 'terminal' && 'Raster' in ui && 'Image' in ui) {
      const { Box, Text, Raster, Image } = ui // Text: the one-line band of a short terminal
      const working = e.props.isWorking
      // 14 rows where the band has room, 8 at least.
      const faceRows = Math.min(BAND_ROWS, e.props.maxRows)
      const faceColumns = faceRows * 2
      // Too little room for the picture row: one line of text instead.
      if (faceRows < 8 || e.props.bodyColumns < faceColumns + 24) {
        return (
          <Text color={working ? TEAL : undefined}>
            {working ? '◐ ' : '✦ '}
            <Text bold color={RED}>祀</Text> · {LINE}
          </Text>
        )
      }
      const stripColumns = Math.min(128,e.props.bodyColumns - faceColumns - 2)
      // The strip is as tall as the portrait: two pictures, no words.
      const stripRows = faceRows
      const png = useImages() ? await loadPngs($) : undefined
      return (
        <Box flexDirection="row" columnGap={2}>
          {png ? (
            <Image key="face" source={{ png: png.face }} columns={faceColumns} rows={faceRows} alt="祀" />
          ) : (
            <Raster
              key="face"
              columns={faceColumns}
              rows={faceRows}
              cells={faceCells(faceRows, hex(working ? TEAL : INK))}
            />
          )}
          {png ? (
            <Image key="strip" source={{ png: png.autumn }} columns={stripColumns} rows={stripRows} alt=" " />
          ) : (
            <Raster key="strip" columns={stripColumns} rows={stripRows} cells={autumnCells(stripColumns, stripRows)} />
          )}
        </Box>
      )
    }
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    if (!Svg) {
      return next(e)
    }

    return (
      <Svg
        source={e.props.isWorking ? BAND_WORKING : BAND_IDLE}
        alt={e.props.isWorking ? 'LadySi strip, working' : 'LadySi strip'}
      />
    )
  })
}
