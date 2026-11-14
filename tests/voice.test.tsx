import { expect, test } from 'claude-code/testing'
import type { Hook } from 'claude-code'

// Stands for the engine: draws the message (or word) and the suffix it was handed.
const drawSpinner: Hook<'ui.render'> = ($, e) => {
  const { Text } = $.ui.resolve(e)
  const p = e.props as { word: string; message: string | null; suffix: string }
  return <Text>{(p.message ?? p.word) + p.suffix}</Text>
}

test('the desktop keeps what the step is doing', async ($, on) => {
  on('ui.render', drawSpinner)
  const ui = await $.ui.mount({
    plugin: 'ladysi',
    component: 'Spinner',
    surface: 'desktop',
    props: { word: 'Creating notes.md', message: null, suffix: '…', mode: 'tool-use' },
  } as const)
  expect((await ui.find({ type: 'Text' }))?.text).toBe('阿咬们在跑腿：Creating notes.md…')
})

test('writing the reply is her own work', async ($, on) => {
  on('ui.render', drawSpinner)
  const ui = await $.ui.mount({
    plugin: 'ladysi',
    component: 'Spinner',
    surface: 'desktop',
    props: { word: 'Working', message: null, suffix: '…', mode: 'responding' },
  } as const)
  expect((await ui.find({ type: 'Text' }))?.text).toBe('本大小姐亲自执笔中…')
})

test('the turn closes in her words', async ($, on) => {
  const ui = await $.ui.mount({
    plugin: 'ladysi',
    component: 'TurnDuration',
    surface: 'terminal',
    props: { word: 'Baked', durationMs: 64_000 },
  } as const)
  expect((await ui.find({ type: 'Text', text: /忙活/ }))?.text).toBe('※ 本大小姐忙活了 1m 4s，哼，才不是为了管理员呢')
})

test('the background pill keeps the person’s key', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{(e.props as { hint: string }).hint}</Text>
  })
  const ui = await $.ui.mount({
    plugin: 'ladysi',
    component: 'ToolProgress',
    surface: 'terminal',
    props: { tool_use_id: 't1', kind: 'background_hint', hint: '(ctrl+b to run in background)' },
  } as const)
  expect((await ui.find({ type: 'Text' }))?.text).toBe('（ctrl+b 让阿咬们去后台慢慢干）')
})

const toolRow = (tool: string, input: unknown, flags: { isRunning?: boolean; isErrored?: boolean; isExpanded?: boolean } = {}) =>
  ({
    plugin: 'ladysi',
    component: 'ToolUse',
    surface: 'desktop',
    props: {
      tool_use_id: `t-${tool}`,
      tool,
      input,
      isRunning: flags.isRunning ?? false,
      isErrored: flags.isErrored ?? false,
      isInterrupted: false,
      ...(flags.isExpanded === undefined ? {} : { isExpanded: flags.isExpanded }),
    },
  }) as const

const engineRow: Hook<'ui.render'> = ($, e) => {
  const { Text } = $.ui.resolve(e)
  return <Text>engine row</Text>
}

test('a failed tool row gets her title and remark', async ($, on) => {
  on('state.get', () => ({ value: { value: [], version: 1 } }))
  on('ui.render', engineRow)
  const ui = await $.ui.mount(toolRow('Bash', { command: 'ls -la', description: 'List files' }, { isErrored: true }))
  expect((await ui.find({ type: 'Button' }))?.text).toBe('▸ 差阿咬去跑命令：List files')
  expect((await ui.find({ type: 'Text', text: /呆瓜/ }))?.text).toBe('这件没办到，阿咬真是呆瓜！！')
  expect(await ui.find({ type: 'Text', text: /engine row/ })).toBeUndefined()
})

test('a running read says so, and ctrl+o shows the engine row too', async ($, on) => {
  on('state.get', () => ({ value: { value: [], version: 1 } }))
  on('ui.render', engineRow)
  const ui = await $.ui.mount(toolRow('Read', { file_path: 'C:\\code\\notes.md' }, { isRunning: true, isExpanded: true }))
  expect((await ui.find({ type: 'Button' }))?.text).toBe('▾ 本大小姐翻阅了 notes.md……')
  expect((await ui.find({ type: 'Text', text: /engine row/ }))?.text).toBe('engine row')
})

test('an MCP tool is borrowed', async ($, on) => {
  on('state.get', () => ({ value: { value: [], version: 1 } }))
  on('ui.render', engineRow)
  const ui = await $.ui.mount(toolRow('mcp__docs__search_files', {}))
  expect((await ui.find({ type: 'Button' }))?.text).toBe('▸ 阿咬们借来 search_files 用了用')
})


test('the desktop hint says esc her way', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{(e.props as { hint: string }).hint}</Text>
  })
  const ui = await $.ui.mount({
    plugin: 'ladysi',
    component: 'PromptHint',
    surface: 'desktop',
    props: { isDraft: false, isWorking: true, hint: 'esc to interrupt' },
  } as const)
  expect((await ui.find({ type: 'Text', text: /esc/ }))?.text).toBe('esc 叫本大小姐停手')
})

test('the voice section goes with the theme', async ($, on) => {
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'r1' } }))
  on('theme.clear', () => ({ value: undefined }) as never)
  on('ui.toast', () => ({ value: undefined }) as never)
  on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'intro', scope: 'shared' }] }))

  const facts = { model: 'm', promptModel: 'm', surfaces: [], tools: [], outputStyle: null, traits: [] } as const
  const run = (args: string) => $.command.run({ command: 'ladysi', args } as never)

  await run('')
  expect((await $.prompt.compose(facts)).sections.map(s => s.id)).toEqual(['intro', 'ladysi:voice'])

  await run('off')
  expect((await $.prompt.compose(facts)).sections.map(s => s.id)).toEqual(['intro'])
})
