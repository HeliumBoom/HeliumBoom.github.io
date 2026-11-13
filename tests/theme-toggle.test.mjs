import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const script = await readFile(new URL('../src/scripts/theme.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(script, {
  compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS }
}).outputText

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const flush = async() => { for (let i = 0; i < 8; i++) await Promise.resolve() }

function setup({ reducedMotion = false, supportsTransitions = true, origin = [0, 0], snapshot = [1200, 800], event: eventOverrides = {} } = {}) {
  const classes = new Set(['dark'])
  const attributes = new Map([['data-theme', 'dark']])
  const animations = new Set()
  const transitions = []
  const probes = new Set()
  const html = {
    classList: { contains: name => classes.has(name), toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name), add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)) },
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
    body: { append: element => probes.add(element) },
    createElement: () => ({ style: {}, setAttribute() {}, remove() { probes.delete(this) } }),
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
    document, Event, exports: {},
    DOMMatrix: class {
      constructor(value) {
        const values = value === 'none' ? [1, 0, 0, 1, 0, 0] : value.match(/matrix\((.+)\)/)[1].split(',').map(Number)
        this.e = values[4]; this.f = values[5]
      }
    },
    localStorage: { getItem: () => null, setItem() {} },
    window: { innerWidth: 1200, innerHeight: 800,
      getComputedStyle: (_, pseudo) => pseudo === '::view-transition-group(theme-origin)' ?
        { transform: `matrix(1, 0, 0, 1, ${origin[0]}, ${origin[1]})` } :
        { transform: 'matrix(1, 0, 0, 1, 0, 0)', width: `${snapshot[0]}px`, height: `${snapshot[1]}px` },
      matchMedia: query => ({ matches: query.includes('reduced-motion') ? reducedMotion : true, addEventListener() {}, removeEventListener() {} }),
      addEventListener() {}, removeEventListener() {}, dispatchEvent() {} }
  })
  vm.runInContext(compiled, context)
  context.exports.initTheme()
  const event = { detail: 1, clientX: 1150, clientY: 30, currentTarget: { getBoundingClientRect: () => ({ left: 1130, top: 10, width: 40, height: 40 }) }, ...eventOverrides }
  return { animations, transitions, attributes, classes, probes, dispose: context.exports.cancelThemeTransition, click: () => context.exports.toggleTheme(event), apply: theme => context.exports.applyTheme(theme) }
}

test('mobile clicks are converted from viewport coordinates to snapshot coordinates', async() => {
  for (const origin of [[0, 56], [24, 56], [0, 0]]) {
    const state = setup({ origin, snapshot: [430, 900], event: { clientX: 315, clientY: 31, pointerType: 'touch' } })
    state.click()
    assert.equal(state.probes.size, 1)
    state.transitions[0].capture()
    await flush()
    const { frames } = [...state.animations][0]
    const x = 315 + origin[0], y = 31 + origin[1]
    assert.equal(frames.clipPath[0], `circle(0px at ${x}px ${y}px)`)
    assert.equal(frames.clipPath[1], `circle(${Math.hypot(Math.max(x, 430 - x), Math.max(y, 900 - y))}px at ${x}px ${y}px)`)
    state.transitions[0].complete()
    await flush()
    assert.equal(state.probes.size, 0, 'The coordinate probe must not survive its transition')
  }
})

test('touch clicks with detail zero use the touch position; keyboard clicks use button center', async() => {
  for (const [event, point] of [
    [{ detail: 0, pointerType: 'touch', clientX: 1142, clientY: 22 }, [1142, 78]],
    [{ detail: 0, pointerType: '', clientX: 0, clientY: 0 }, [1150, 86]],
  ]) {
    const state = setup({ origin: [0, 56], event })
    state.click()
    state.transitions[0].capture()
    await flush()
    assert.equal([...state.animations][0].frames.clipPath[0], `circle(0px at ${point[0]}px ${point[1]}px)`)
  }
})

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
    assert.equal(state.probes.size, 0)
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
  assert.equal(state.probes.size, 1, 'Only the replacement may own a coordinate probe')
  state.transitions[1].capture()
  await flush()
  assert.equal(state.animations.size, 1)
  assert.equal(state.classes.has('theme-transitioning'), true)
  state.transitions[1].complete()
  await flush()
  assert.equal(state.animations.size, 0)
  assert.equal(state.probes.size, 0)
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
    assert.equal(state.probes.size, 0)
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
  assert.equal(state.probes.size, 0)
})

test('reduced motion and unsupported browsers switch immediately without a circle', () => {
  for (const options of [{ reducedMotion: true }, { supportsTransitions: false }]) {
    const state = setup(options)
    state.click()
    assert.equal(state.attributes.get('data-theme'), 'light')
    assert.equal(state.transitions.length, 0)
    assert.equal(state.animations.size, 0)
    assert.equal(state.probes.size, 0)
  }
})
