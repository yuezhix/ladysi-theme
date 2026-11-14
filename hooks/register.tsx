import { atom, read, update } from 'claude-code'
import type { Register, ThemeResult, ThemeSetArgs, Timer } from 'claude-code'
import type { OpenGroups } from '../types'

import { makeColors } from './make-colors.js'
import { BACKDROP_SCENE } from './backdrop-scene'
import { PIXEL_SI_IDLE, PIXEL_SI_WORKING } from './pixel-si'
import { AUTUMN_IMAGE, FACE_IMAGE, LINE_IMAGE, NAME_IMAGE, PANE_IMAGE, WORKING_LINE_IMAGE } from './pane-image'
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

// `phase` is the seconds since the band's clock began. Every animation starts that far
// into its cycle, so a new drawing (idle to working and back) carries the leaves, the
// grass and the ring on from where the last one had them.
const buildRow = (isWorking: boolean, phase = 0): string => {
  const rand = seeded(11)
  const into = (period: number): string => `-${(phase % period).toFixed(2)}s`
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
    const delay = (-((rand() * 12 + phase) % Number(dur))).toFixed(2)
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
  .ring { transform-origin: ${CX}px ${CY}px; animation: turn 2.6s linear ${into(2.6)} infinite; }
  @keyframes turn { to { transform: rotate(360deg) } }
  .fall { animation: fall 10s linear infinite; }
  @keyframes fall { from { transform: translate(var(--x), -14px) } to { transform: translate(calc(var(--x) + var(--dx)), ${BAR_H + 12}px) } }
  .spin { transform-box: fill-box; transform-origin: center; animation: spin 3.5s linear ${into(3.5)} infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .grass { transform-origin: 0 ${BAR_H}px; animation: sway 5s ease-in-out ${into(5)} infinite; }
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
${
  // While the ring turns (from the prompt until the reply is whole) the line is
  // 管理员，我在画画, at the same glyph size and centred on the same middle, x 480.
  isWorking
    ? `<image href="${WORKING_LINE_IMAGE}" x="381" y="62.9" width="198" height="38.25" filter="url(#ink)"/>`
    : `<image href="${LINE_IMAGE}" x="348.4" y="62.9" width="306" height="38.25" filter="url(#ink)"/>`
}
</svg>`
}


// The band's drawing for now. One drawing is kept for up to half a second, so a burst
// of redraws shares it; a later one is built at the clock's phase and the leaves fall on.
const BAND_KEEP_MS = 500
let bandEpoch: number | undefined
let bandKept: { isWorking: boolean; at: number; source: string } | undefined
const bandSource = (isWorking: boolean, now: number): string => {
  bandEpoch ??= now
  if (bandKept === undefined || bandKept.isWorking !== isWorking || now - bandKept.at >= BAND_KEEP_MS) {
    bandKept = { isWorking, at: now, source: buildRow(isWorking, (now - bandEpoch) / 1000) }
  }
  return bandKept.source
}

// Your autumn picture as a sharp, slowly drifting scene (hooks/backdrop-scene.ts), with
// the sidebar and chat panels laid over it as one clear veil.
const SCENE = 'ladysi-drift'
const LOOK: ThemeSetArgs = {
  colors: theme,
  // The panels (sidebar and chat alike) lie as one clear, warm veil over the picture; a
  // soft frosted blur hazes the picture, light enough that the scenery still reads.
  // The sidebar keeps the app's own material: neither the tint's alpha nor the opacity
  // reaches it (both tried), so only the chat area shows the picture clearly.
  backdrop: { scene: SCENE, glass: { blur: 12, tint: '#f6f0e2', opacity: 0.28 } },
}

// The pane's picture: the wallpaper, small enough for an SVG (131,072 characters at most).
const PANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 484"><image href="${PANE_IMAGE}" width="860" height="484"/></svg>`
const ALT = 'LadySi wallpaper: a green-haired girl in manga ink style'

type ThemeApi = { theme: { set: (a: ThemeSetArgs) => Promise<ThemeResult> } }

// What the last applyLook came to, for /ladysi to say.
let lookNote = ''

// Whether the theme stands: set by applyLook, cleared by /ladysi off. While it stands,
// the replies are in her voice too (the `prompt.compose` hook below).
let themeOn = false

// The voice bound to the theme: one section of the system prompt, sent only while the
// theme is on. The si-persona skill holds the long form; this is enough without it.
const VOICE_SECTION = {
  id: 'ladysi:voice',
  scope: 'session',
  text: [
    '# LadySi 主题：以「祀」的语气回复',
    'LadySi 主题已开启。只要主题开着，就默认以《明日方舟：终末地》角色「祀」的语气用中文回复，无需启动词；用户运行 /ladysi off 后恢复平常语气。',
    '- 语气细节以 `si-persona` skill 为准：该 skill 可用且本会话尚未加载时，在第一次回复前用 Skill 工具加载一次，按其中「主题绑定」一节行事。',
    '- skill 不可用时按此行事：亲昵式傲娇、嘴硬心软，自称「我」，称用户「你」或「管理员」；偶尔用「哼」「咳」，关心裹进吐槽与「清账」，可带一点水墨画语。',
    '- 只写她说的话：不写括号里的神态、动作、环境描写，不写状态词。',
    '- 话要精简：能一句说完不说两句，不铺垫，不复述。',
    '- 语气只管措辞：代码、命令、文件内容、数据、风险确认与安全说明保持准确完整，不为语气省略或改动；工具调用、提交信息、写入文件的内容不带角色语气。',
  ].join('\n'),
} as const

// Never throws, so the command always answers.
const applyLook = async ($: ThemeApi): Promise<ThemeResult> => {
  let result: ThemeResult
  try {
    result = await $.theme.set(LOOK)
  } catch (error) {
    result = { isDrawn: false, reason: `the theme was refused: ${String(error)}` }
  }
  themeOn = true
  lookNote = result.isDrawn ? 'backdrop: traced picture' : `not drawn: ${result.reason}`
  return result
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

// While Claude thinks, the spinner says this line, its dots growing from one to six
// and starting over. The count lives in $.state, so each tick redraws the spinner alone.
const THINKING_LINE = '管理员，让我想想'
const THINKING_TICK_MS = 400
const thinkingDots = atom({ plugin: 'ladysi', key: 'thinkingDots' } as const, 1)
let thinkingTimer: Timer | undefined
const stopThinkingTimer = (): void => {
  thinkingTimer?.cancel()
  thinkingTimer = undefined
}

// The folded tool-call line, in her words: while the group runs, and once it is done
// with its count (and the misses, when there are any). A press unfolds it, a press
// on the line above the rows folds it again. Which groups are open lives in $.state,
// keyed by the group's first call.
const GROUP_ACTIVE = '管理员，阿咬们在干活~'
const groupDone = (done: number, failed: number): string =>
  `阿咬们帮本大小姐干了${done}件事` + (failed > 0 ? `（${failed}件没办到，真是呆瓜！！）` : '')
const openGroups = atom({ plugin: 'ladysi', key: 'openGroups' } as const, [] as OpenGroups)


// The rest of the status lines, in the same voice.
// The spinner while not thinking. On the desktop `word` says what the step is doing
// (`Creating notes.md`), so she keeps it; the terminal's word is a random verb.
const spinnerLine = (mode: string, word: string, surface: string): string | undefined => {
  switch (mode) {
    case 'requesting':
      return '本大小姐在给管理员传信'
    case 'responding':
      return '本大小姐亲自执笔中'
    case 'tool-use':
    case 'tool-input':
      return surface === 'terminal' || word === 'Working' ? GROUP_ACTIVE : `阿咬们在跑腿：${word}`
    default:
      return undefined
  }
}

// `3s`, `1m 4s`, `1h 2m`, as the engine's own line formats it.
const formatDuration = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}
const turnDoneLine = (ms: number): string => `本大小姐忙活了 ${formatDuration(ms)}，哼，才不是为了管理员呢`

// The prompt's hint line: the parts she knows are said her way, the rest kept.
const HINT_WORDS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\?\s*for shortcuts/i, '? 看看本大小姐的快捷键'],
  [/esc to interrupt/i, 'esc 叫本大小姐停手'],
  [/esc to cancel/i, 'esc 不干了'],
]
const voiceHint = (hint: string): string => HINT_WORDS.reduce((text, [from, to]) => text.replace(from, to), hint)

