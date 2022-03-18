<template>
  <el-container class="tc-container">
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
        <el-form-item :label="$t('Encoding')">
          <encoding-select 
            v-model="encodingSelected">
          </encoding-select>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
      <div id="xterm-command" style="width:100%;height:95%">
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
import splitargs from 'redis-splitargs'
import EncodingSelect from 'c/EncodingSelect'

export default {
  name: 'TerminalCommand',
  components: {
    EncodingSelect
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
      xterm: null,
      fitAddon: null,
      encodingSelected: '',
      commandHist: [],
      commandHistIndex: -1
    }
  },
  watch: {
  },
  mounted() {
    this.encodingSelected = this.config.encoding
    this.$nextTick(() => {
      this.initServerList()
      this.initTerminal()
    })
  },
  beforeDestroy() {
    // this.stopMonitor()
  },
  methods: {
    initServerList() {
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      if(redis.isCluster){
        let nodes = redis.nodes('master')  
        _.each(nodes, (node) => {
          this.servers.push({
            key: node.options.host + ":" + node.options.port,
            name: node.options.host + ":" + node.options.port + " (master)"
          })
        })
        nodes = redis.nodes('slave')  
        _.each(nodes, (node) => {
          this.servers.push({
            key: node.options.host + ":" + node.options.port,
            name: node.options.host + ":" + node.options.port + " (slave)"
          })
        })
        if(this.servers.length > 0) {
          this.curServer = this.servers[0].key
        }
        let curNode = this.getClusterNode(redis, this.curServer)
        if(curNode) {
          return curNode.info()
        }

      }else {
        this.servers.push({
          key: redis.options.host + ":" + redis.options.port,
          name: redis.options.host + ":" + redis.options.port + " (master)"
        })
        this.curServer = redis.options.host + ":" + redis.options.port
        return redis.info()
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
        let xtermDom = document.getElementById('xterm-command')
        this.xterm.open(xtermDom)
        this.fitAddon.fit()
        this.runTerminal()
    },
    runTerminal() {
      if (this.xterm._initialized) {
        return
      }

      this.xterm._initialized = true;

      this.xterm.prompt = () => {
        this.xterm.write('\r\n' + this.curServer +'> ');
      }
      this.xterm.promptLength = () => {
        return this.curServer.length + 2
      }
      this.xterm.message = (m) => {
        if(m){
          this.writeMessage(m,0)
        }else {
          this.xterm.writeln('')
        }
        this.xterm.prompt()
      }
      this.xterm.backToLineHead = () => {
        this.xterm.write(_.repeat('\b \b', this.xterm._core.buffer.x - this.xterm.promptLength()))
      }

      this.xterm.onKey(this.onKeyInput)
      this.xterm.onLineFeed( () => {
        this.commandHistIndex = -1
      })
      this.xterm.prompt()

    },
    writeMessage(message, tabCnt) {
      let that = this
      if(Array.isArray(message)) {
        tabCnt++
        _.each(message, (m) => {
          that.writeMessage(m, tabCnt)
        })
      }else {
        tabCnt--
        this.xterm.writeln('')
        this.xterm.write(_.repeat('  ',tabCnt))
        if(Buffer.isBuffer(message)){
          this.xterm.write(iconv.decode(message, this.encodingSelected))
        }else{
          this.xterm.write(message)
        }
      }
    },
    onKeyInput(key) {
      if(!key) {
        return
      }
      switch(key.domEvent.key) {
        case 'Enter':
          this.execCommand()
          break
        case 'c':
        case 'C':
          if(key.domEvent.ctrlKey){
            this.doCopy()
          }else{
            this.xterm.write(key.key)
          }
          break
        case 'Escape':
          this.xterm.backToLineHead()
          break
        case 'Backspace':
          // Do not delete the prompt
          if (this.xterm._core.buffer.x > this.xterm.promptLength()) {
            this.xterm.write('\b \b')
          }
          break
        case 'Delete':
          // Do not delete the prompt
          if (this.xterm._core.buffer.x > this.xterm.promptLength()) {
            this.xterm.write('[C')
            this.xterm.write('\b \b')
          }
          break
        case 'ArrowUp':
          this.commandHistIndex ++
          if(this.commandHistIndex >= this.commandHist.length) {
            this.commandHistIndex = this.commandHist.length - 1
          }
          if(this.commandHistIndex >= 0) {
            console.log(this.commandHist[this.commandHistIndex])
            this.xterm.backToLineHead()
            this.xterm.write(this.commandHist[this.commandHistIndex])
          }
          break
        case 'ArrowDown':
          this.commandHistIndex --
          if(this.commandHistIndex < 0) {
            this.commandHistIndex = - 1
          }
          if(this.commandHistIndex >= 0) {
            this.xterm.backToLineHead()
            this.xterm.write(this.commandHist[this.commandHistIndex])
          }
          break
        case 'ArrowLeft':
          if (this.xterm._core.buffer.x > this.xterm.promptLength()) {
            this.xterm.write(key.key)
          }
          break
        case 'v':
        case 'V':
          if(key.domEvent.ctrlKey){
            navigator.clipboard.readText()
            .then((c) => {
              this.xterm.write(c)
            })
          }else{
            this.xterm.write(key.key)
          }
          break
        default:
          this.xterm.write(key.key)
      }
    },
    execCommand() {
      let curBuffer = this.xterm.buffer.active
      let cmdLine = curBuffer.getLine(curBuffer.baseY + curBuffer.cursorY)
      if(!cmdLine) {
        return
      }
      cmdLine = cmdLine.translateToString()
      // delete the prompt
      let idx = cmdLine.indexOf('>')
      if( idx >= 0) {
        cmdLine = cmdLine.substr(idx + 1)
      }
      cmdLine = cmdLine.trim()

      let command = splitargs(cmdLine)
      if(!command) {
        return
      }
      this.commandHist.unshift(cmdLine)

      let commandName = command.shift()
      if(['SUBSCRIBE', 'PSUBSCRIBE','MONITOR'].indexOf(commandName.toUpperCase()) !== -1) {
        this.xterm.message('Not surpported command in sRedisTool!')
        return
      }else if('CLEAR'.indexOf(commandName.toUpperCase()) !== -1) {
        this.xterm.clear()
        return
      }
      let commandBuffer = _.map(command, (param) => {
        return iconv.encode(param, this.encodingSelected)
      })

      let redis = RedisPool.getRedis(this.redisId)

      let node = redis
      if(redis.isCluster) {
        node = this.getClusterNode(redis, this.curServer)
      }
      if(!node) {
        return
      }
      node.callBuffer(commandName,commandBuffer)
      .then((result) => {
        console.log(result)
        this.xterm.message(result)
      })
      .catch((error, e) => {
        this.xterm.message(error.message)
      })

    },
    doCopy() {
      if(this.xterm.hasSelection()) {
        let cptxt = this.xterm.getSelection()
        if(cptxt) {
          this.$copyText(this.xterm.getSelection())
        }
      }else {
        this.xterm.prompt()
      }
    },
    getClusterNode(redis, key) {
      let node = _.find(redis.nodes('all'), (n) =>{
        return key === n.options.host + ":" + n.options.port
      })
      return node
    },
    onServerChange(val) {
      this.xterm.prompt()
      this.xterm.clear()
    }
  }
  
}
</script>

<style scoped>
.tc-container{
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