<template>
  <el-row :gutter="20" type="flex" align="middle" style="height:calc(80vh);">
    <el-col :span="10" style="text-align: right;">
      <img src="../assets/logo.png" height="128" width="128">
    </el-col>
    <el-col :span="14">
      <h3>sRedisTool - GUI Tool for Redis</h3>
      <h5>Version: {{appInfo.version}}</h5>
    </el-col>
  </el-row>
</template>

<script>
import bridge from 'm/ElectronBridge'

import RedisPool from 'm/RedisPool'

export default {
  name: 'Welcome',
  components: {

  },
  data() {
    return {
      appInfo : null,
      serverGroups: [],
      single: null,
      clsuter: null
    }
  },
  created() {
    this.appInfo = bridge.getAppInfo();
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if(this.single) {
      RedisPool.closeRedis(this.single.connectionId)
    }
    if(this.clsuter) {
      RedisPool.closeRedis(this.clsuter.connectionId)
    }
  },
  methods: {
    init() {
      // this.serverGroups = bridge.getConfig('servergroups')
      // console.log(this.serverGroups)
      // let sSingle = this.serverGroups[0].servers[2]
      // let sCluster = this.serverGroups[0].servers[0]
      // let single = new Redis(sSingle)
      // let cluster = new Redis(sCluster)
      // console.log(cluster)

      // // single.cluster('nodes')
      // // .then((result) =>{
      // //   console.log(result)
      // // })
      // cluster.once('ready', async () => {
      //     let allNodes = cluster.nodes('all')  
      //     console.log(allNodes)
      //     Promise.all(
      //     allNodes
      //       .map((node) => node.info()
      //         .then((result) => {
      //           console.log(result)
      //         }))
      //   );
      // })
      // RedisPool.closeRedis(single)
      // RedisPool.closeRedis(cluster)
    }
  }
}
</script>