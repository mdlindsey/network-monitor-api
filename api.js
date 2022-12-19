const PORT = process.env.PORT || 8888

const { v4:uuidv4 } = require('uuid')

const actualIntervals = {}
const intervalSettings = {}
const defaultIntervalMS = 1000
const utf8 = new TextDecoder('utf-8')
const time = () => new Date().getTime()

require('dotenv').config()
require('uWebSockets.js').App().ws('/*', {
    /* There are many common helper features */
    idleTimeout: 32,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
    open: (ws) => {
        try {
            ws.id = uuidv4()
            ws.addr = utf8.decode(ws.getRemoteAddressAsText())
            console.log(`<${ws.id}> connected`)
            intervalSettings[ws.id] = defaultIntervalMS
            actualIntervals[ws.id] = setInterval(() => ws.send(`${time()}`), intervalSettings[ws.id])
        } catch(e) {
            console.log('[!] Open listener unexpected failure', e)
        }
    },
    close: (ws) => {
        try {
            console.log(`<${ws.id}> disconnected`)
            clearInterval(actualIntervals[ws.id])
        } catch(e) {
            console.log('[!] Close listener unexpected failure', e)
        }
    },
    message: (ws, message) => {
        try {
            console.log(`<${ws.id}> messaged`, utf8.decode(message))
            ws.send(`:${utf8.decode(message)}>${time()}`)
        } catch(e) {
            console.log('[!] Message listener unexpected failure', e)
        }
    }
}).get('/health', (res, req) => {
    res.writeStatus('200 OK').writeHeader('x-healthy', 'true').end('ok')
}).listen(PORT, (listenSocket) => {
    if (listenSocket) {
        console.log(`Network Monitor API (uWebSocket) listening on port ${PORT}`)
    }
})
