<script>
  import fuzzysort from 'fuzzysort'
  import { onMount, getContext } from 'svelte'
  import { get } from 'svelte/store'
  import Icon from './Icon'
  import { key } from '../store/index'
  import {
    filterTests,
    focusTest,
    focusGroup,
  } from '../actions/index'
  import {
    failureGroups as failureGroupsCreator,
    groupForFocus as groupForFocusCreator,
  } from '../store/derived'
  import {
    altKeyDownPreventDefault,
    altKeyUpPreventDefault,
  } from '../utils/altKey'

  const { getStore } = getContext(key)
  const store = getStore()

  const failureGroups = failureGroupsCreator(store)


  let input = ''
  let prompt
  let list
  let selectedIndex = 0
  export let suggestions
  $: suggestions = suggestionsForInput(input)

  let searchNodes
  $: searchNodes = prepareSearch()

  onMount(() => {
    if (prompt) {
      prompt.focus()
    }
  })

  const Latte = {}

  const commands = [
    {
      type: 'command', title: 'Run the focused test', key: 'Alt Space', keyCode: 32,
      condition: () => get(store).focus,
      action: () => focusTest(store),
      icon: 'redo',
    }, {
      type: 'command', title: 'Focus the next problem', key: 'Alt →', keyCode: 39,
      condition: () => get(failureGroups).length > 0,
      action: () => focusGroup(store, failureGroups, +1),
      icon: 'arrow-right',
    }, {
      type: 'command', title: 'Focus the previous problem', key: 'Alt ←', keyCode: 37,
      condition: () => get(failureGroups).length > 0,
      action: () => focusGroup(store, failureGroups, -1),
      icon: 'arrow-left',
    // }, {
    //   type: 'command', title: 'Filter to failed tests', key: 'Alt F', keyCode: 70,
    //   condition: () => get(failureGroups).length > 0,
    //   action: () => filterTests({failed: true}),
    //   icon:
    }, {
      type: 'command', title: 'Run filtered tests', key: 'Alt Enter', keyCode: 13,
      action: () => filterTests(store, {run: true}),
      icon: 'redo',
    }, {
      type: 'command', title: 'Run all tests', key: 'Alt A', keyCode: 65,
      action: () => filterTests(store, {grep: null, run: true}),
      altText: 'Clear the filter to run every suite',
      icon: 'asterisk',
      /*
    }, {
      type: 'command', title: 'Debug on S3',
      action: () => runBatchForFocus({s3: true}),
      icon: 'bug',
    }, {
      type: 'command', title: 'Show logs in Amazon CloudWatch',
      action: () => openCloudWatch(),
      icon: 'bug',
      */
    }, {
      type: 'command', title: 'Dev: Reload headless chrome',
      action: () => filterTests(store, {reload: true, force: true}),
      icon: 'bug',
    }
  ]


  // The set of tests or commands has changed. Do as much work up front to make opening command and typing fast.
  export function prepareSearch() {
    let queue = [Latte.root], step
    let nodes = Array.from(commands)
    while (step = queue.pop()) {
      if (step.fullName)
        nodes.push({type: 'describe', title: step.fullName, depth: step.depth})
      step.tests.forEach(t => nodes.push({type: 'test', title: t.fullName, describe: step.fullName}))
      queue = queue.concat(step.children)
    }

    nodes.forEach(n => { n.prep = fuzzysort.prepare(n.title) })
    return nodes
  }

  export function handleKeyUp(event) {
    let onlyAlt = altKeyUpPreventDefault(event)
    if (onlyAlt) {
      closeCommand()
    }
  }

  export function handleKeyDown(event) {
    altKeyDownPreventDefault(event)
    if (event.altKey) {
      event.preventDefault()
    }

    event.stopPropagation()
    if (_isUpKey(event))
      setSelected(selectedIndex - 1)
    else if (_isDownKey(event))
      setSelected(selectedIndex + 1)
    else if (_isEscapeKey(event))
      closeCommand()
    else if (event.keyCode == 13) // enter
      takeAction(selectedIndex)
    else return
    event.preventDefault()
  }

  function _isUpKey ({keyCode, key, metaKey, altKey, ctrlKey} = {}) {
    return keyCode == 38 || (!metaKey && !altKey && ctrlKey && ['p', 'k'].includes(key))
  }

  function _isDownKey ({keyCode, key, metaKey, altKey, ctrlKey} = {}) {
    return keyCode == 40 || (!metaKey && !altKey && ctrlKey && ['n', 'j'].includes(key))
  }

  function _isEscapeKey ({keyCode, key, metaKey, altKey, ctrlKey} = {}) {
    return keyCode == 27 || (!metaKey && !altKey && ctrlKey && key == '[')
  }

  export function takeAction(idx) {
    let sugg = suggestions[idx]
    if (sugg.action) sugg.action()
    else if (sugg.type == 'describe') filterTests(store, {grep: sugg.title, run: true})
    else if (sugg.type == 'test') focusTest(store, sugg.title)
    closeCommand()
  }

  export function setSelected(idx) {
    idx = Math.max(0, idx)
    idx = Math.min(suggestions.length - 1, idx)
    selectedIndex = idx

    let el = list.children[idx]
    // TODO scroll into view
  }

  function icon(node) {
    if (node.icon) return node.icon
    if (node.type == 'describe') return 'filter'
    if (node.type == 'test') return 'test'
  }

  function altText(node) {
    if (node.altText) return node.altText
    if (node.type == 'describe') return 'Only run tests in this suite'
    if (node.type == 'test') return 'Run this test in this tab'
  }

  function suggestionsForInput(input='') {
    let priorityMap = {command: 0, describe: 1, test: 2}

    let sorted = fuzzysort.go(input, searchNodes, {limit: 50, keys: ['prep'], allowTypo: true})
    // TODO: we might want to give a boost to commands, and a slightly smaller one to describe blocks
    // * It might also be helpful to promote recently focused/grepped things

    if (input) {
      return sorted.slice(0, 50).map(tuple => tuple.obj)
    } else {
      return searchNodes.slice(0, 50)
    }
  }

  export let closeCommand;

