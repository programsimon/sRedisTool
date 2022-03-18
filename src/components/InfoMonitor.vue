<template>
  <el-container class="ics-container">
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
      <el-collapse accordion>
        <el-collapse-item
          v-for="(host, name) in cusrServerClients"
          :key="name">
          <template slot="title">
            {{name + ' (' + host.length + ')'}}
          </template>
          <el-table 
            :data="host"
            row-key="addr"
            stripe
            size="mini"
            highlight-current-row
            :show-header="true">
            <el-table-column :label="$t('Address')" prop="addr"></el-table-column>
            <el-table-column :label="$t('Idle span')" prop="idle"></el-table-column>
            <el-table-column :label="$t('Connect span')" prop="age"></el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-main>
  </el-container>
</template>

<script>
import RedisPool from 'm/RedisPool'

export default {
  name: 'InfoMonitor',
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
      cusrServerClients: [],
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
      this.onRefresh()
   }
  },
  methods: {
    init() {
      this.initServerList()
       .then(this.loadCurServerClients)
       .catch( (error) => {
        that.$message.error(that.$t('Get server info failed', error))
       })
      
    },
    initServerList(info) {
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
          return curNode.client('list')
        }

      }else {
        this.servers.push({
          key: redis.options.host + ":" + redis.options.port,
          name: redis.options.host + ":" + redis.options.port + " (master)"
        })
        this.curServer = redis.options.host + ":" + redis.options.port
        return redis.client('list')
      }
    },
    loadCurServerClients(result) {
      this.cusrServerClients =  []
      this.cusrServerClients = _.groupBy(RedisPool.formatClients(result), (client) => {
        return client.host
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
      node.client('list')
      .then(this.loadCurServerClients)
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
.ics-container{
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