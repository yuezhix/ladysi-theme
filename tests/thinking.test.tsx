import { expect, test } from 'claude-code/testing'
import { PIXEL_SI_GRID, PIXEL_SI_IDLE, PIXEL_SI_WORKING, SPRITE_COLUMNS } from '../hooks/pixel-si'

const spinner = (mode: 'thinking' | 'tool-use') =>
  ({
    plugin: 'ladysi',
    component: 'Spinner',
    surface: 'terminal',
    props: { word: 'Pondering', message: null, suffix: '…', mode },
  }) as const

test('thinking shows the LadySi line with its dots', async ($, on) => {
  on('state.get', () => ({ value: { value: 3, version: 1 } }))
  // Stands for the engine: draws the message (or word) and the suffix it was handed.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const p = e.props as { word: string; message: string | null; suffix: string }
    return <Text>{(p.message ?? p.word) + p.suffix}</Text>
  })
  const ui = await $.ui.mount(spinner('thinking'))
  expect((await ui.find({ type: 'Text' }))?.text).toBe('管理员，让我想想...')
})

test('tool work says the helpers are working', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const p = e.props as { word: string; message: string | null; suffix: string }
    return <Text>{(p.message ?? p.word) + p.suffix}</Text>
  })
  const ui = await $.ui.mount(spinner('tool-use'))
  expect((await ui.find({ type: 'Text' }))?.text).toBe('管理员，阿咬们在干活~…')
})

const HINT = (surface: 'desktop' | 'terminal') =>
  ({
    plugin: 'ladysi',
    component: 'PromptHint',
    surface,
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
  }) as const

test('the desktop hint line ends in a pixel 祀 and keeps its words', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine hint</Text>
  })
  const ui = await $.ui.mount(HINT('desktop'))
  expect((await ui.find({ key: 'pixel-si' }))?.type).toBe('Box')
  expect((await ui.find({ type: 'Svg' }))?.props.alt).toBe('像素祀')
  expect((await ui.find({ type: 'Text', text: /engine hint/ }))?.text).toBe('engine hint')
})

test('the terminal hint line is left alone', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine hint</Text>
  })
  const ui = await $.ui.mount(HINT('terminal'))
  expect(await ui.find({ key: 'pixel-si' })).toBeUndefined()
})

test('every row of the pixel 祀 is the full width', async () => {

  for (const row of PIXEL_SI_GRID) {
    expect(row.length).toBe(SPRITE_COLUMNS)
  }
})

test('the pixel 祀 fits the Svg limit', () => {
  expect(PIXEL_SI_IDLE.length).toBeLessThan(131072)
  expect(PIXEL_SI_WORKING.length).toBeLessThan(131072)
})
