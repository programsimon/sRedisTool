<template>
  <el-container>
    <el-header height="40">
      <HeaderBar ref="headerBar"
        @conn-activated="onConnectionActived"
        @conn-closed="onConnectionClosed"></HeaderBar>
    </el-header>
    <el-main>
        <Connection ref="connections" v-for="connection in connections" 
            :key="connection.id" 
            :config="connection.config" 
            :activated="connection.activated"
            :id="connection.id"
            v-show="connection.activated"/>
        <Welcome v-if="!connections || connections.length <=0" class="main-area"/>
    </el-main>
  </el-container>
</template>

<script>
import HeaderBar from 'v/HeaderBar'
import Welcome from 'v/Welcome'
import Connection from 'c/Connection'

import bridge from 'm/ElectronBridge'
import eventBus from 'm/EventBus'

export default {
  name: 'Home',
  components: {
    HeaderBar,
    Welcome,
    Connection
  },
  data() {
    return {
      connections: [],
      id: ''
    }
  },
  mounted() {
    // regitster event from main process
    bridge.registerEvent('changeLanguage', this.languageChanged)

    // register event from other componets
    eventBus.$on('addConnection', config => {
      this.addConnection(config)
    })
    
    this.$i18n.locale = bridge.getConfig('language')
  },
  methods: {
    languageChanged(languageCode) {
      this.$i18n.locale = languageCode
    },
    addConnection(config) {
      if(!config) {
        return
      }
      var connection = {
        config: config,
        activated: false,
        id: this.$uuid(),
        name: config.name
      }
      this.connections.push(connection)
      this.$refs.headerBar.addConnection(connection);
    },
    onConnectionActived(conntionId) {
      if(!conntionId) {
        return
      }
      _.each(this.connections, (connection) => {
        if(connection.id === conntionId) {
          connection.activated = true
        }else {
          connection.activated = false
        }
      })
    },
    onConnectionClosed(connectionId) {
      this.connections = this.connections.filter( (connection) => {
        return !(connection.id === connectionId)
      })
    }
  }
}
</script>

<style scoped>
.el-container{
    padding: 0px;
    margin: 0px;
    height: 100%;
}
.main-area{
  width: 100%;
  height: 100%
}
.el-main{
  padding: 0px 10px
}
</style>
