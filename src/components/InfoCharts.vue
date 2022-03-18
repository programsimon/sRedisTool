<template>
  <el-container class="im-container">
    <el-header>
      <el-carousel height="190px" :interval="10000">
        <el-carousel-item v-for="server in servers" :key="server.key">
          <el-row style="height:40px">
            <el-col :span="24" class="info-card-header">
              <span>{{ server.name }}</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-card shadow="always" class="info-card">
                <div slot="header">
                  <span>{{$t('Memory Usage') + '(Mb)'}}</span>
                </div>
                {{ server.lastSummary ? server.lastSummary.used_memory : 'N/A'}}
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="always" class="info-card">
                <div slot="header">
                  <span>{{$t('Key Size')}}</span>
                </div>
                {{ server.lastSummary ? server.lastSummary.keys : 'N/A'}}
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="always" class="info-card">
                <div slot="header">
                  <span>{{$t('Clients')}}</span>
                </div>
                {{ server.lastSummary ? server.lastSummary.clients : 'N/A'}}
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="always" class="info-card">
                <div slot="header">
                  <span>{{$t('Uptime in days')}}</span>
                </div>
                {{ server.lastSummary ? server.lastSummary.uptime_in_days : 'N/A'}}
              </el-card>
            </el-col>
          </el-row>
        </el-carousel-item>
      </el-carousel>
    </el-header>
    <el-main>
      <el-row class="chart-row">
        <el-col :span="24" style="height:100%">
          <div class="chart-area" ref="chartMem"/>
        </el-col>
      </el-row>
      <el-row class="chart-row">
        <el-col :span="24" style="height:100%">
          <div class="chart-area" ref="chartCpu"/>
        </el-col>
      </el-row>
      <el-row class="chart-row">
        <el-col :span="24" style="height:100%">
          <div class="chart-area" ref="chartClients"/>
        </el-col>
      </el-row>
      <el-row class="chart-row">
        <el-col :span="24" style="height:100%">
          <div class="chart-area" ref="chartKeys"/>
        </el-col>
      </el-row>
      <el-row class="chart-row">
        <el-col :span="24" style="height:100%">
          <div class="chart-area" ref="chartCommands"/>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import * as echarts from 'echarts'
import RedisPool from 'm/RedisPool'

