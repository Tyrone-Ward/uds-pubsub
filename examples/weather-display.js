import { createClient } from '../src/index.js'

const client = createClient({ name: 'weather-display' })
await client.connect()

client.subscribe('weather/temperature', (payload) => {
  console.log('📡 Weather update:', payload)
})
