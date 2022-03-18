<template>
  <div ref="container" class="container" v-loading="loading">
    <el-row>
      <el-col :span="24">
        <el-autocomplete
          v-model="searchKeyParam.patterns"
          size="mini" 
          @keyup.enter.native="loadKeys" 
          :placeholder="$t('search patterns')"
          :fetch-suggestions="querySearch"
          @select="loadKeys"
        >
          <el-tooltip slot="append" effect="light" :content="$t('Refresh')" placement="bottom">
            <el-button :plain="true" type="info" size="mini" icon="el-icon-refresh-right" @click="loadKeys"></el-button>
          </el-tooltip>
          <el-tooltip slot="append" effect="light" :content="$t('Add Key')" placement="bottom">
            <el-button :plain="true" type="info" size="mini" icon="el-icon-plus" @click="addKey"></el-button>
          </el-tooltip>
          <el-tooltip slot="append" effect="light" :content="$t('Server information')" placement="bottom">
            <el-button :plain="true" type="info" size="mini" icon="el-icon-cpu" @click="serverInfo"></el-button>
          </el-tooltip>
          <el-tooltip slot="append" effect="light" :content="$t('Terminal')" placement="bottom">
            <el-button :plain="true" type="info" size="mini" icon="el-icon-monitor" @click="terminal"></el-button>
          </el-tooltip>
        </el-autocomplete>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-collapse>
          <template v-for="(group,index) in keys" >
            <el-collapse-item v-if="group.type == 'group'" :key="'_g_' + index">
              <template slot="title">
                <el-link icon="el-icon-files" class="key-item" :underline="false">{{group.name}}  ({{group.keys.length}})</el-link>
              </template>
              <el-link v-for="key in group.keys" :key="key" icon="el-icon-key" class="key-item" :underline="false" @click="onKeySelected(key)">{{key}}</el-link>
            </el-collapse-item>
            <el-link v-else :key="'_kg_' + index" icon="el-icon-key" class="key-item" :underline="false" @click="onKeySelected(group.keys)">{{group.keys}}</el-link>
          </template>
        </el-collapse>
      </el-col>
    </el-row>
    <el-row v-if="searchKeyParam.scanStream !== null">
      <el-col :span="24">
        <el-link :underline="false" class="load-more" @click="loadKeys(true)">{{$t('Load more')}}</el-link>
      </el-col>
    </el-row>
    <el-backtop target=".container" :right="backtopRight"></el-backtop>
    <add-key :visible.sync="addKeyVis"/>
  </div>
</template>

<script>
import AddKey from './AddKey'
import RedisPool from 'm/RedisPool'

