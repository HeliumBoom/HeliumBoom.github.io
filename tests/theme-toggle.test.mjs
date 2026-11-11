import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const component = await readFile(new URL('../src/components/ThemeToggle.svelte', import.meta.url), 'utf8')
const script = component.match(/<script lang="ts">([\s\S]*?)<\/script>/)[1]
const compiled = ts.transpileModule(script.replace(/^\s*import .+;\s*$/gm, ''), {
  compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext }
}).outputText

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const flush = async() => { for (let i = 0; i < 8; i++) await Promise.resolve() }

function setup({ reducedMotion = false, supportsTransitions = true } = {}) {
  const classes = new Set(['dark'])
  const attributes = new Map([['data-theme', 'dark']])
  const animations = new Set()
  const transitions = []
  let dispose
  const html = {
    classList: { add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)) },
    getAttribute: name => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
    animate(frames, options) {
      const animation = { frames, options, cancel() { animations.delete(animation) } }
      animations.add(animation)
      return animation
    }
  }
  const document = {
    documentElement: html,
    startViewTransition: supportsTransitions ? update => {
      const ready = deferred(), finished = deferred()
      const transition = {
        ready: ready.promise, finished: finished.promise,
        capture() { update(); ready.resolve() },
        complete() { finished.resolve() },
        skipTransition() { update(); ready.reject(new Error('skipped')); finished.resolve() }
      }
      transitions.push(transition)
      return transition
    } : undefined
  }
  const context = vm.createContext({
    document,
    localStorage: { getItem: () => null, setItem() {} },
    onMount: callback => { dispose = callback() },
    window: { innerWidth: 1200, innerHeight: 800,
      matchMedia: query => ({ matches: query.includes('reduced-motion') ? reducedMotion : true, addEventListener() {}, removeEventListener() {} }),
      addEventListener() {}, removeEventListener() {} }
  })
  vm.runInContext(`${compiled}\nglobalThis.toggle = toggleTheme; globalThis.apply = applyTheme`, context)
  const event = { detail: 1, clientX: 1150, clientY: 30, currentTarget: { getBoundingClientRect: () => ({ left: 1130, top: 10, width: 40, height: 40 }) } }
  return { animations, transitions, attributes, classes, dispose, click: () => context.toggle(event), apply: theme => context.apply(theme) }
}

test('repeated dark/light cycles release filled root snapshots before the next transition', async() => {
  const state = setup()
  for (let i = 0; i < 6; i++) {
    state.click()
    const transition = state.transitions.at(-1)
    transition.capture()
    await flush()
    assert.equal(state.animations.size, 1)
    assert.equal([...state.animations][0].options.pseudoElement, i % 2 ? '::view-transition-old(root)' : '::view-transition-new(root)')
    transition.complete()
    await flush()
    assert.equal(state.animations.size, 0, 'Completed circle must not clip the next transition snapshots')
    assert.equal(state.classes.has('theme-transitioning'), false)
  }
})

test('interrupting a running circle cancels it without an old completion cancelling the replacement', async() => {
  const state = setup()
  state.click()
  state.transitions[0].capture()
  await flush()
  state.click()
  assert.equal(state.animations.size, 0)
  state.transitions[1].capture()
  await flush()
  assert.equal(state.animations.size, 1)
  assert.equal(state.classes.has('theme-transitioning'), true)
  state.transitions[1].complete()
  await flush()
  assert.equal(state.animations.size, 0)
})

test('unmount and a nonanimated theme update release an active circle', async() => {
  for (const action of ['dispose', 'apply']) {
    const state = setup()
    state.click()
    state.transitions[0].capture()
    await flush()
    action === 'dispose' ? state.dispose() : state.apply('dark')
    await flush()
    assert.equal(state.animations.size, 0)
    assert.equal(state.classes.has('theme-transitioning'), false)
  }
})

test('skipping before capture cannot create a stale circle', async() => {
  const state = setup()
  state.click()
  state.click()
  state.transitions[1].capture()
  await flush()
  assert.equal(state.animations.size, 1)
  assert.equal(state.attributes.get('data-theme'), 'dark')
  state.transitions[1].complete()
  await flush()
  assert.equal(state.animations.size, 0)
})

test('reduced motion and unsupported browsers switch immediately without a circle', () => {
  for (const options of [{ reducedMotion: true }, { supportsTransitions: false }]) {
    const state = setup(options)
    state.click()
    assert.equal(state.attributes.get('data-theme'), 'light')
    assert.equal(state.transitions.length, 0)
    assert.equal(state.animations.size, 0)
  }
})
