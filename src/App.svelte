<script>
  import Blah from './components/Blah'
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
  <h1>App</h1>
  <Blah baz={'foo1111'}/>
  <Mini />
  <Command />
  <Icon type='test-tube' height={40} width={40} />
  <Icon type='filter' height={40} width={40} />
  <Icon type='redo' height={20} width={20} />
</div>
