import {
  writable,
} from 'svelte/store'

// used for Svelte context
export const key = {}

export const store = writable({
  results: [],
  focus: null,
  focusStatus: 'none',
  compile: { errors: [] },
  // passedFocus: null,
  icons: {},
})

export function mergeValue(hash) {
  return function(val) {
    return {...val, ...hash}
  }
}