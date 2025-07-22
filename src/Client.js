import { createConnection } from 'net'
import EventEmitter from 'events'

export class UdsPubSubClient extends EventEmitter {
  constructor ({ name = 'unnamed-client', socketPath = '/tmp/uds-pubsub.sock' } = {}) {
    super()
    this.name = name
    this.socketPath = socketPath
    this.client = null
  }

  async connect () {
    this.client = createConnection(this.socketPath)
    await new Promise((resolve) => this.client.once('connect', resolve))
    this.client.write(JSON.stringify({ from: this.name }) + '\n')

    this.client.on('data', (data) => {
      for (const line of data.toString().split('\n').filter(Boolean)) {
        try {
          const msg = JSON.parse(line)
          if (msg.type === 'publish' && msg.topic) {
            this.emit(msg.topic, msg.payload)
          }
        } catch {
          console.warn('Invalid message:', line)
        }
      }
    })
  }

  subscribe (topic, callback) {
    this.on(topic, callback)
    this.client.write(JSON.stringify({
      from: this.name,
      type: 'subscribe',
      topic
    }) + '\n')
  }

  unsubscribe (topic) {
    this.off(topic)
    this.client.write(JSON.stringify({
      from: this.name,
      type: 'unsubscribe',
      topic
    }) + '\n')
  }

  publish (topic, payload) {
    this.client.write(JSON.stringify({
      from: this.name,
      type: 'publish',
      topic,
      payload
    }) + '\n')
  }

  close () {
    this.client.end()
  }
}

export function createClient (config = {}) {
  return new UdsPubSubClient(config)
}
