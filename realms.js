const axios = require('axios')
require('dotenv').config()
const config = require('./config.json')

AUTH_HOST = 'https://authserver.mojang.com',
MOJANG_HOST = 'https://api.mojang.com',
REALMS_HOST = 'https://pc.realms.minecraft.net'

TOKEN_API = '/authenticate',
PROFILE_API = '/users/profiles/minecraft',
WORLD_API = '/worlds',
INVITE_API = '/invites'

module.exports.RealmsAPI = class RealmsAPI {
  async get(host, endpoint) {
    const url = `${host}${endpoint}`
    const res = await axios.get(url)
    return res.data
  }

  async post(host, endpoint, query) {
    const url = `${host}${endpoint}`
    const res = await axios.post(url, query)
    return res.data
  }

  async postWith(host, endpoint, query) {
    const url = `${host}${endpoint}`
    const session = await this.getCookie()
    const res = await axios.post(url, query, {
      headers: {
        Cookie: session
      }
    })
    return res.data
  }

  async getToken() {
    const query = {
      username: process.env.REALMS_EMAIL,
      password: process.env.REALMS_PASS
    }
    const res = await this.post(AUTH_HOST, TOKEN_API, query)
    return res.accessToken
  }

  async getUUID(uid) {
    const res = await this.get(MOJANG_HOST, `${PROFILE_API}/${uid}`)
    return res.id
  }

  async getCookie() {
    const username = process.env.REALMS_USER
    const version = config.realms.version
    const token = await this.getToken()
    const uuid = await this.getUUID(username)
    return `sid=token:${token}:${uuid};user=${username};version=${version}`
  }

  async postInvite(name) {
    const world = config.realms.world
    const uuid = await this.getUUID(name)
    const res = await this.postWith(REALMS_HOST, `${INVITE_API}/${world}`, {
      name: name,
      uuid: uuid
    })
    return res
  }
}
