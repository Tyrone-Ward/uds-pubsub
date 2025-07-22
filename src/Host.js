import { createServer } from 'net'
import { unlink } from 'fs/promises'

export class UdsPubSubHost {
  constructor (socketPath = '/tmp/uds-pubsub.sock') {
    this.socketPath = socketPath
    this.topics = new Map()
    this.clients = new Map()
    this.server = null
  }

  async start () {
    await this.cleanupSocket()

    this.server = createServer((socket) => {
      let clientName = null

      socket.once('data', (data) => {
        try {
          const msg = JSON.parse(data.toString())
          clientName = msg.from
          this.clients.set(clientName, socket)
        } catch {
          socket.destroy()
        }

        this.handleMessages(socket, clientName)
      })

      socket.on('close', () => {
        if (clientName) {
          this.unsubscribeAll(clientName)
          this.clients.delete(clientName)
        }
      })
    })

    await new Promise((resolve) => this.server.listen(this.socketPath, resolve))
    console.log(`📡 UDS PubSub host listening on ${this.socketPath}`)
  }

  async cleanupSocket () {
    try {
      await unlink(this.socketPath)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  handleMessages (socket, clientName) {
    socket.on('data', (data) => {
      for (const line of data.toString().split('\n').filter(Boolean)) {
        try {
          const msg = JSON.parse(line)
          switch (msg.type) {
            case 'subscribe':
              this.subscribe(msg.topic, clientName)
              break
            case 'unsubscribe':
              this.unsubscribe(msg.topic, clientName)
              break
            case 'publish':
              this.publish(msg.topic, msg.payload, clientName)
              break
          }
        } catch {
          console.warn('Malformed message from', clientName)
        }
      }
    })
  }

  subscribe (topic, clientName) {
    if (!this.topics.has(topic)) this.topics.set(topic, new Set())
    this.topics.get(topic).add(clientName)
  }

  unsubscribe (topic, clientName) {
    if (this.topics.has(topic)) {
      this.topics.get(topic).delete(clientName)
      if (this.topics.get(topic).size === 0) {
        this.topics.delete(topic)
      }
    }
  }

  unsubscribeAll (clientName) {
    for (const [topic, clients] of this.topics.entries()) {
      clients.delete(clientName)
      if (clients.size === 0) this.topics.delete(topic)
    }
  }

  publish (topic, payload, fromClient) {
    const message = JSON.stringify({ from: fromClient, type: 'publish', topic, payload }) + '\n'
    const subscribers = this.topics.get(topic)
    if (!subscribers) return
    for (const clientName of subscribers) {
      const socket = this.clients.get(clientName)
      if (socket) socket.write(message)
    }
  }

  stop () {
    this.server?.close()
    this.cleanupSocket()
  }
}