export default {
  name: 'KeyList',
  components: {
    AddKey
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
      backtopRight: 40,
      addKeyVis: false,
      searchKeyParam: {
        patterns: '*',
        scanStream:  null,
        curBatchCount: 0,
        nodeIndex: -1
      },
      keys: [],
      splitstrs: null,
      loading: false,
      searchedPatterns: []
    }
  },
  watch: {
  },
  mounted() {
    this.calcBackTopRight()
  },
  methods: {
    onRedisReady() {
      this.loadKeys()
    },
    onEvent(eventData){
      if(!eventData){
        return
      }
      switch(eventData.name) {
        case 'redisInitialized':
          this.onRedisReady()
          break
        case 'clientAreaChanged':
          this.calcBackTopRight()
          break
      }
    },
    onKeySelected(key) {
      // send event to parent
      this.$emit('on-children-event', {
        name: 'onKeySelected',
        key: key
      })
    },
    calcBackTopRight(){
      if(this.$refs.container){
        this.backtopRight = document.body.clientWidth - this.$refs.container.clientWidth
      }
    },
    loadKeys(isMore) {
      if(isMore !== true){
        this.searchKeyParam.scanStream = null
        this.searchKeyParam.nodeIndex = -1
        this.keys = []
        this.refreshInfo()
      }
      this.searchKeyParam.curBatchCount = 0
      this.scanKeys()
      this.addSearchHist()
    },
    scanKeys(){
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis){
        return
      }
      this.loading = true
      let that = this
      let nodes = []
      if(redis.isCluster) {
        nodes = redis.nodes('master')
      }else{
        nodes.push(redis)
      }
      if(this.searchKeyParam.nodeIndex === -1) {
        this.searchKeyParam.nodeIndex = 0
      }

      if(this.searchKeyParam.scanStream === null) {
        this.startScan(nodes)
      }else{
        this.searchKeyParam.scanStream.resume()
      }
    },
    startScan(nodes){
      let node = nodes[this.searchKeyParam.nodeIndex]
      let that = this
      this.searchKeyParam.scanStream = node.scanStream({
        match: this.searchKeyParam.patterns || '*'
      })
      this.searchKeyParam.scanStream.on('data', (resultKeys) => {
        that.addKeysToList(resultKeys)
        that.searchKeyParam.curBatchCount += resultKeys.length

        if(that.searchKeyParam.curBatchCount >= that.config.maxloadkeysize) {
            this.searchKeyParam.scanStream.pause()
            that.loading = false
            that.sortKeys()
        }
      })

      this.searchKeyParam.scanStream.on('end', () => {
        that.searchKeyParam.nodeIndex++
        if(that.searchKeyParam.nodeIndex >= nodes.length) {
          that.loading = false
          that.searchKeyParam.scanStream = null
          that.sortKeys()
        }else{
          that.startScan(nodes)
        }
      })
    },
    addKeysToList(keys) {
      if(!keys || keys.length <= 0) {
        return
      }
      if(this.config.groupshow === true && this.isValidGroupConfig()){
        _.each(keys, (key) => {
          let groupName = this.getKeyGroupName(key)
          if(!groupName) {
            let group = {
              name: key,
              type: 'key',
              keys: key
            }
            this.keys.push(group)
            return
          }
          let group = this.keys.find((g) => {
            if(g.name === groupName && g.type === 'group'){
              return true
            }
          })
          if(group){
            group.keys.push(key)
          }else{
            group = {
              name: groupName,
              type: 'group',
              keys: [key]
            }
            this.keys.push(group)
          }
        })
      }else {
        _.each(keys, (key) => {
          this.keys.push({
            name: key,
            type: 'key',
            keys: key
          })
        })
      }
    },
    sortKeys() {
      if(!this.config.sort){
        return
      }
      this.keys = _.sortBy(this.keys, function(key) {
        if(key.type === 'group'){
          key.keys = _.sortBy(key.keys,function(k) {
            return k
          })
        }
        return key.name;
      })
    },
    isValidGroupConfig(){
      if(this.config.grouptype === 'split') {
        if(this.config.splitstr 
            && this.config.splitstr.length > 0){
          return true
        }else {
          return false
        }
      }else if(this.config.grouptype === 'substr') {
        if(this.config.substrsize 
            && this.config.substrsize > 0 
            && this.config.substrsize <= 100){
          return true
        }
        else {
          return false
        }
      }
      else {
        return false
      }
    },
    getKeyGroupName(key) {
      if(this.config.grouptype === 'substr'){
        if(key.length <= this.config.substrsize)
          return
        return key.substr(0,this.config.substrsize)
      }else{
        // init it
        if(this.splitstrs === null) {
          this.getSplitStrList(this.config.splitstr)
        }
        if(this.splitstrs.length <= 0) {
          return
        }
        let name = null
        _.each(this.splitstrs, (splitstr) => {
          let gp = key.split(splitstr)
          if(gp && gp.length > 1) {
            name = gp[0]
            return false
          }
        })
        return name
      }
    },
    getSplitStrList(splitstr) {
      let strs = []
      let length = splitstr.length
      let tmpstr = ''
      for(var i = 0; i< length; i++) {
        let ch = splitstr.charAt(i)
        if(ch === ';' 
          && (i + 1) < length
          && splitstr.charAt(i + 1) === ';') {
            tmpstr = tmpstr + ch
            i++
            continue
        }else if(ch !== ';') {
          tmpstr = tmpstr + ch
          continue
        }else if(ch === ';') {
          if(tmpstr.length > 0) {
            strs.push(tmpstr)
            tmpstr = ''
          }
        }
      }
      if(tmpstr.length > 0){
        strs.push(tmpstr)
      }
      this.splitstrs = strs
    },
    addKey() {
      this.addKeyVis = true
    },
    getRedisInstance() {
      let redis = RedisPool.getRedis(this.redisId)
      if(redis && redis.status === 'ready'){
        return redis
      }else {
        return null
      }
    },
    addSearchHist() {
      if(!this.searchKeyParam.patterns || this.searchKeyParam.patterns.length <= 0) {
        return
      }
      let hist = _.remove(this.searchedPatterns, (p) => {
        return this.searchKeyParam.patterns === p.value
      })
      
      this.searchedPatterns.unshift({value: this.searchKeyParam.patterns})
      if(this.searchedPatterns.length > 10){
        this.searchedPatterns.pop()
      }
    },
    querySearch(queryString, cb) {
      var patterns = this.searchedPatterns
      var results = queryString ? patterns.filter(this.createFilter(queryString)) : patterns;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (pattern) => {
        return (pattern.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    serverInfo(){
      // send event to parent
      this.$emit('on-children-event', {
        name: 'onServerInfo'
      })
    },
    refreshInfo() {
      // send event to parent
      this.$emit('on-children-event', {
        name: 'refreshInfo'
      })
    },
    terminal() {
      // send event to parent
      this.$emit('on-children-event', {
        name: 'onTerminal'
      })
    }
  }
}
</script>

<style scoped>
.el-autocomplete{
  width: 100%;
}
.key-item{
  width: 100%;
  justify-content: start;
  height: 30px
}
.load-more{
  width: 100%;
}
.container{
  height:100%;
  width: 100%;
  overflow-x:hidden;
}
.el-collapse-item >>> .el-collapse-item__header{
  border-bottom: 0px;
  height: 30px;
}
.el-collapse {
  border-bottom: 0px;
  border-top: 0px;
}
</style>