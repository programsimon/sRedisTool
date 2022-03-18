<template>
  <el-tabs 
    class="ma-container"
    v-model="activeTab" 
    v-if="tabs && tabs.length > 0" 
    closable
    @tab-remove="onTabRemove">
    <el-tab-pane 
      style="height:100%"
      v-for="tab in tabs"
      :key="tab.id"
      :label="tab.name"
      :name="tab.id">
        <span slot="label">
          <i v-if="tab.type === 'edit'" class="el-icon-key"></i>
          <i v-if="tab.type === 'info'" class="el-icon-cpu"></i>
          <i v-if="tab.type === 'terminal'" class="el-icon-monitor"></i>
           {{tab.name}}</span>
        <editor-string
          v-if="tab.type === 'edit' && keyType === 'string'"
          @on-children-event="onChildrenEvent"
          :config="config"
          :redisId="redisId"
          :redisKey="key">
        </editor-string>
        <editor-list
          v-if="tab.type === 'edit' && keyType === 'list'"
          @on-children-event="onChildrenEvent"
          :config="config"
          :redisId="redisId"
          :redisKey="key">
        </editor-list>
        <editor-set
          v-if="tab.type === 'edit' && keyType === 'set'"
          @on-children-event="onChildrenEvent"
          :config="config"
          :redisId="redisId"
          :redisKey="key">
        </editor-set>
        <editor-hash
          v-if="tab.type === 'edit' && keyType === 'hash'"
          @on-children-event="onChildrenEvent"
          :config="config"
          :redisId="redisId"
          :redisKey="key">
        </editor-hash>
        <editor-zset
          v-if="tab.type === 'edit' && keyType === 'zset'"
          @on-children-event="onChildrenEvent"
          :config="config"
          :redisId="redisId"
          :redisKey="key">
        </editor-zset>
        <server-info
          v-if="tab.type === 'info'"
          @on-children-event="onChildrenEvent"
          :config="config"
          :redisId="redisId">
        </server-info>
        <terminal
          v-if="tab.type === 'terminal'"
          @on-children-event="onChildrenEvent"
          :config="config"
          :redisId="redisId">
        </terminal>
      </el-tab-pane>
  </el-tabs>
</template>

<script>
import RedisPool from 'm/RedisPool'

import EditorString from './EditorString'
import EditorList from './EditorList'
import EditorSet from './EditorSet'
import EditorHash from './EditorHash'
import EditorZset from './EditorZset'
import ServerInfo from './ServerInfo'
import Terminal from './Terminal.vue'

export default {
  name: 'MainArea',
  components: {
    EditorString,
    EditorList,
    EditorSet,
    EditorHash,
    EditorZset,
    ServerInfo,
    Terminal
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
  watch: {

  },
  data() {
    return {
      activeTab: '',
      tabs : [
        // {
        //   id: '',
        //   title: '',
        //   type: 'edit/terminal/info'
        // }
      ],
      key: '',
      keyType: ''
    }
  },
  mounted() {
    
  },
  methods: {
    onTabRemove(id) {
      let index = 0
      _.remove(this.tabs, (tab,ind) => {
        if(tab.id === id) {
          index = ind + 1
          return true
        }
      })
      if(index < 0 || index >= this.tabs.length) {
        if(this.tabs.length > 0) {
          this.activeTab = this.tabs[this.tabs.length - 1].id
        }
      }else {
        this.activeTab = this.tabs[index].id
      }
      this.$forceUpdate()
    },
    onEvent(eventData){
      if(!eventData){
        return
      }
      switch(eventData.name) {
        case 'onKeySelected':
          this.onKeySelected(eventData.key)
          break
        case 'onServerInfo':
          this.onServerInfo()
          break
        case 'onTerminal':
          this.onTerminal()
          break
      }
    },
    onChildrenEvent(eventData) {
      if(!eventData){
        return
      }
      switch(eventData.name){
        case 'onRenameKey':
          this.key = eventData.key
          this.showEditingKey()
          break
      }
    },
    onKeySelected(eventKey) {
      if(!eventKey || eventKey.lenth <= 0) {
        return
      }
      // get the key type
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.type(eventKey
      ).then(function (result) {
        switch(result){
          case 'string':
          case 'list':
          case 'set':
          case 'hash':
          case 'zset':
            that.key = eventKey
            that.keyType = result
            that.showEditingKey()
            break
          case 'none':
            that.$message.warning(that.$t('not exist key',{message:eventKey}))
            break
          default:
            that.$message.warning(that.$t('not surpported key type',{message:result}))
            break
        }
      });

    },
    showEditingKey() {
      // find the editing key view
      let tab = _.find(this.tabs, (t) => {
        return t.type === 'edit'
      })
      if(!tab) {
        tab = {
          id: this.$uuid(),
          name: this.key,
          type: 'edit'
        }
        this.tabs.push(tab)
      }else{
        tab.name = this.key
      }
      
      this.activeTab = tab.id
      return

    },
    onServerInfo() {
      // find the information view
      let tab = _.find(this.tabs, (t) => {
        return t.type === 'info'
      })
      if(!tab) {
        tab = {
          id: this.$uuid(),
          name: this.$t('Server information'),
          type: 'info'
        }
        this.tabs.push(tab)
      }
      
      this.activeTab = tab.id
      return
    },
    onTerminal() {
      // find the information view
      let tab = _.find(this.tabs, (t) => {
        return t.type === 'terminal'
      })
      if(!tab) {
        tab = {
          id: this.$uuid(),
          name: this.$t('Terminal'),
          type: 'terminal'
        }
        this.tabs.push(tab)
      }
      
      this.activeTab = tab.id
      return
    }
  }

}
</script>

<style scoped>
.ma-container{
  height:100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.ma-container >>> .el-tabs__content{
  flex-grow:1;
}
</style>