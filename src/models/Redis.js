'use strict'

import ioredis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

// Create an ioredis object using our server definition and extend the original ioredis functions
function Redis(...args) {

  var redis = null

  // use my options
  if(arguments.length === 1 
    && typeof arguments[0] === 'object'
    && typeof arguments[0].name === 'string'){
    var server = arguments[0]
    
    var options = {
      host: server.host,
      port: server.port,
      password: server.password,
      retryStrategy(times) {
        let delay = Math.min(times * 50, 2000)
        if(!server.redisretrytimes){
          return delay
        }else if(server.redisretrytimes <= 0){
          return null
        }else{
          if(server.redisretrytimes > times) {
            return delay
          }
          else {
            return null
          }
        }
      },
      enableReadyCheck: true,
      showFriendlyErrorStack: true,
      tls: function(){
        if(server.securitytype === 'tls'){
          return {
            ca: fs.readFileSync(server.sslcafile),
            key: fs.readFileSync(server.sslkeyfile),
            cert: fs.readFileSync(server.sslcertfile),
            rejectUnauthorized: false
          }
        }else{
          return null
        }
      }()
    }
    if(!server.cluster){
      redis = new ioredis(options)
    }
    else{
      let nodes = []
      let node = {
        host: server.host,
        port: server.port
      }
      if(server.clusternodes && server.clusternodes.length > 0) {
        nodes = server.clusternodes
      }
      nodes.push(node)
      var clusterOptions = {
        slotsRefreshTimeout: 5000,
        redisOptions: options
      }
      redis = new ioredis.Cluster(nodes,clusterOptions)
      redis.clusterStartParam = {
        param1: nodes,
        param2: clusterOptions
      }
    }
    
  } else if(arguments.length >= 1 
    && Array.isArray(arguments[0])) {
      // cluster
    redis = new ioredis.Cluster(...args)
    redis.clusterStartParam = {
      param1: arguments[0],
      param2: arguments[1]
    }
  }else {
    redis = new ioredis(...args)
  }

  redis.close = function() {
    // _.remove(connections, (r) =>{
    //   return r.connectionId == this.connectionId
    // })
    this.quit()
    .catch( (error) => {})
  }

  redis.connectionId = uuidv4()

  return redis
}
export default Redis