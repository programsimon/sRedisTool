<template>
  <el-container class="ii-container">
    <el-header>
      <el-form inline>
        <el-form-item :label="$t('Servers')">
          <el-select v-model="curServer">
            <el-option 
              v-for="server in servers"
              :key="server.key"
              :label="server.name"
              :value="server.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Auto refresh')">
          <el-switch
            v-model="autoRefresh">
          </el-switch>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
      <el-table 
        :data="cusrServerInfo"
        row-key="name"
        border
        stripe
        highlight-current-row
        :tree-props="{children: 'subItem'}"
        :show-header="false">
        <el-table-column prop="name"></el-table-column>
        <el-table-column prop="showValue"></el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
import RedisPool from 'm/RedisPool'

export default {
  name: 'InfoInfo',
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
      autoRefresh: false,
      cusrServerInfo: [],
      refreshTimer: null
    }
  },
  mounted() {
    this.$nextTick( function() {
      this.init()
    })
  },
  beforeDestroy() {
    this.shutDownTimer()
  },
  watch: {
    autoRefresh(val) {
      if(!val) {
        this.shutDownTimer()
        return
      }
      this.refreshTimer = setTimeout(this.refresh, 5000)
    },
    curServer(val) {
      if(!val) {
        this.shutDownTimer()
        return
      }
      this.refresh()
   }
  },
  methods: {
    init() {

      this.initServerList()
       .then(this.loadCurServerInfo)
       .catch( (error) => {
        that.$message.error(that.$t('Get server info failed', error))
       })
      
    },
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
    loadCurServerInfo(result) {
      
      this.cusrServerInfo =  []
      _.each(RedisPool.formatInfo(result), (i, key) => {
        let item = {
          name: key,
          subItem: [],
          showValue: ''
        }
        _.each(i, (si, skey) => {
          let subitem = {
            name : skey,
            value: si,
            showValue: typeof si === 'string' ? si : si.rawValue
          }
          item.subItem.push(subitem)
        })
        this.cusrServerInfo.push(item)
      })
      if(this.refreshTimer !== null) {
        this.refreshTimer = setTimeout(this.refresh, 5000)
      }
    },
    refresh() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      let node = redis
      if(redis.isCluster) {
        node = this.getClusterNode(redis, this.curServer)
      }
      node.info()
      .then(this.loadCurServerInfo)
      .catch( (error) => {
        that.shutDownTimer()
        that.$message.error(that.$t('Get server info failed', error))
       })
    },
    shutDownTimer() {
      if(this.refreshTimer !== null){
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null
      }
    },
    getClusterNode(redis, key) {
      let node = _.find(redis.nodes('all'), (n) =>{
        return key === n.options.host + ":" + n.options.port
      })
      return node
    }
  }
  
}
</script>

<style scoped>
.ii-container{
  height:100%;
  width: 100%;
}
.el-header{
  padding: 0 0 0 5px;
  margin-bottom: 5px;
}
.el-main{
  padding: 0 0 0 5px;
}
</style>