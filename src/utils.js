  let pressedKeys = new Set()
  const ALT_KEY_CODE = 18;

  function checkOnlyAlt() {
    return pressedKeys.size === 1 && pressedKeys.has(ALT_KEY_CODE)
  }

  export function altKeyDownPreventDefault(ev) {
    pressedKeys.add(ev.keyCode)

    if (ev.keyCode === ALT_KEY_CODE) {
      ev.preventDefault();
    }
  }

  export function altKeyUpPreventDefault(ev) {
    const onlyAlt = checkOnlyAlt();
    if (onlyAlt) {
      ev.preventDefault();
    }

    pressedKeys.clear()

    return onlyAlt;
  }