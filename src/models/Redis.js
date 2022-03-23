'use strict'

import ioredis from 'ioredis'
import fs from 'fs'
import { Client } from 'ssh2'
import net from 'net'

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
      }(),
      ssh: function(){
        if(server.securitytype === 'ssh'){
          return {
            host: server.sshhost,
            port: server.sshport,
            username: server.sshusername,
            password: server.sshpassword,
            key: server.sshkeyfile && server.sshkeytype === 'keyfile' ? fs.readFileSync(server.sshkeyfile): null,
            keytype: server.sshkeytype,
            passphrase: server.sshkeypassphrase,
            srvhost: server.host,
            srvport: server.port
          }
        }else {
          return null
        }
      }()
    }
    if(!server.cluster){
      if(options.ssh){
        return connectBySSH(options)
      }
      redis = newioredis(options)
      // redis = new ioredis(options)
      // let rr = connectBySSH(options)
      // console.log(rr)
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
      // redis = new ioredis.Cluster(nodes,clusterOptions)
      // redis.clusterStartParam = {
      //   param1: nodes,
      //   param2: clusterOptions
      // }
      redis = newioredisCluster(nodes,clusterOptions)
    }
    
  } else if(arguments.length >= 1 
    && Array.isArray(arguments[0])) {
    // cluster
    // redis = new ioredis.Cluster(...args)
    // redis.clusterStartParam = {
    //   param1: arguments[0],
    //   param2: arguments[1]
    // }
    newioredisCluster(...args)
  }else {
    redis = newioredis(...args)
  }

  return new Promise(resolve=> {
    resolve(redis)
  })
}

async function connectBySSH(options){
  let redis = await asyncConnectBySSH(options)
  return redis
}

function asyncConnectBySSH(options){
  let redis = null
  const conn = new Client();
  let that = this

  let ret = new Promise(resolve => {
    conn.on('ready', () => {
      const server = net.createServer(function (sock) {
        console.log(options)
        conn.forwardOut(sock.remoteAddress, sock.remotePort, options.ssh.srvhost, options.ssh.srvport, (err, stream) => {
          if (err) {
            sock.end()
          } else {
            sock.pipe(stream).pipe(sock)
          }
        })
      }).listen(0, function () {
        console.log('listen')
        options.host = '127.0.0.1'
        options.port = server.address().port
        redis = newioredis(options)
        resolve(redis)
      })
    }).on('error', err => {
      console.log(err)
    })
  })

  try {
    const connectionConfig = {
      host: options.ssh.host,
      port: options.ssh.port,
      username: options.ssh.username
    }
    if(options.ssh.keytype == 'keyfile'){
      conn.connect(Object.assign(connectionConfig, {
        privateKey: options.ssh.key,
        passphrase: options.ssh.passphrase
      }))
    }else{
      conn.connect(Object.assign(connectionConfig, {
        password: options.ssh.password
      }))
    }
    
  } catch (err) {
    console.log(err)
  }

  return ret
}
function newioredis(...args){
  let redis = new ioredis(...args)
  redis.close = ()=> {
    this.quit()
      .catch( (error) => {})
  }
  redis.getServerNodes = () => {
    if(redis.options.ssh){
      return [{
        key: redis.options.ssh.srvhost + ":" + redis.options.ssh.srvport,
        name: redis.options.ssh.srvhost + ":" + redis.options.ssh.srvport + " (master)"
      }]
    }else{
      return [{
        key: redis.options.host + ":" + redis.options.port,
        name: redis.options.host + ":" + redis.options.port + " (master)"
      }]
    }
  }
  redis.getNodeKey = () => {
    if(redis.options.ssh){
      return redis.options.ssh.srvhost + ":" + redis.options.ssh.srvport
    }else{
      return redis.options.host + ":" + redis.options.port
    }
  }
  return redis
}
function newioredisCluster(...args){
  let redis = new ioredis.Cluster(...args)
  redis.clusterStartParam = {
    param1: arguments[0],
    param2: arguments[1]
  }
  redis.close = ()=> {
    this.quit()
      .catch( (error) => {})
  }
  redis.getServerNodes = () => {
    let servers = []
    let nodes = redis.nodes('master')  
    _.each(nodes, (node) => {
      servers.push({
        key: node.options.host + ":" + node.options.port,
        name: node.options.host + ":" + node.options.port + " (master)"
      })
    })
    nodes = redis.nodes('slave')  
    _.each(nodes, (node) => {
      servers.push({
        key: node.options.host + ":" + node.options.port,
        name: node.options.host + ":" + node.options.port + " (slave)"
      })
    })
    return servers
  }
  return redis
}

export default Redis