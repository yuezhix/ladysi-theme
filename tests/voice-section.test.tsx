import { expect, test } from 'claude-code/testing'

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
