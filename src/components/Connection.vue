<template>
  <el-container>
    <el-aside ref="leftPanel" :width="leftPanelWidth">
      <el-container>
        <el-main>
          <key-list ref="keyList"
            @on-children-event="onChildrenEvent" 
            :config="config"
            :redisId="redisId">
          </key-list>
        </el-main>
        <el-footer style="height:30px;padding: 0px 10px">
          <key-footer ref="keyFooter"
            @on-children-event="onChildrenEvent" 
            :config="config"
            :redisId="redisId">
          </key-footer>
        </el-footer>
      </el-container>
    </el-aside>
    <div ref="splitLine" class="splitLine" /> 
    <el-main>
      <el-container>
        <el-main>
          <main-area ref="mainArea" 
            @on-children-event="onChildrenEvent" 
            :config="config"
            :redisId="redisId"/>
        </el-main>
      </el-container>
    </el-main>
  </el-container>  
</template>

<script>
import RedisPool from 'm/RedisPool'
import KeyFooter from './KeyFooter.vue'
import KeyList from './KeyList'
import MainArea from './MainArea.vue'

export default {
  name: 'Connection',
  components: {
    KeyFooter,
    KeyList,
    MainArea
  },
  props: {
    config: {
      type: Object,
      default: null
    },
    activated: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      leftPanelWidth: document.body.clientWidth * 0.3 + 'px',
      clientStartX: 0,
      redisId: null
    }
  },
  mounted () {
    this.initSplitLine()
    this.initRedis()
  },
  beforeDestroy() {
    this.removeRedisEventLinstener()
    RedisPool.closeRedis(this.redisId)
  },
  methods: {
    initSplitLine() {
      let splitLine = this.$refs.splitLine; 
      let that= this
      splitLine.onmousedown = e => {
        that.clientStartX = e.clientX;
        e.preventDefault();
  
        document.onmousemove = e => {
          that.moveHandle(e.clientX);
        };
  
        document.onmouseup = e => {
          document.onmouseup = null;
          document.onmousemove = null;
        };
      };
    },
    moveHandle(nowClientX) {
      let computedX = nowClientX - this.clientStartX;
      let leftBoxWidth = parseInt(this.$refs.leftPanel.width);
      let changeWidth = leftBoxWidth + computedX; 
      if (changeWidth < 100) {
        changeWidth = 100;
      }
      let maxWidth = document.body.clientWidth * 0.5
 
      if (changeWidth > maxWidth) {
        changeWidth = maxWidth;
      }

      this.leftPanelWidth = changeWidth + "px";
 
      this.clientStartX = nowClientX;

      // send to children components
      this.dispatchEventToChildren({
        name : 'clientAreaChanged'
      })
    },
    initRedis() {
      let that = this
      RedisPool.newRedis(this.config)
        .then(redis => {
          that.redisId = redis.connectionId
          redis.once('error', async (error) => {
            that.$message.error({
              message: this.$t('connect redis failed', error),
              showClose: true,
              duration: 10000})
            redis.close()
          });

          // give it to all compnents
          redis.once('ready', async () => {
            redis.removeAllListeners('error')
            // this.$refs.keyFooter.onRedisReady()

            that.addRedisEventLinstener(redis)

            //send redis is init ok event
            that.dispatchEventToChildren({
              name : 'redisInitialized'
            })
          });
        })

    },
    addRedisEventLinstener(redis) {
      redis.on('ready',async (event) => this.onRedisStatusEvent('ready', event))
      redis.on('connect',async (event) => this.onRedisStatusEvent('connect', event))
      redis.on('error',async (event) => this.onRedisStatusEvent('error', event))
      redis.on('close',async (event) => this.onRedisStatusEvent('close', event))
      redis.on('reconnecting', async (event) => this.onRedisStatusEvent('reconnecting', event))
      redis.on('end',async (event) => this.onRedisStatusEvent('end', event))
      redis.on('wait',async (event) => this.onRedisStatusEvent('wait', event))
      redis.on('select',async (event) => this.onRedisStatusEvent('wait', event))
    },
    removeRedisEventLinstener() {
      var redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.removeAllListeners('ready')
      redis.removeAllListeners('connect')
      redis.removeAllListeners('error')
      redis.removeAllListeners('close')
      redis.removeAllListeners('reconnecting')
      redis.removeAllListeners('end')
      redis.removeAllListeners('wait')
      redis.removeAllListeners('select')
    },
    onRedisStatusEvent(eventName,event) {
      let eventData = {
        name: 'redisStatus',
        data: {
          status: eventName,
          error: event
        }
      }
      this.dispatchEventToChildren(eventData)
      if(eventName === 'error'){
        this.$message.error({
          message: this.$t('redis connection broken', eventData.data.error),
          showClose: true,
          duration: 10000})
        this.removeRedisEventLinstener()
      }
    },
    onChildrenEvent(eventData) {
      let that = this
      this.$nextTick(() => {
        let sendToChildren = true
        switch(eventData.name){

        }
        that.dispatchEventToChildren(eventData)
      })
    },
    dispatchEventToChildren(eventData) {
      let that = this
      // send to all compnents
      this.$nextTick(() => {
        that.$refs.keyFooter.onEvent(eventData)
        that.$refs.keyList.onEvent(eventData)
        that.$refs.mainArea.onEvent(eventData)
      })
    }
  }

}
</script>

<style scoped>
.el-main{
  padding: 0;
  width: 100%;
  height: 100%
}
.el-container{
  /* padding: 0px; */
  padding-left: 5px;
  padding-right: 5px;
  width: 100%;
  height: 100%
}
.el-footer{
  height:30px;
  padding: 0px 10px
}
.splitLine {
  width: 4px;
  height: calc(100% - 40px);
  background: #dcdfe6;
  cursor: col-resize;
}
</style>