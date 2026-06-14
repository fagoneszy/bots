import mineflayer from 'mineflayer'

const HOST = 'vivara.aternos.me'
const PORT = 58728
const USERNAME = 'CombandoComAmor'

function createBot() {
  const bot = mineflayer.createBot({ host: HOST, port: PORT, username: USERNAME, auth: 'offline' })

  bot.on('spawn', () => console.log(`[${USERNAME}] conectado!`))
  bot.on('end', () => { console.log(`[${USERNAME}] desconectado, reconectando...`); setTimeout(createBot, 5000) })
  bot.on('kicked', () => { console.log(`[${USERNAME}] kickado, reconectando...`); setTimeout(createBot, 5000) })
  bot.on('error', () => {})
}

createBot()
