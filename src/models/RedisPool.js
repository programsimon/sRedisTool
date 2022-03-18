'use strict'
import Redis from 'm/Redis'

export default {
  name: 'RedisPool',
  connections: [],
  newRedis(...args) {
    let redis = new Redis(...args)
    this.connections.push(redis)
    return redis
  },
  duplicateRedis(connectionId) {
    let redis = this.getRedis(connectionId)
    if(!redis) {
      return
    }
    let options = _.cloneDeep(redis.options)
    if(redis.isCluster) {
      return this.newRedis(redis.clusterStartParam.param1,redis.clusterStartParam.param2)
    }else {
      return this.newRedis(options)
    }
  },
  getRedis(connectionId) {
    let redis = _.find(this.connections, (conn) => {
      return conn.connectionId === connectionId
    })
    return redis
  },
  closeRedis(connectionId) {
    let redis = _.remove(this.connections, (conn) => {
      return conn.connectionId === connectionId
    })

    _.each(redis, (r) => {
      if(r) {
        r.quit().catch( (error) => {})
      }
    })

  },
  formatInfo(data) {
    if(!data) {
      return {}
    }
    let lines = data.split('\n')
    let info = {}
    let item = {}
    _.each(lines, (line) => {
      if(!line){
        return
      }
      if(line.startsWith('#')) {
        let gName = line.substr(2).trim()
        item = {}
        info[gName] = item
        return
      }
      if(line.indexOf(':') < 0){
        return
      }
      let kv = line.split(':')
      if(!kv || kv.length < 2){
        return
      }
      if(!kv[0] || kv[0].length <= 0){
        return
      }
      if(kv[0].indexOf('db') == 0){
        let params = {}
        let vlines = kv[1].split(',')
        if(vlines && vlines.length > 0) {
          _.each(vlines, (vline) => {
            let param = vline.split('=')
            if(param && param.length >1 && param[0] && param[0].length > 0){
              params[param[0]] = param[1]
            }
          })
        }
        params.rawValue = kv[1]
        item[kv[0]] = params
      }else {
        item[kv[0]] = kv[1]
      }
    })
    return info
  },
  formatConfig (data) {
    if(!data) {
      return []
    }
    let config = []
    let c = {}
    _.each(data, (d, index) => {
      if(index % 2 === 0) {
        c = {
          name: d,
          value: ''
        }
      }else{
        c.value = d
        config.push(c)
      }
    })
    return config
  },
  formatClients(data) {
    if(!data) {
      return []
    }
    let lines = data.split('\n')
    let clients = []
    _.each(lines, (line) => {
      if(!line){
        return
      }
      if(line.indexOf(' ') < 0){
        return
      }
      let item = line.split(' ')
      if(!item || item.length <= 0) {
        return
      }
      let client = {}
      _.each(item, (i) =>{
        let kv = i.split('=')
        if(!kv || kv.length < 2){
          return
        }
        client[kv[0]] = kv[1]
        if(kv[0] === 'addr'){
          client.host = kv[1].substr(0,kv[1].indexOf(':'))
        }
      })
      clients.push(client)
    }) 

    return clients
  }
}