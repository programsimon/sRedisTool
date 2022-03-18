<template>
  <el-container class="ic-container">
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
        <el-form-item >
          <el-button @click="onRefresh">{{$t('Refresh')}}</el-button>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
      <el-table 
        :data="cusrServerConfig"
        row-key="name"
        border
        stripe
        highlight-current-row
        :tree-props="{children: 'subItem'}"
        :show-header="true">
        <el-table-column sortable :label="$t('Config name')" prop="name"></el-table-column>
        <el-table-column sortable :label="$t('Config value')" prop="value"></el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
import RedisPool from 'm/RedisPool'

export default {
  name: 'InfoConfig',
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
      cusrServerConfig: [],
    }
  },
  watch: {
    curServer(val) {
      if(!val) {
        return
      }
      this.onRefresh()
   }
  },
  mounted() {
    this.$nextTick( function() {
      this.init()
    })
  },
  beforeDestroy() {
  },
  methods: {
    init() {
      this.initServerList()
       .then(this.loadCurServerConfig)
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
          return curNode.config('get','*')
        }

      }else {
        this.servers.push({
          key: redis.options.host + ":" + redis.options.port,
          name: redis.options.host + ":" + redis.options.port + " (master)"
        })
        this.curServer = redis.options.host + ":" + redis.options.port
        return redis.config('get','*')
      }
    },
    loadCurServerConfig(result) {
      this.cusrServerConfig =  RedisPool.formatConfig(result)
    },
    onRefresh() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      let node = redis
      if(redis.isCluster) {
        node = this.getClusterNode(redis, this.curServer)
      }
      node.config('get','*')
      .then(this.loadCurServerConfig)
      .catch( (error) => {
        that.$message.error(that.$t('Get server info failed', error))
       })
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
.ic-container{
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