# 📡 uds-pubsub
Lightweight, local **publish/subscribe messaging** for Node.js using **Unix Domain Sockets**.

✅ Simple API  
✅ Fast IPC for local processes  
✅ Topics, subscriptions, and routing  
✅ Ideal for microservice-like Node.js apps on a single machine  
✅ Zero external dependencies (no Redis, no MQTT broker)

---
### 🚀 **Installation**
``` sh
npm install uds-pubsub
```
<br/>

---

### ✨ Key Features

- Familiar **EventEmitter-like API**

- Supports **topics** (like MQTT channels)

- Efficient **Unix Domain Socket IPC**

- Simple ```subscribe```, ```unsubscribe```, ```publish``` workflow

- Can be embedded in any Node.js app or CLI tool

- Lightweight, fast, no external brokers

<br/>

---

### 🔧 API Overview
#### Create a Host (Broker)
``` javascript
import { UdsPubSubHost } from 'uds-pubsub';

const host = new UdsPubSubHost();
await host.start();
```
<br/>

---
#### Create a Client
``` javascript
import { createClient } from 'uds-pubsub';

const client = createClient({ name: 'weather-sensor' });
await client.connect();
```
<br/>

---

#### Subscribe to a Topic
``` javascript
client.subscribe('weather/temperature', (payload) => {
    console.log('Temperature update:', payload);
});
```
<br/>

---

#### Publish to a Topic
``` javascript
client.publish('weather/temperature', { temp: 23.4 });
```
<br/>

---

#### Unsubscribe from a Topic
``` javascript
client.unsubscribe('weather/temperature');
```
<br/>

---

#### Close the Connection
```javascript
client.close();
```
<br/>

---

### 🏗️ **Architecture Diagram**
``` pgsql
+--------------------+        +-------------------+
| weather-sensor     |        | weather-display    |
| (publishes)        |        | (subscribes)       |
+--------+-----------+        +---------+---------+
         |                              ^
         |                              |
         v                              |
     +---+----------------------------------+
     |        uds-pubsub Host (Broker)      |
     |  - Handles topics & routing          |
     |  - Uses Unix Domain Sockets (UDS)    |
     +--------------------------------------+

```
<br/>

### 🛠️ Advanced Options
#### Customize Socket Path
``` javascript
createClient({
    name: 'custom-client',
    socketPath: '/tmp/my-custom.sock'
});
```
```javascript
const host = new UdsPubSubHost('/tmp/my-custom.sock');
```
<br/>

---

### 📄 **License**
MIT License

<br/>

---
### 🤝 **Contributing**
PRs and issues welcome!  
Please open an issue before submitting large changes.

