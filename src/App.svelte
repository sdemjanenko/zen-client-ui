<script>
  import Mini from './components/Mini'
  import Command from './components/Command'
  import Icon from './components/Icon'

  import { setContext } from 'svelte'
  import { store, key } from './store/index'
  import {
    altKeyDownPreventDefault,
    altKeyUpPreventDefault,
  } from './utils'

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