/*
  export function handleKeyDown(ev) {
    if (!ev.altKey || ev.shiftKey || ev.metaKey || ev.ctrlKey) return // only consider keys with just alt
    let command = commands.find(c => c.keyCode === ev.keyCode)
    if (command && (!command.condition || command.condition())) {
      ev.preventDefault()
      command.action()
      closeCommand()
    }
  }
  */
</script>

<style>
  /* avoid any css rules from  */
  .ZenCommand {
    line-height: 1.5em;

    width: 80%;
    max-width: 500px;
    position: absolute;
    top: 200px;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, 0);

    background: #212121;
    color: #ddd;
    font-size: 12px;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }

  input {
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    border: none;
    background: none;
    padding: 14px 30px 10px 60px;
    border-bottom: 1px solid #313131;
    color: inherit;
    font-size: inherit;
  }

  .suggestions {
    display: block;
    height: 400px;
    overflow: scroll;
  }

  .suggestions > div {
    display: flex;
    align-items: center;
    padding: 5px 14px;
  }

  .icon {
    fill: #aaa;
    filter: invert(0.5);
    border: 1px solid #ddd;
    border-radius: 50%;
    padding: 5px;
    height: 20px;
    flex: 0 0 20px;
    margin-right: 14px;
  }

  .title { flex: 1; }

  .selected {
    background: #313131;
  }

  .keys {
    flex: 0 0;
    white-space: nowrap;
  }
  .keys > span {
    font-size: 10px;
    display: inline-block;
    padding: 1px 5px;
    border: 1px solid #aaa;
    border-radius: 1px;
    margin-left: 5px;
  }
</style>

<div class='ZenCommand'>
  <input
    bind:value={input}
    bind:this={prompt}
    on:blur={() => closeCommand()}
    on:keydown={handleKeyDown}
    on:keyup={handleKeyUp}
    on:input={() => setSelected(0)}
  />
  <div bind:this='{list}' class='suggestions'>
    {#each suggestions as suggestion, index}
      <div
        class="{index == selectedIndex ? 'selected' : ''}"
        title='{altText(suggestion)}'
        on:click='{() => takeAction(index)}'
      >
        <span class='icon'>
          <Icon type={icon(suggestion)} height={20} width={20} />
        </span>
        <span class='title'>{suggestion.title}</span>
        {#if suggestion.key}
          <div class='keys'>
            {#each suggestion.key.split(' ') as k}
              <span>{k}</span>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>