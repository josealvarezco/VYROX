// A headless Chrome page driven over the DevTools protocol with Node's own fetch and WebSocket: no dependencies.
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

export async function openPage({ width, height, scale = 1, profile, port = 9333 }) {
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`, // a throwaway profile: the user's own Chrome is never touched
      `--window-size=${width},${height}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  let target
  for (let attempt = 0; attempt < 75 && !target; attempt++) {
    await sleep(200)
    target = await fetch(`http://127.0.0.1:${port}/json/list`)
      .then((response) => response.json())
      .then((list) => list.find((item) => item.type === 'page'))
      .catch(() => undefined)
  }
  if (!target) throw new Error('Chrome did not start')

  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = reject
  })
  let id = 0
  const pending = new Map()
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    const call = pending.get(message.id)
    if (!call) return
    pending.delete(message.id)
    if (message.error) call.reject(new Error(message.error.message))
    else call.resolve(message.result)
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params }))
    })
  // The value of an expression, awaited when it is a promise.
  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
    return result.value
  }
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false })

  return {
    send,
    evaluate,
    goto: async (url) => {
      await send('Page.navigate', { url })
      for (let attempt = 0; attempt < 100; attempt++) {
        await sleep(100)
        if ((await evaluate('document.readyState').catch(() => '')) === 'complete') return
      }
      throw new Error(`${url} did not load`)
    },
    // Polls an expression until it is truthy.
    until: async (expression, seconds = 20) => {
      for (let attempt = 0; attempt < seconds * 5; attempt++) {
        if (await evaluate(expression).catch(() => false)) return true
        await sleep(200)
      }
      return false
    },
    screenshot: async () => (await send('Page.captureScreenshot', { format: 'png' })).data, // base64
    close: () => {
      socket.close()
      chrome.kill()
    },
  }
}
