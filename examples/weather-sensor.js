import { createClient } from '../src/index.js'

const client = createClient({ name: 'weather-sensor' })
await client.connect()

setInterval(() => {
  client.publish('weather/temperature', { temp: (20 + Math.random() * 10).toFixed(1) })
}, 5000)
