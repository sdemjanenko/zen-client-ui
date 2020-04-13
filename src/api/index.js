export async function getConfig() {
  try {
    // const response = await fetch('/api/config.json')
    const response = await fetch('http://localhost:3100/api/config', {
      method: 'GET',
      mode: 'cors',
    })

    return await response.json()
  } catch(e) {
    console.log("error", e)
    return {}
  }
}