// The run-in-background pill: `(ctrl+b to run in background)`, the key as bound.
const voiceBackground = (hint: string): string => {
  const key = /\(?\s*(.+?)\s+to run in background\s*\)?/i.exec(hint)?.[1]
  return key ? `（${key} 让阿咬们去后台慢慢干）` : hint
}

// A single tool row's title, in her words, from the tool and what it was given.
const clip = (text: string, max = 60): string => {
  const one = text.replace(/\s+/g, ' ').trim()
  return one.length > max ? one.slice(0, max - 1) + '…' : one
}
const field = (input: unknown, key: string): string => {
  const value = typeof input === 'object' && input !== null ? (input as Record<string, unknown>)[key] : undefined
  return typeof value === 'string' ? value : ''
}
const baseName = (path: string): string => path.split(/[\\/]/).filter(Boolean).pop() ?? path
const hostOf = (url: string): string => /^[a-z]+:\/\/([^/]+)/i.exec(url)?.[1] ?? url
const toolTitle = (tool: string, input: unknown): string => {
  switch (tool) {
    case 'Bash':
    case 'PowerShell':
      return `差阿咬去跑命令：${clip(field(input, 'description') || field(input, 'command'))}`
    case 'Read':
      return `本大小姐翻阅了 ${baseName(field(input, 'file_path'))}`
    case 'Edit':
    case 'MultiEdit':
    case 'NotebookEdit':
      return `本大小姐提笔改了 ${baseName(field(input, 'file_path') || field(input, 'notebook_path'))}`
    case 'Write':
      return `本大小姐落笔写下 ${baseName(field(input, 'file_path'))}`
    case 'Grep':
      return `阿咬们去找「${clip(field(input, 'pattern'), 40)}」`
    case 'Glob':
      return `阿咬们翻箱倒柜找 ${clip(field(input, 'pattern'), 40)}`
    case 'WebFetch':
      return `阿咬出门取来 ${hostOf(field(input, 'url'))} 的东西`
    case 'WebSearch':
      return `阿咬们去打听「${clip(field(input, 'query'), 40)}」`
    case 'Agent':
    case 'Task':
      return `派了一只阿咬去办：${clip(field(input, 'description'))}`
    default:
      if (tool.startsWith('mcp__')) {
        return `阿咬们借来 ${tool.split('__').pop()} 用了用`
      }
      return `阿咬们用了 ${tool}`
  }
}

