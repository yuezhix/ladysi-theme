import { expect, test } from 'claude-code/testing'

const call = (id: string, isErrored = false) => ({
  tool_use_id: id,
  tool: 'Bash',
  input: { command: 'ls' },
  isRunning: false,
  isErrored,
  isInterrupted: false,
})

const group = (calls: ReturnType<typeof call>[], isActive: boolean) =>
  ({
    plugin: 'ladysi',
    component: 'ToolGroup',
    surface: 'desktop',
    props: { calls, isActive, isExpanded: false, isCallsOnly: !calls.some(c => c.isErrored) },
  }) as const

test('a running group says the helpers are working', async ($, on) => {
  on('state.get', () => ({ value: { value: [], version: 1 } }))
  const ui = await $.ui.mount(group([call('a')], true))
  expect((await ui.find({ type: 'Button' }))?.text).toBe('▸ 管理员，阿咬们在干活~')
})

test('a finished group counts the work and the misses', async ($, on) => {
  on('state.get', () => ({ value: { value: [], version: 1 } }))
  const ui = await $.ui.mount(group([call('a'), call('b'), call('c', true)], false))
  expect((await ui.find({ type: 'Button' }))?.text).toBe('▸ 阿咬们帮本大小姐干了3件事（1件没办到，真是呆瓜！！）')
})

test('no misses, no scolding', async ($, on) => {
  on('state.get', () => ({ value: { value: [], version: 1 } }))
  const ui = await $.ui.mount(group([call('a'), call('b')], false))
  expect((await ui.find({ type: 'Button' }))?.text).toBe('▸ 阿咬们帮本大小姐干了2件事')
})
