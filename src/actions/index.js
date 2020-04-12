import { get } from 'svelte/store'
import {
  mergeValue,
} from '../store/index'

// used for Svelte context
export const key = {}

// Run one test in this tab so you can debug it
export function focusTest(store, name) {
  name = name === undefined ? get(store).focus : name
  store.update(mergeValue({focus: name}))
  let test = Latte.flatten().find(t => t.fullName === name)

  // Update the url if needed
  let sp = new URLSearchParams(location.search)
  if (name !== sp.get('focus')) {
    name ? sp.set('focus', name) : sp.delete('focus')
    history.pushState({}, 'Zen', '?' + sp.toString())
  }

  if (!name || !test) return

  store.update(mergeValue({focusStatus: 'running'}))
  Latte.run([test])
}

export function filterTests(store, opts={}) {
  let grep = (opts.hasOwnProperty('grep') ? opts.grep : get(store).grep) || ''
  store.update(mergeValue({grep}))

  // Update the url if we're changing grep or focus
  let sp = new URLSearchParams(location.search)
  if (grep !== (sp.get('grep') || '')) {
    grep ? sp.set('grep', grep) : sp.delete('grep')
    history.pushState({}, 'Zen', '?' + sp.toString())
  }

  let grepRegex = grep && new RegExp(grep, 'i')
  let tests = Latte.flatten().filter(t => (!grep || grepRegex.test(t.fullName)))

  let testNames = tests.map(t => t.fullName)
  Zen.socket.send(JSON.stringify(Object.assign({type: 'filterTests', grep, testNames}, opts)))
}

export function closeCommand() {
  /*
  if (Zen.command) {
    Zen.command.$destroy()
    Zen.command = null
  }
  */
}

export function focusGroup(store, failureGroups, group) {
  if (typeof group === 'number') {
    let groups = get(failureGroups)
    let index = groups.findIndex(g => g.containsFocus)
    group = groups[index + group] || groups[0]
  }

  if (group && group[0]) {
    focusTest(store, group[0].fullName)
  }
}