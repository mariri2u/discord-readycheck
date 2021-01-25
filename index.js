require('dotenv').config()
const discord = require('discord.js')
const config = require('./config.json')

const reactions = {}
const client = new discord.Client()

const reload = () => {
  console.info('now running')
  client.guilds.cache.map(g => {
    const list = []
    g.emojis.cache.map(e => {
      if (config.stamps.indexOf(e.name) >= 0) {
        list.push(`${e.name}:${e.id}`)
      }
    })
    reactions[g.id] = list
  })
  console.dir(reactions)
  console.info('reaction ready')
}

client.once('ready', () => {
  reload()
})

client.on('message', async msg => {
  if (msg.content.match(/.*\.ready.*/g)) {
    if (reactions[msg.guild.id]) {
      reactions[msg.guild.id].map(async r => {
        await msg.react(r)
      })
    }
  } else if (msg.content === '.reload') {
    reload()
  }
})

client.login(process.env.DISCORD_TOKEN)
