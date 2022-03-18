<template>
  <el-container class="container">
    <el-header class="key-header">
      <key-value-header
        :config="config"
        :redisId="redisId"
        :redisKey="redisKey"
        :encoding.sync="encoding"
        :addButton="false"
        @refresh="onRefresh"
        @rename-key="onRename"
        @encoding-change="onEncodingChange"
        keyType="string"></key-value-header>
    </el-header>

    <el-main>
      <value-editor v-model="keyValue"
        @saveData="onSave"></value-editor>
    </el-main>
  </el-container>
</template>

<script>
import RedisPool from 'm/RedisPool'

import KeyValueHeader from './KeyValueHeader'
import ValueEditor from 'c/ValueEditor'

import iconv from 'iconv-lite'

export default {
  name: 'EditorString',
  components: {
    KeyValueHeader,
    ValueEditor
  },
  props: {
    config: {
      type: Object,
      default: null
    },
    redisId: {
      type: String,
      default: ''
    }, 
    redisKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      keyValue: '',
      encoding: ''
    }
  },
  watch: {
    redisKey(val) {
      this.onRefresh()
    }
  },
  mounted() {
    this.$nextTick( function() {
      this.onRefresh()
    })
  },
  methods: {
    onRename(eventData) {
      this.$emit('on-children-event', eventData)
    },
    onRefresh() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.getBuffer(
        this.redisKey
      ).then( (result) => {
        that.keyValue = iconv.decode(result,that.encoding)
      }).catch( (error) => {
        that.$message.error(that.$t('Get key failed', error))
      })
    },
    onEncodingChange(val) {
      this.$nextTick( function() {
        this.onRefresh()
      })
    },
    onSave() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.setBuffer(
        this.redisKey,
        iconv.encode(this.keyValue,this.encoding)
      ).then( (result) => {
        that.$message.success(that.$t('Save successed'))
      }).catch( (error) => {
        that.$message.error(that.$t('Save failed', error))
      })
    }
  }
  
}
</script>

<style scoped>
.container{
  height:100%;
  width: 100%;
}
.el-header{
  padding: 0 0 0 5px;
  margin-bottom: 5px;
  /* height: 80px !important; */
}
.el-main{
  padding: 0 0 0 5px;
}
.key-header{
  height:80px !important;
}
.data-table{
  height:220px !important;
}
.key-field{
  height:40px !important;
}
.el-tag{
  width: 70px;
}
</style>