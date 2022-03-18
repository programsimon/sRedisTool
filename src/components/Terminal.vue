<template>
  <el-tabs 
    class="st-container"
    tab-position="top"
    v-model="activeTab"
    stretch
    @tab-click="onTabSwitched"
    >
    <el-tab-pane 
      name="terminal">
      <span slot="label">
          <i class="el-icon-monitor"></i>
          {{$t('Terminal')}}
      </span>
      <terminal-command
        :config="config"
        :redisId="redisId">
      </terminal-command>
    </el-tab-pane>
    <el-tab-pane 
      name="monitor">
      <span slot="label">
          <i class="el-icon-headset"></i>
          {{$t('Command monitor')}}
      </span>
      <terminal-cmd-mon
        :config="config"
        :redisId="redisId">
      </terminal-cmd-mon>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import TerminalCmdMon from './TerminalCmdMon.vue'
import TerminalCommand from './TerminalCommand.vue'

export default {
  name: 'ServerInfo',
  components: {
    TerminalCmdMon,
    TerminalCommand
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
     activeTab: 'terminal'
    }
  },
  watch: {
    
  },
  mounted() {
   
  },
  methods: {
    onTabSwitched(tab) {
      if(!tab) {
        return
      }
      _.each(tab.$children, (child) => {
        if(child.onSelected) {
          child.onSelected()
        }
      })
      
    }
  }
  
}
</script>

<style scoped>
.st-container{
  height:100%;
  width: 100%;
}
.st-container >>> .el-tabs__content{
  height: 100%;
}
.el-tab-pane{
  height: 100%;
}
</style>