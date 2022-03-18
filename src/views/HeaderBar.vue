<template>
  <div>
    <el-row>
      <el-col :span="21">
        <el-tabs 
          v-model="activeTab" 
          v-if="tabs && tabs.length > 0" 
          closable 
          @tab-remove="onConnectionClose">
          <el-tab-pane 
            v-for="tab in tabs"
            :key="tab.id"
            :label="tab.name"
            :name="tab.id">
            </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="3" style="text-align:right">
        <el-button-group>
          <el-tooltip effect="light" :content="$t('Open Server')" placement="bottom">
            <el-button :plain="true" type="info" size="mini" icon="el-icon-folder-opened" @click="openRedisServer"></el-button>
          </el-tooltip>
          <el-tooltip effect="light" :content="$t('Settings')" placement="bottom">
            <el-button :plain="true" type="info" size="mini" icon="el-icon-setting" @click="settings"></el-button>
          </el-tooltip>
        </el-button-group>
      </el-col>
    </el-row>
    <Settings></Settings>
    <template>
      <open-server></open-server>
    </template>
  </div>
  
</template>

<script>
import eventBus from 'm/EventBus'
import Settings from  'v/Settings'
import OpenServer from 'v/OpenServer'

export default {
  name: 'HeaderBar',
  components: {
    Settings,
    OpenServer
  },
  props: {
  },
  data() {
    return {
      activeTab: '',
      tabs: []
    }
  },
  watch: {
    activeTab(val) {
      this.$emit('conn-activated', val);
    }
  },
  methods: {
    openRedisServer() {
      eventBus.$emit('openServer')
    },
    settings() {
      eventBus.$emit('showSettings')
    },
    addConnection(conn) {
      this.tabs.push(conn)
      this.activeTab = conn.id
    },
    onConnectionClose(connectionId) {
      let tabs = this.tabs;
      let activeId = this.activeTab;
      if (activeId === connectionId) {
        tabs.forEach((tab, index) => {
          if (tab.id === connectionId) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeId = nextTab.id;
            }
          }
        });
      }
      
      this.activeTab = activeId;
      this.tabs = tabs.filter(tab => tab.id !== connectionId);

      this.$emit('conn-closed', connectionId)
    }
  }
}
</script>

<style scoped>
.el-col {
  min-height: 1px
}
</style>