import { mergeValue } from '../store/index'

let socket;

export function init(store) {
  if (socket) {
    return socket
  }

  //socket = new WebSocket(`ws://${location.host}/head`)
  socket = new WebSocket(`ws://localhost:3100/head`)
  socket.onopen = () => {
    console.log("socket opened")
    // onUrlChange()
  }
  socket.onmessage = serverMessage
  socket.onclose = () => {
    store.update(mergeValue({socketDisconnected: true}))
  }

  function serverMessage(msg) {
    let data = JSON.parse(msg.data)
    console.log("serverMessage", data)

    if (data.results && !data.runId) { // incremental update of results
      store.update(mergeValue({results: get(store).results.concat(data.results)}))
    } else {
      // update our state from the server. If our code is out of date, update and re-run the focused test
      store.update(mergeValue(data))
    }
  }

  return socket
}