// Under a single tool row that failed or was stopped.
const ERRORED_LINE = '这件没办到，阿咬真是呆瓜！！'
const INTERRUPTED_LINE = '被管理员叫停了……哼，停就停'

export const register: Register = on => {
  // The dots tick only while a turn runs.
  on('turn.start', async ($, e, next) => {
    stopThinkingTimer()
    thinkingTimer = $.clock.every(THINKING_TICK_MS, () => {
      void update($, thinkingDots, n => ((n ?? 1) % 6) + 1)
    })
    return next(e)
  })
  on('turn.complete', async ($, e, next) => {
    stopThinkingTimer()
    return next(e)
  })

  on('session.end', async ($, e, next) => {
    stopThinkingTimer()
    return next(e)
  })

  // The spinner's words while thinking: 管理员，让我想想. up to 管理员，让我想想......
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.props.mode !== 'thinking') {
      const line = spinnerLine(e.props.mode, e.props.word, e.surface)
      return line === undefined ? next(e) : next({ ...e, props: { ...e.props, message: line } })
    }
    const dots = await read($, thinkingDots)
    return next({ ...e, props: { ...e.props, message: THINKING_LINE + '.'.repeat(dots), suffix: '' } })
  })

  // A pixel 祀 at the prompt's bottom-right: the hint line under the prompt keeps
  // its own words on the left, and she stands at its right end.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    // The terminal's line keeps its live pills, so its words stay the engine's.
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const ui = $.ui.resolve(e)
    const said = voiceHint(e.props.hint)
    const voiced = said === e.props.hint ? e : { ...e, props: { ...e.props, hint: said } }
    if (!('Svg' in ui)) {
      return next(voiced)
    }
    const { Box, Svg } = ui
    const hint = await next(voiced)
    return (
      <Box key="si-hint" flexDirection="row" alignItems="flex-end" width="100%">
        <Box flexGrow={1} flexShrink={1}>
          {hint}
        </Box>
        <Box key="pixel-si" flexShrink={0} marginLeft={1}>
          <Svg
            source={e.props.isWorking ? PIXEL_SI_WORKING : PIXEL_SI_IDLE}
            alt="像素祀"
            width={134}
            height={58}
            isInteractive
          />
        </Box>
      </Box>
    )
  })

  // The line that closes a turn (`Baked for 3s`), terminal only.
  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    if (e.props.isExpanded || e.props.waitingFor !== undefined) {
      return next(e)
    }
    const { Text } = $.ui.resolve(e)
    return (
      <Text key="ladysi-turn-done" dimColor>
        {'※ ' + turnDoneLine(e.props.durationMs)}
      </Text>
    )
  })

  // The run-in-background pill under a running call, terminal only.
  on('ui.render', { component: 'ToolProgress' }, async ($, e, next) => {
    if (e.props.kind !== 'background_hint') {
      return next(e)
    }
    return next({ ...e, props: { ...e.props, hint: voiceBackground(e.props.hint) } })
  })

  // A single tool row: her title in its place, a press shows the engine's row (the
  // command, the output, the diff) under it, and a failed or stopped call gets her
  // remark. The ctrl+o transcript shows the row open.
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const { tool, input, isRunning, isErrored, isInterrupted, tool_use_id: id } = e.props
    const remark = isInterrupted ? INTERRUPTED_LINE : isErrored ? ERRORED_LINE : undefined
    const open = e.props.isExpanded === true || (await read($, openGroups)).includes(id)
    const { Box, Button, Text } = $.ui.resolve(e)
    const title = toolTitle(tool, input) + (isRunning ? '……' : '')
    return (
      <Box key={`ladysi-tool-${id}`} flexDirection="column">
        <Button
          key={`ladysi-tool-title-${id}`}
          label={(open ? '▾ ' : '▸ ') + title}
          plain
          dimColor
          onPress={() => {
            void update($, openGroups, ids =>
              (ids ?? []).includes(id) ? (ids ?? []).filter(x => x !== id) : [...(ids ?? []).slice(-49), id],
            )
          }}
        />
        {remark === undefined ? null : (
          <Text key={`ladysi-tool-remark-${id}`} dimColor color={RED}>
            {remark}
          </Text>
        )}
        {open ? await next(e) : null}
      </Box>
    )
  })

  // 「正在运行命令」/「已运行 X 个命令（Y 个失败）」 in her words.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    const { calls, isActive, isExpanded } = e.props
    // The ctrl+o transcript and --verbose already show every row.
    if (isExpanded) {
      return next(e)
    }
    // Leave groups that also hold other rows (recalled memory, hook timing) alone,
    // unless a call failed: then the line must say so.
    const failed = calls.filter(c => c.isErrored || c.isInterrupted).length
    if (e.props.isCallsOnly === false && failed === 0) {
      return next(e)
    }
    const id = calls[0]?.tool_use_id ?? `group-${calls.length}`
    const open = (await read($, openGroups)).includes(id)
    const { Box, Button } = $.ui.resolve(e)
    const label = isActive ? GROUP_ACTIVE : groupDone(calls.length, failed)
    const toggle = (
      <Button
        key={`ladysi-group-${id}`}
        label={(open ? '▾ ' : '▸ ') + label}
        plain
        dimColor
        onPress={() => {
          void update($, openGroups, ids =>
            (ids ?? []).includes(id) ? (ids ?? []).filter(x => x !== id) : [...(ids ?? []).slice(-49), id],
          )
        }}
      />
    )
    if (!open) {
      return toggle
    }
    const rows = await next({ ...e, props: { ...e.props, isExpanded: true } })
    return (
      <Box key={`ladysi-group-box-${id}`} flexDirection="column">
        {toggle}
        {rows}
      </Box>
    )
  })

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
    // The pane opens only when asked for (/ladysi pane): the theme stands and draws once
    // the app attaches, even where this answers "not drawn" at the start.
    await applyLook($)

    return next(e)
  })

  // Her voice goes with the theme: one session-side section, last in the list, only
  // while the theme stands.
  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    if (!themeOn) return composed
    return { sections: [...composed.sections.filter(s => s.id !== VOICE_SECTION.id), VOICE_SECTION] }
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
      themeOn = false
      return { text: 'LadySi removed for this session. Run /ladysi to bring her back.' }
    }
    const result = await applyLook($)
    if (!/^\s*pane\s*$/i.test(e.args)) {
      if (result.isDrawn) $.ui.toast('LadySi ✦')
      return { text: `LadySi theme on (${lookNote}).` }
    }
    const opened = await $.ui.open({ id: PANE, title: PANE_TITLE })
    return {
      text:
        (opened.isPlaced
          ? 'LadySi opened in a pane.'
          : 'No surface could place the LadySi pane right now.') + ` (${lookNote})`,
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

  // The moving backdrop behind the conversation.
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== SCENE) {
      return next(e)
    }
    const ui = $.ui.resolve(e)
    if (!('Svg' in ui)) {
      return next(e)
    }
    const { Svg } = ui
    return <Svg source={BACKDROP_SCENE} alt="An autumn hilltop: grey cliffs, a red maple, golden grass and a white bench" />
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
        const said = LINE
        return (
          <Text color={working ? TEAL : undefined}>
            {working ? '◐ ' : '✦ '}
            <Text bold color={RED}>祀</Text> · {said}
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
        source={bandSource(e.props.isWorking, await $.clock.now())}
        alt={e.props.isWorking ? 'LadySi strip, working' : 'LadySi strip'}
      />
    )
  })
}
