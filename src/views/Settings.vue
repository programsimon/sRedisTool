<template>
  <el-drawer
    :title="$t('Settings')"
    :visible.sync="visuable"
    direction="btt"
    :with-header="true"
    size="70%"
  >
    <el-tabs class="main_area" v-model="activeTab" >
      <el-tab-pane 
        :label="$t('Application Settings')"
        name="appSettings">
        <app-settings></app-settings>
      </el-tab-pane>
      <el-tab-pane 
        :label="$t('Redis Servers Settings')"
        name="servers">
        <server-setting ref="servers"/>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script>
import eventBus from 'm/EventBus'
import AppSettings from 'v/AppSettings'
import ServerSetting from 'v/ServerSetting'

export default {
  components: { AppSettings, ServerSetting },
  name: 'Settings',
  componentName: 'Settings',
  data () {
    return {
      visuable: false,
      activeTab: ''
    }
  },
  mounted() {
    // register event from other componets
    eventBus.$on('showSettings', param => {
      this.showSettings()
    })
    eventBus.$on('editServer', param => {
      this.editServer(param)
    })
  },
  methods: {
    showSettings() {
      this.activeTab = 'appSettings'
      this.visuable = true
    },
    editServer(serverId) {
      this.activeTab = 'servers'
      
      // this.$refs.servers.onEditServer(serverId)
      this.visuable = true
      this.$nextTick(() => {
        this.$refs.servers.onEditServer(serverId)
      })
    }
  }
}
</script>

<style scoped>
.main_area{
  width: 100%;
  height: 100%;
  padding-left: 20px;
  padding-right: 20px;
}
.el-tab-pane{
  height: 100%;
}
</style>>
