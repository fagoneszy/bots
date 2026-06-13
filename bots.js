import mineflayer from 'mineflayer'
import dns from 'dns'

const HOST = 'server.free.hoskes.top'
const PORT = 13574
const TOTAL = 5

const NAMES = [
  'Herobrine','Notch','Jeb','Steve','Alex',
  'NoobSlayer','Xx_Shadow_xX','DarkKnight','ProGamer','NinjaBot',
  'BotVoid','CreeperKiller','ZombieHunter','DiamondKing','NetherLord',
  'PixelWarrior','CraftMaster','MineGod','BlockBreaker','RedstoneGenius',
  'LavaWalker','EnderMan_','SoulReaper','NightBlade','StormBringer',
  'IronGuard','StoneHeart','FireFist','IceQueen','ThunderBolt',
]

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

const selectedNames = shuffle([...NAMES]).slice(0, TOTAL)

function resolveHost() {
  return new Promise(r => dns.lookup(HOST, { all: true }, (e, a) => r(!e && a?.length ? a[0].address : null)))
}

async function createBot(index) {
  const username = selectedNames[index]
  const ip = await resolveHost()
  if (!ip) return setTimeout(() => createBot(index), 5000)

  const bot = mineflayer.createBot({ host: ip, port: PORT, username, version: false, auth: 'offline' })

  let aiInterval = null
  let fleeing = false

  function stop() {
    if (aiInterval) clearInterval(aiInterval)
    try { bot.setControlState('forward', false) } catch {}
    try { bot.setControlState('back', false) } catch {}
    try { bot.setControlState('left', false) } catch {}
    try { bot.setControlState('right', false) } catch {}
    try { bot.setControlState('jump', false) } catch {}
    try { bot.setControlState('sprint', false) } catch {}
  }

  bot.on('spawn', () => {
    console.log(`[${username}] correndo!`)
    startRunning(bot, username)
  })

  bot.on('hurt', () => {
    fleeing = true
    console.log(`[${username}] fugindo!`)
    setTimeout(() => { fleeing = false }, 3000)
  })

  bot.on('death', stop)
  bot.on('respawn', () => { fleeing = false; setTimeout(() => startRunning(bot, username), 1000) })
  bot.on('end', () => { stop(); setTimeout(() => createBot(index), 5000) })
  bot.on('kicked', () => { stop(); setTimeout(() => createBot(index), 5000) })
  bot.on('error', () => {})

  function startRunning(bot) {
    stop()

    let direction = Math.random() * Math.PI * 2
    let changeTimer = null

    function scheduleMove() {
      if (changeTimer) clearTimeout(changeTimer)

      direction += (Math.random() - 0.5) * Math.PI
      try {
        bot.look(direction, 0, false)
        bot.setControlState('forward', true)
        bot.setControlState('sprint', true)
      } catch {}
      changeTimer = setTimeout(scheduleMove, 1000 + Math.random() * 3000)
    }

    scheduleMove()

    aiInterval = setInterval(() => {
      if (bot.health <= 0 || !bot.entity) return

      if (fleeing) {
        const dir = direction + Math.PI + (Math.random() - 0.5) * 0.5
        try {
          bot.look(dir, 0, false)
          bot.setControlState('forward', true)
          bot.setControlState('sprint', true)
          bot.setControlState('jump', true)
          setTimeout(() => { try { bot.setControlState('jump', false) } catch {} }, 300)
        } catch {}
      }
    }, 200)
  }
}

async function start() {
  console.log(`[BOTS] ${TOTAL} bots correndo: ${selectedNames.join(', ')}`)
  for (let i = 0; i < TOTAL; i++) { createBot(i); await new Promise(r => setTimeout(r, 500 + Math.random() * 500)) }
}

start()
