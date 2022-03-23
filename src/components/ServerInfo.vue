<template>
  <el-tabs 
    class="si-container"
    tab-position="left"
    v-model="activeTab"
    stretch
    @tab-click="onTabSwitched"
    >
    <el-tab-pane 
      name="info">
      <el-tooltip slot="label" effect="light" :content="$t('Server information')" placement="right">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <info-info
          :config="config"
          :redisId="redisId">
      </info-info>
    </el-tab-pane>
    <el-tab-pane 
      name="config">
      <el-tooltip slot="label" effect="light" :content="$t('Server configuration')" placement="right">
        <i class="el-icon-s-tools"></i>
      </el-tooltip>
      <info-config
          :config="config"
          :redisId="redisId">
      </info-config>
    </el-tab-pane>
    <el-tab-pane 
      name="charts">
      <el-tooltip slot="label" effect="light" :content="$t('Server running charts')" placement="right">
        <i class="el-icon-s-data"></i>
      </el-tooltip>
      <info-charts
        :config="config"
        :redisId="redisId">
      </info-charts>
    </el-tab-pane>
    <el-tab-pane 
      name="clients">
      <el-tooltip slot="label" effect="light" :content="$t('Server clients')" placement="right">
        <i class="el-icon-user-solid"></i>
      </el-tooltip>
      <info-clients 
        :config="config"
        :redisId="redisId">
      </info-clients>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import InfoClients from './InfoClients.vue'
import InfoConfig from './InfoConfig.vue'
import InfoInfo from './InfoInfo.vue'
import InfoCharts from './InfoCharts.vue'

export default {
  name: 'ServerInfo',
  components: {
    InfoInfo,
    InfoConfig,
    InfoClients,
    InfoCharts
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
     activeTab: 'info'
    }
  },
  watch: {
    
  },
  mounted() {
   
  },
  methods: {
    onTabSwitched(tab) {
      if(!tab) {
        return
      }
      _.each(tab.$children, (child) => {
        if(child.onSelected) {
          child.onSelected()
        }
      })
      
    }
  }
  
}
</script>

<style scoped>
.si-container{
  height:100%;
  width: 100%;
}
.si-container >>> .el-tabs__content{
  height: 100%;
}
.el-tab-pane{
  height: 100%;
}
</style>