export default {
  name: 'InfoCharts',
  components: {
  },
  props: {
    config: {
      type: Object,
      default: null
    },
    redisId: {
      type: String,
      default: function () {
        return ''
      }
    }
  },
  data() {
    return {
      servers: [],
      refreshRate: 5,
      showDataSpan: 3600,
      refreshTimer: null,
      chartMem: null,
      chartCpu: null,
      chartClients: null,
      chartKeys: null,
      chartCommands: null,
      chartMemData: [],
      chartCpuData: [],
      chartClientsData: [],
      chartKeysData: [],
      chartCommandsData: [],
      initalized: false
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
  methods: {
    onSelected() {
      if(!this.initalized) {
        this.$nextTick( function() {
          this.initCharts()
          this.initalized = true
        })
      }
    },
    init() {
      this.initServerList()
      this.startTimer()
      
    },
    resizeCharts() {
      if(this.chartMem) this.chartMem.resize()
      if(this.chartCpu) this.chartCpu.resize()
      if(this.chartClients) this.chartClients.resize()
      if(this.chartKeys) this.chartKeys.resize()
      if(this.chartCommands) this.chartCommands.resize()
    },
    startTimer() {
      this.refreshTimer = setTimeout(this.refresh, this.refreshRate * 1000)
    },
    shutDownTimer() {
      if(this.refreshTimer !== null){
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null
      }
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
            name: node.options.host + ":" + node.options.port + " (master)",
            lastSummary: null
          })
        })
        nodes = redis.nodes('slave')  
        _.each(nodes, (node) => {
          this.servers.push({
            key: node.options.host + ":" + node.options.port,
            name: node.options.host + ":" + node.options.port + " (slave)",
            lastSummary: null
          })
        })
      }else {
        this.servers.push({
          key: redis.options.host + ":" + redis.options.port,
          name: redis.options.host + ":" + redis.options.port + " (master)",
          lastSummary: null
        })
      }
    },
    initCharts() {
      this.initMemChart()
      this.initCpuChart()
      this.initClientsChart()
      this.initKeysChart()
      this.initCommandsChart()
    },
    initMemChart() {
      this.chartMem = echarts.init(this.$refs.chartMem)
      let option = {
        title: {
          text: this.$t('Memory Usage') + '(Mb)'
        },
        tooltip: {},
        xAxis: {type: 'category'},
        yAxis: {},
        legend: {
          data: _.map(this.servers,(s) => { return s.name})
        },
        dataset: {
          source: this.chartMemData
        },
        series: _.map(this.servers,(s,index) => { 
          return {
            name: s.name,
            type: 'line',
            encode: {x:0, y:index + 1}
          }
        }),
        dataZoom: [{   
            type: 'slider', 
            start: 0,
            end: 100
          }
        ]
      }
      this.chartMem.setOption(option)
    },
    initCpuChart() {
      this.chartCpu = echarts.init(this.$refs.chartCpu)
      let option = {
        title: {
          text: this.$t('CPU Usage') + '(%)'
        },
        tooltip: {},
        xAxis: {type: 'category'},
        yAxis: {},
        legend: {
          data: _.map(this.servers,(s) => { return s.name})
        },
        dataset: {
          source: this.chartCpuData
        },
        series: _.map(this.servers,(s,index) => { 
          return {
            name: s.name,
            type: 'line',
            // type: 'gauge'
            encode: {x:0, y:index + 1}
          }
        }),
        dataZoom: [{   
            type: 'slider', 
            start: 0,
            end: 100
          }
        ]
      }
      this.chartCpu.setOption(option)
    },
    initClientsChart() {
      this.chartClients = echarts.init(this.$refs.chartClients)
      let option = {
        title: {
          text: this.$t('Clients')
        },
        tooltip: {},
        xAxis: {type: 'category'},
        yAxis: {},
        legend: {
          data: _.map(this.servers,(s) => { return s.name})
        },
        dataset: {
          source: this.chartClientsData
        },
        series: _.map(this.servers,(s,index) => { 
          return {
            name: s.name,
            type: 'line',
            encode: {x:0, y:index + 1}
          }
        }),
        dataZoom: [{   
            type: 'slider', 
            start: 0,
            end: 100
          }
        ]
      }
      this.chartClients.setOption(option)
    },
    initKeysChart() {
      this.chartKeys = echarts.init(this.$refs.chartKeys)
      let option = {
        title: {
          text: this.$t('Key Size')
        },
        tooltip: {},
        xAxis: {type: 'category'},
        yAxis: {},
        legend: {
          data: _.map(this.servers,(s) => { return s.name})
        },
        dataset: {
          source: this.chartKeysData
        },
        series: _.map(this.servers,(s,index) => { 
          return {
            name: s.name,
            type: 'line',
            encode: {x:0, y:index + 1}
          }
        }),
        dataZoom: [{   
            type: 'slider', 
            start: 0,
            end: 100
          }
        ]
      }
      this.chartKeys.setOption(option)
    
    },
    initCommandsChart() {
      this.chartCommands = echarts.init(this.$refs.chartCommands)
      let option = {
        title: {
          text: this.$t('Commands per Second')
        },
        tooltip: {},
        xAxis: {type: 'category'},
        yAxis: {},
        legend: {
          data: _.map(this.servers,(s) => { return s.name})
        },
        dataset: {
          source: this.chartCommandsData
        },
        series: _.map(this.servers,(s,index) => { 
          return {
            name: s.name,
            type: 'line',
            encode: {x:0, y:index + 1}
          }
        }),
        dataZoom: [{   
            type: 'slider', 
            start: 0,
            end: 100
          }
        ]
      }
      this.chartCommands.setOption(option)
    
    },
    refresh() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      let now = this.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss')
      let allNodes = []
      if(redis.isCluster) {
        allNodes = redis.nodes('all')
      }else{
        allNodes.push(redis)
      }
      _.each(allNodes, (node) => {
        node.info()
        .then((result) => {
          that.loadChartsInfo(result,
            node.options.host + ":" + node.options.port,
            now)
        })
        .catch( (error) => {
          that.shutDownTimer()
          console.log(error)
          that.$message.error(that.$t('Get server info failed', error))
        })
      })
      that.startTimer()
      this.resizeCharts()
    },
    loadChartsInfo(info, nodeKey, now) {
      let index = this.getServerIndex(nodeKey)
      if(index < 0) {
        return
      }
      let infoSet = RedisPool.formatInfo(info)
      let summary = {
        time : now,
        uptime_in_days: infoSet.Server.uptime_in_days
      }
      let lastSummary = this.servers[index].lastSummary

      this.servers[index].lastSummary = summary

      let maxLength = this.showDataSpan / this.refreshRate
      
      // Memory
      let curData = this.initCurCharData(now, this.chartMemData, maxLength)
      curData[index + 1] = (infoSet.Memory.used_memory / 1024 / 1024).toFixed(2)
      if(this.initalized) {
        this.chartMem.setOption({
          dataset: {
            source: this.chartMemData
        }})
      }
      summary.used_memory = curData[index + 1]

      // CPU
      curData = this.initCurCharData(now, this.chartCpuData, maxLength)
      let utime = parseFloat(infoSet.CPU.used_cpu_sys) | 0.0 + 
                  parseFloat(infoSet.CPU.used_cpu_user) | 0.0
      if(lastSummary === null) {
        curData[index + 1] = 0.0
      }else {
        let span = this.getTimeSpan(new Date(now), new Date(lastSummary.time))
        curData[index + 1] = (utime - lastSummary.utime ) / span * 100
      }
      if(this.initalized) {
        this.chartCpu.setOption({
          dataset: {
            source: this.chartCpuData
        }})
      }
      summary.utime = utime
      summary.cpu_rate = curData[index + 1]

      // clients
      curData = this.initCurCharData(now, this.chartClientsData, maxLength)
      curData[index + 1] = infoSet.Clients.connected_clients
      if(this.initalized) {
        this.chartClients.setOption({
          dataset: {
            source: this.chartClientsData
        }})
      }
      summary.clients = curData[index + 1]

      // keys
      curData = this.initCurCharData(now, this.chartKeysData, maxLength)
      let keys = 0
      _.each(infoSet.Keyspace, (db) => {
        keys += parseInt(db.keys)
      })
      curData[index + 1] = keys
      if(this.initalized) {
        this.chartKeys.setOption({
          dataset: {
            source: this.chartKeysData
        }})
      }
      summary.keys = curData[index + 1]

      // commands
      curData = this.initCurCharData(now, this.chartCommandsData, maxLength)
      let cmds = parseInt(infoSet.Stats.total_commands_processed) | 0
      if(lastSummary === null) {
        curData[index + 1] = 0
      }else {
        let span = this.getTimeSpan(new Date(now), new Date(lastSummary.time))
        curData[index + 1] = (cmds - lastSummary.cmds ) / span
      }
      if(this.initalized) {
        this.chartCommands.setOption({
          dataset: {
            source: this.chartCommandsData
        }})
      }
      summary.cmds = cmds
      summary.cmd_rate = curData[index + 1]

    },
    formatDate(date, fmt) { 
      var o = { 
        'M+' : date.getMonth()+1,                 //月份 
        'd+' : date.getDate(),                    //日 
        'h+' : date.getHours(),                   //小时 
        'm+' : date.getMinutes(),                 //分 
        's+' : date.getSeconds(),                 //秒 
        'q+' : Math.floor((date.getMonth()+3)/3), //季度 
        'S' : date.getMilliseconds()             //毫秒 
      }
      if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+'').substr(4 - RegExp.$1.length))
      }
      for(var k in o) {
        if(new RegExp('('+ k +')').test(fmt)){
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (('00'+ o[k]).substr((''+ o[k]).length)))
        }
      }
      return fmt
    },
    getTimeSpan(dtLeft, dtRight) {
      return (dtLeft.getTime() - dtRight.getTime()) / 1000
    },
    getClusterNode(redis, key) {
      let node = _.find(redis.nodes('all'), (n) =>{
        return key === n.options.host + ":" + n.options.port
      })
      return node
    },
    getServerIndex(key) {
      let index = -1
      _.each(this.servers, (server, idx) => {
        if(server.key === key) {
          index = idx
          return false
        }
      })
      return index
    },
    initCurCharData(now, dataset, maxLength) {
      let curData = dataset.length > 0 ? dataset[dataset.length - 1] : null
      if(curData == null || curData[0] !== now) {
        curData = new Array(this.servers.length + 1)
        curData[0] = now

        dataset.push(curData)
        if(dataset.length > maxLength) {
          dataset.pop()
        }
      }
      return curData
    }

  }
  
}
</script>

<style scoped>
.im-container{
  height:100%;
  width: 100%;
}
.el-header{
  padding: 0 0 0 5px;
  margin-bottom: 5px;
  height: 200px !important;
}
.el-main{
  padding: 0 0 0 5px;
}
.chart-area{
  height: 100%;
  width: 100%;
  /* client-width: 100%; */
}
.chart-row{
  height: 200px;
}
.el-carousel__item .info-card{
  opacity: 0.75;
  margin: 10px 20px 0px 20px;
  background-color: #daeaf1;
  border: 1px solid #daeaf1;
}
.info-card >>> .el-card__header {
  padding: 3px 4px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
}
.info-card >>> .el-card__body {
  font-size: 60px;
  font-weight: bold;
  padding: 10px 0;
  color: #1581aa;
  text-align: center;
}
.info-card-header{
  text-align:left;
  padding-top:10px;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
}
.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}
</style>