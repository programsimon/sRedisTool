<template>
  <el-container class="tm-container">
    <el-header>
      <el-form inline>
        <el-form-item :label="$t('Servers')">
          <el-select v-model="curServer"  @change="onServerChange">
            <el-option 
              v-for="server in servers"
              :key="server.key"
              :label="server.name"
              :value="server.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Start monitor')">
          <el-switch
            v-model="monitorSwitch">
          </el-switch>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
      <div id="xterm-monitor" style="width:100%;height:95%">
      </div>
    </el-main>
  </el-container>  
</template>

<script>
import RedisPool from 'm/RedisPool'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit'
import iconv from 'iconv-lite'

export default {
  name: 'TerminalCmdMon',
  components: {

  },
  props: {
    config: {
      type: Object,
      default: null
    },
    redisId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      servers: [],
      curServer: '',
      redis: null,
      monitor: null,
      xterm: null,
      fitAddon: null,
      monitorSwitch: false
    }
  },
  watch: {
    monitorSwitch(val) {
      if(val === true) {
        this.startMonitor()
      }else {
        this.stopMonitor()
      }
    }
  },
  mounted() {
    this.initServerList()
  },
  beforeDestroy() {
    this.stopMonitor()
  },
  methods: {
    initServerList() {
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }

      this.servers = redis.getServerNodes()
      if(this.servers.length > 0){
        this.curServer = this.servers[0].key
      }
    },
    onSelected(){
      let that = this
      this.$nextTick(() => {
        if(that.xterm === null) {
          that.initTerminal()
        }else if(that.fitAddon !== null){
          that.fitAddon.fit()
        }
      })

    },
    initTerminal() {
        this.xterm = new Terminal()
        this.fitAddon = new FitAddon();
        this.xterm.loadAddon(this.fitAddon);
        this.xterm.open(document.getElementById('xterm-monitor'))
        this.fitAddon.fit()

        this.runTerminal()
    },
    runTerminal() {
      if (this.xterm._initialized) {
        return;
      }

      this.xterm._initialized = true;

      this.xterm.prompt = () => {
        this.xterm.write('\r\n$ ');
      }
    },
    startMonitor() {
      let that = this
      RedisPool.duplicateRedis(this.redisId)
        .then(redis => {
          that.redis = redis
          if(!that.redis) {
            return
          }
          if(!that.xterm) {
            that.initTerminal()
          }
          that.redis.on('ready',async (event) => {
            let node = that.redis
            if(that.redis.isCluster) {
              node = that.getClusterNode(that.redis, that.curServer)
            }
            if(!node) {
              return
            }

            node.monitor((err, monitor) => {
              that.monitor = monitor
              that.monitor.on("monitor", that.onMonitor)
              that.xterm.writeln('Monitor started')
            })
          })
        })
      
      
    },
    onMonitor(time, args, source, database) {
      let info = this.formatDate(new Date(time * 1000),'yyyy-MM-dd hh:mm:ss')
              + ' [' + database + ' ' + source + ']'
              + ' \u001b[92m' + args[0] + '\u001b[39m'
      args.shift()
      info = info + ' ' + this.hex2str(args).join(' ')
      this.xterm.writeln(info)
    },
    stopMonitor() {
      if(this.monitor) {
        this.monitor.disconnect()
      }
      if(this.redis){
        RedisPool.closeRedis(this.redis.connectionId)
      }
      this.monitor = null
      this.redis = null
      if(this.xterm) {
        this.xterm.writeln('Monitor stopped')
      }
    },
    formatDate(date, fmt) { 
      var o = { 
        'M+' : date.getMonth()+1,                 //月份 
        'd+' : date.getDate(),                    //日 
        'h+' : date.getHours(),                   //小时 
        'm+' : date.getMinutes(),                 //分 
        's+' : date.getSeconds(),                 //秒 
        'q+' : Math.floor((date.getMonth()+3)/3), //季度 
        'S' : date.getMilliseconds()             //毫秒 
      }
      if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+'').substr(4 - RegExp.$1.length))
      }
      for(var k in o) {
        if(new RegExp('('+ k +')').test(fmt)){
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (('00'+ o[k]).substr((''+ o[k]).length)))
        }
      }
      return fmt
    },
    getClusterNode(redis, key) {
      let node = _.find(redis.nodes('all'), (n) =>{
        return key === n.options.host + ":" + n.options.port
      })
      return node
    },
    onServerChange(val) {
      if(this.monitorSwitch === false) {
        return
      }
      this.monitorSwitch = false
      this.$nextTick(() => {
        this.monitorSwitch = true
      })
    },
    hex2str(hex) {
      _.each(hex, (h, index) => {
        if(h.indexOf('\\x') < 0) {
          return
        }
        let bytes = []
        let chs = h.split('\\x')

        _.each(chs, (str, index) => {
          var ascstr = ''
          if(str.length >= 2) {
            bytes.push(parseInt(str.substr(0,2), 16))
            ascstr = str.substr(2,str.length - 2)
          }else {
            if(index == 0){
              ascstr = str
            }else {
              ascstr = '\\x' + str
            }
          }
          for(var i = 0; i < ascstr.length; i++ ){
            bytes.push(ascstr.charCodeAt(i))
          }
        })
        var buff = Buffer.from(bytes)
        hex[index] = iconv.decode(buff, this.config.encoding)
      })
      return hex
    }
  }
  
}
</script>

<style scoped>
.tm-container{
  height:100%;
  width: 100%;
}
.st-container >>> .el-tabs__content{
  height: 100%;
}
.el-tab-pane{
  height: 100%;
}
.el-main{
  padding: 0 10px 0 10px;
}
</style>