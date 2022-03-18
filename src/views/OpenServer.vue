<template>
  <el-dialog :title="$t('Open Server')" :visible.sync="visible">
    <el-tree
      ref="serverTree"
      :data="serverGroups"
      node-key="id"
      :props="treeProps"
      :highlight-current="true"
      style="height: 50vh;overflow: auto;">
      <div slot-scope="{ node, data }" style="width: 100%;" @dblclick="onOpenServer(data.id)">
        <i v-if="node.level == 1" class="el-icon-folder node_icon"></i>
        <i v-else class="el-icon-connection node_icon"></i>
        <span style="vertical-align: middle;">{{data.name}}</span>
        <el-button-group v-if="node.level != 1" class="server-button">
          <el-tooltip effect="light" :content="$t('Edit Server')" placement="bottom">
            <el-button :plain="true" size="mini" icon="el-icon-edit" @click="onEditServer(data.id)"/>
          </el-tooltip>
          <el-tooltip effect="light" :content="$t('Open Server')" placement="bottom">
            <el-button :plain="true" size="mini" icon="el-icon-folder-opened" @click="onOpenServer(data.id)"/>
          </el-tooltip>
        </el-button-group>
      </div>
    </el-tree>
    <span slot="footer">
      <el-button @click="visible = false">{{$t('Cancel')}}</el-button>
      <el-button type="primary" @click="onConfirm">{{$t('Confirm')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import bridge from 'm/ElectronBridge'
import eventBus from 'm/EventBus'

export default {
  name: 'OpenServer',
  data() {
    return {
      visible: false,
      serverGroups: [],
      treeProps: {
        children: 'servers'
      },
      iconClass: 'el-icon-folder node_icon'
    }
  },
  mounted() {
    // register event from other componets
    eventBus.$on('openServer', param => {
      this.showServers()
    })
  },
  methods: {
    showServers() {
      let groups = bridge.getConfig('servergroups');
      if(!_.isEqual(this.serverGroups, groups)){
        this.serverGroups = groups
      }
      this.visible = true
    },
    onConfirm(){
      var server = this.findServer(this.$refs.serverTree.getCurrentKey())
      if(!server){
        this.$message.error(this.$t('select server'))
        return
      }
      eventBus.$emit('addConnection',server)
      this.visible = false
    },
    onOpenServer(serverId) {
      var server = this.findServer(serverId)
      if(server) {
        eventBus.$emit('addConnection',server)
        this.visible = false
      }
    },
    onEditServer(serverId) {
      eventBus.$emit('editServer',serverId)
      this.visible = false
    },
    findServer(serverId, group) {
      if(!serverId){
        return null
      }
      var server = null
      if(group) {
        server = group.servers.find((s) => {
          if(s.id === serverId){
            return true
          }
        })
      }
      if(server) {
        return server
      }
      _.each(this.serverGroups, (group, index) => {
        server = group.servers.find((s) => {
          if(s.id == serverId) {
            return true
          }
        })
        if(server) {
          return false
        }
      })
      return server
    }
  }

}
</script>
<style scoped>
.node_icon{
  padding-right: 5px;
  vertical-align: middle;
}
.el-tree >>>.el-tree-node__content{
  height: 43px !important;
}
.server-button{
  float:right;
}
</style>