<script>
  import { getContext } from 'svelte'
  import { key } from '../store/index'

  const { getStore } = getContext(key)
  const store = getStore()

  console.log("store", store)


	export let baz = '';
</script>

<div>
  <h2>Blah {baz}: {$store.results.length}</h2>
</div>