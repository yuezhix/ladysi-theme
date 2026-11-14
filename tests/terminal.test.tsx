import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'ladysi',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 20,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const PANE = {
  plugin: 'ladysi',
  component: 'Pane',
  requestId: 'ladysi-pane',
  props: {
    title: 'LadySi',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const cellCount = (cells: unknown): number => Uint8Array.fromBase64(String(cells)).length / 12

test('the terminal band draws the portrait and the autumn strip as cells', async $ => {
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const face = await ui.find({ key: 'face' })
  expect(face?.type).toBe('Raster')
  expect(cellCount(face?.props.cells)).toBe(20 * 10)
  const strip = await ui.find({ key: 'strip' })
  expect(strip?.type).toBe('Raster')
  expect(cellCount(strip?.props.cells)).toBe(Number(strip?.props.columns) * Number(strip?.props.rows))
  expect(await ui.find({ type: 'Text', text: /管理员/ })).toBeDefined()
  await ui.unmount()
})

test('the terminal band says so while Claude works', async $ => {
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, isWorking: true }, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /落笔中/ })).toBeDefined()
  await ui.unmount()
})

test('a short terminal gets one line', async $ => {
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, maxRows: 4 }, surface: 'terminal' })
  expect(await ui.find({ key: 'face' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /管理员/ })).toBeDefined()
  await ui.unmount()
})

test('the terminal pane draws the wallpaper at its width', async $ => {
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const pane = await ui.find({ key: 'pane' })
  expect(pane?.type).toBe('Raster')
  expect(pane?.props.columns).toBe(60)
  expect(cellCount(pane?.props.cells)).toBe(60 * Number(pane?.props.rows))
  await ui.unmount()
})

test('the desktop still gets the picture', async $ => {
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Svg' }))?.type).toBe('Svg')
  await ui.unmount()
})
