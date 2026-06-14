import mineflayer from 'mineflayer'
import { pathfinder, goals } from 'mineflayer-pathfinder'
import pvp from 'mineflayer-pvp'

const HOST = 'vivara.aternos.me'
const PORT = 58728
const USERNAME = 'CombandoComAmor'

function createBot() {
  const bot = mineflayer.createBot({ host: HOST, port: PORT, username: USERNAME, auth: 'offline' })

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(pvp)

  let attacking = false
  let attackTarget = null
  let attackInterval = null
  let jumpInterval = null
  let followInterval = null

  bot.on('spawn', () => {
    console.log(`[${USERNAME}] conectado!`)
  })

  bot.on('end', () => {
    console.log(`[${USERNAME}] desconectado, reconectando...`)
    parar()
    setTimeout(createBot, 5000)
  })

  bot.on('kicked', () => {
    console.log(`[${USERNAME}] kickado, reconectando...`)
    parar()
    setTimeout(createBot, 5000)
  })

  bot.on('error', () => {})

  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    const msg = message.toLowerCase()
    if (msg === 'atacar') atacar()
    else if (msg === 'parar') parar()
  })

  function atacar() {
    if (attacking) return
    attacking = true
    console.log(`[${USERNAME}] MODO ATAQUE ATIVADO!`)

    bot.pvp.meleeAttackRate = { getTicks: () => 0 }

    jumpInterval = setInterval(() => {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 80)
    }, 1200)

    followInterval = setInterval(() => {
      if (!attacking) return
      const alvo = encontrarJogador()
      if (alvo) {
        attackTarget = alvo
        const goal = new goals.GoalFollow(alvo, 2)
        bot.pathfinder.setGoal(goal, true)
      }
    }, 300)

    attackInterval = setInterval(() => {
      if (!attacking || !attackTarget) return
      if (!bot.entity || !attackTarget.position) return
      const dist = bot.entity.position.distanceTo(attackTarget.position)
      if (dist <= 4) {
        bot.attack(attackTarget)
        bot.lookAt(attackTarget.position.offset(0, 1.6, 0))
      }
    }, 1000 / 23)
  }

  function encontrarJogador() {
    if (!bot.entities) return null
    const players = Object.values(bot.entities)
      .filter(e => e.type === 'player' && e.username !== bot.username && e.position)
      .sort((a, b) => {
        const da = bot.entity.position.distanceTo(a.position)
        const db = bot.entity.position.distanceTo(b.position)
        return da - db
      })
    return players[0] || null
  }

  function parar() {
    attacking = false
    attackTarget = null
    clearInterval(attackInterval)
    clearInterval(jumpInterval)
    clearInterval(followInterval)
    bot.pathfinder.stop()
    bot.pvp.stop()
    bot.setControlState('jump', false)
    console.log(`[${USERNAME}] ATAQUE PARADO!`)
  }
}

createBot()
