<template>
  <el-row>
    <el-col :span="8" style="text-align:left">
      <el-select v-model="curDatabase" :placeholder="$t('Select')" size="mini" width>
        <el-option
          v-for="n in databaseSize"
          :key="n-1"
          :label="n-1"
          :value="n-1">
        </el-option>
        <template slot="prefix">
          DB
        </template>
      </el-select>
    </el-col>
    <el-col :span="8" style="text-align:center">
      <span class="key-size">Keys:{{keySize}}</span>
    </el-col>
    <el-col :span="8" style="text-align:right">
      <el-tag v-if="statusShowType=='danger' || statusShowType == 'warning'" :type="statusShowType" effect="plain" size="mini" :hit="false" style="height:25px">{{curStatus}}</el-tag>
      <span v-else class="key-size">{{curStatus}}</span>
    </el-col>
  </el-row>
</template>

<script>
import RedisPool from 'm/RedisPool'

export default {
  name: 'KeyFooter',
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
  mounted() {

  },
  data() {
    return {
      curDatabase: -1,
      databaseSize: 0,
      keySize: 0,
      info: {},
      statusShowType: '',
      curStatus: 'connecting'
    }
  },
  watch: {
    curDatabase(val) {
      this.onDatabaseChanged()
    }
    
  },
  mounted() {
    this.onRedisReady()
  },
  methods: {
    onRedisReady() {
      this.curDatabase = this.config.defaultdatabase || 0
      var that = this
      var redis = RedisPool.getRedis(this.redisId)
      if(redis && redis.status == 'ready') {
        redis.config('get','databases'
        ).then(function (result) {
          if(result && result.length > 1) {
            that.databaseSize = parseInt(result[1])
          }
        });
        this.changeStatusType(redis.status)
      }
    },
    onRedisStatusEvent(eventData){
      this.changeStatusType(eventData.data.status)
    },
    changeStatusType(status) {
      this.curStatus = status
      switch(status){
        case 'ready':
          this.statusShowType = 'success'
          break
        case 'connect':
          this.statusShowType = ''
          break
        case 'error':
          this.statusShowType = 'danger'
          break
        case 'close':
          this.statusShowType = 'warning'
          break
        case 'reconnecting':
          this.statusShowType = ''
          break
        case 'end':
          this.statusShowType = 'warning'
          break
        case 'wait':
          this.statusShowType = 'info'
          break
      }
    },
    onEvent(eventData){
      if(!eventData){
        return
      }
      switch(eventData.name) {
        case 'redisStatus':
          this.onRedisStatusEvent(eventData)
          break;
        case 'redisInitialized':
          this.onRedisReady()
          break
        case 'refreshInfo':
          this.onDatabaseChanged()
          break
      }
    },
    onDatabaseChanged() {
      var that = this
      var redis = RedisPool.getRedis(this.redisId)
      if(!redis){
        return
      }
      if(this.curDatabase >= this.databaseSize) {
        this.curDatabase = 0
      }
      redis.select(this.curDatabase)
      this.keySize = 0
      let nodes = []
      if(redis.isCluster) {
        nodes = redis.nodes('master')
      }else{
        nodes.push(redis)
      }
      _.each(nodes, (node) => {
        node.info().then(function(result){
          that.info = RedisPool.formatInfo(result)
          let dbname = 'db' + that.curDatabase
          let dbParam = that.info.Keyspace[dbname]
          if(dbParam){
            that.keySize += parseInt(dbParam.keys, 10) || 0
          }
        })
      })
    }
  }
  
}
</script>

<style scoped>
.el-select--mini{
  width: 80px
}
.key-size{
  font-family:"Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  font-size: 12px;
  height: 100%;
}
</style>