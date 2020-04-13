<script>
  import Mini from './components/Mini'
  import Command from './components/Command'
  import Icon from './components/Icon'

  import { onMount, setContext } from 'svelte'
  import { store, key } from './store/index'
  import {
    altKeyDownPreventDefault,
    altKeyUpPreventDefault,
  } from './utils'
  import {
    init as initSocket,
  } from './api/websocket'
  import {
    getConfig,
  } from './api/index'

  setContext(key, {
    getStore: () => store,
  });

  let open = false;

  function closeCommand() {
    open = false;
  }

  export function handleKeyDown(ev) {
    altKeyDownPreventDefault(ev)
  }

  export function handleKeyUp(ev) {
    const onlyAlt = altKeyUpPreventDefault(ev)
    if (onlyAlt) {
      open = !open
    }
  }

  onMount(async () => {
    console.log("MOUNTING APP")
    initSocket(store);
    const config = await getConfig()
    console.log("config", config)
  })
</script>

<svelte:window
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
/>

<div>
  <Mini />
  {#if open}
    <Command closeCommand={closeCommand} />
  {/if}
</div>
