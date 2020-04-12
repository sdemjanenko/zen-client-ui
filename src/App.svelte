<script>
  import Mini from './components/Mini'
  import Command from './components/Command'
  import Icon from './components/Icon'

  import { setContext } from 'svelte'
  import { store, key } from './store/index'

  setContext(key, {
    getStore: () => store,
  });
</script>

<div>
  <Mini />
  <Command />
</div>
