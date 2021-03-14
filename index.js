const { RealmsAPI } = require('./realms')
require('dotenv').config()
const discord = require('discord.js')
const config = require('./config.json')

const reactions = {}
const NG = '❌'
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
      const embed = new discord.MessageEmbed()
        .setAuthor(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
        .setDescription(msg.content)
        .setColor('#d0d000')
      const newmsg = new discord.Message()
      newmsg.channel = msg.channel
      newmsg.reference = {
        channelID: msg.channel.id,
        guildID: msg.guild.id,
        messageID: msg.id 
      }
      newmsg.embed = embed
      const readycheck = await msg.channel.send(newmsg)
      reactions[readycheck.guild.id].map(async r => {
        await readycheck.react(r)
      })
      await readycheck.react(NG)
    }
  } else if (msg.content === '.reload') {
    reload()
  } else if (msg.content.match(/^.join/g)) {
    const match_obj = msg.content.match(/^.join\s(?<name>.+)/)
    const name = match_obj.groups.name
    const realms = new RealmsAPI()
    const res = await realms.postInvite(name)
      .catch(err => undefined)
    if (res) {
      msg.reply('招待しました')
    } else {
      msg.reply('招待できませんでした')
    }
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (!reaction.me && reaction.message.author.id === client.user.id) {
    const me = reaction.message.author
    const [embed] = reaction.message.embeds
    const fields = embed.fields
    let exist = false
    for (const field of fields) {
      if (field.value.indexOf(user.id) !== -1) {
        exist = true
        if (reaction.emoji.name === NG) {
          field.name = 'NG'
          field.value = `${NG}${user}`
        } else {
          field.name = 'Ready'
          field.value = `${reaction.emoji}${user}`
        }
      }
    }
    if (!exist) {
      if (reaction.emoji.name === NG) {
        fields.push({
          name: 'NG',
          value: user,
          inline: true
        })
      } else {
        fields.push({
          name: 'Ready',
          value: `${reaction.emoji}${user}`,
          inline: true
        })  
      }
    }
    await reaction.message.edit({
      embed: {
        author: embed.author,
        description: embed.description,
        color: embed.color,
        fields: fields
      }
    })
  }
})

client.login(process.env.DISCORD_TOKEN)
