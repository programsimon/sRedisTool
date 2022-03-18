<template>
  <el-container class="container">
    <el-header class="key-header">
      <key-value-header
        :config="config"
        :redisId="redisId"
        :redisKey="redisKey"
        :encoding.sync="encoding"
        @refresh="onRefresh"
        @add="onAdd"
        @rename-key="onRename"
        @encoding-change="onEncodingChange"
        keyType="set"></key-value-header>
    </el-header>
    <el-header class="data-table">
      <paged-table
        v-loading="loading"
        size="mini" 
        :data="listData"
        :total="total"
        :height="180"
        :show-header="false"
        @row-click="onRowClick"
        @lackedData="onLackedData">
        <el-table-column prop="index" width="60px"></el-table-column>
        <el-table-column label="" width="80px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              plain
              @click="handleDelete(scope.$index, scope.row)">{{$t('Delete')}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="data"></el-table-column>
      </paged-table>
    </el-header>
    <el-main>
      <value-editor 
        v-model="keyValue"
        @saveData="onSave"></value-editor>
    </el-main>

    <el-dialog :title="$t('Add')" :visible.sync="addSetValueVis">
      <el-form label-width="100px">
        <el-form-item :label="$t('Field value')">
          <el-input v-model="addValue"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button :plain="true" @click="addSetValueVis = false" >{{$t('Cancel')}}</el-button>
        <el-button :plain="true" type="primary" @click="onConfirmAdd">{{$t('Confirm')}}</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import RedisPool from 'm/RedisPool'

import KeyValueHeader from './KeyValueHeader'
import ValueEditor from 'c/ValueEditor'
import PagedTable from 'c/PagedTable'
import iconv from 'iconv-lite'

export default {
  name: 'EditorSet',
  components: {
    KeyValueHeader,
    ValueEditor,
    PagedTable
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
      listData: [],
      scanParam: {
        cursor: "0",
        curBatchCount: 0,
        count: 0
      },
      curItem: {},
      keyValue: '',
      encoding: '',
      total: 0,
      addSetValueVis: false,
      addValue: '',
      loading: false
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
      this.curItem = {}
      this.keyValue = ''
      this.total = 0
      this.listData = []

      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.scard(
        this.redisKey
      ).then( (result) => {
        that.total = result
        that.loadList(redis, that.config.maxloadkeysize)
      }).catch( (error) => {
        that.$message.error(that.$t('Get key failed', error))
      })
    },
    loadList(redis, minDataSize, isMore) {
      let startPos = this.listData.length
      if(startPos >= minDataSize) {
        return
      }
      this.loading = true
      let endPos = startPos + Math.max(this.config.maxloadkeysize, minDataSize - startPos)
      let cursor = "0"
      if(isMore) {
        cursor = this.scanParam.cursor || "0"
      }
      this.scanParam = {
        cursor: cursor,
        curBatchCount: 0,
        count : endPos - startPos
      }
      this.scanFields(redis)
    },
    scanFields(redis, count){
      let that = this
      redis.sscanBuffer(
        this.redisKey,
        this.scanParam.cursor,
        'count',
        this.scanParam.count)
        .then(function(result){
          that.parseScanResult(redis, result)
        })
        .catch(function(error) {
          that.scanParam.cursor = "0"
          that.loading = false
          that.$message.error(that.$t('Get key failed', error))
        })
    },
    parseScanResult(redis, result){
      if(!result || result.length <= 1){
        this.scanParam.cursor = "0"
        return
      }
      let startPos = this.listData.length
      this.scanParam.cursor = iconv.decode(result[0], this.encoding)
      let that = this
      this.listData = _.concat(this.listData, _.map(result[1], (data, index) => {
        this.scanParam.curBatchCount++
        return {
          data : iconv.decode(data, that.encoding),
          index: startPos + index
        }
      }))
      
      // check if needs call scan again
      if(this.scanParam.cursor !== "0" && this.scanParam.curBatchCount < this.scanParam.count) {
        this.scanFields(redis)
      }else{
        this.loading = false
      }
    },
    onEncodingChange(val) {
      this.$nextTick( function() {
        this.onRefresh()
      })
    },
    onAdd() {
      this.addSetValueVis = true
      this.addValue = ''
    },
    onConfirmAdd(){
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.saddBuffer(
        this.redisKey,
        iconv.encode(this.addValue,this.encoding)
      ).then(function(result){
        that.$message.success(that.$t('Add successed'))
        that.addSetValueVis = false
      }).catch(function(error) {
        that.$message.error(that.$t('Add failed', error))
      })
    },
    onSave() {
      if(!this.curItem || this.curItem.index < 0){
        return
      }
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.multi()
        .sremBuffer(
          this.redisKey,
          iconv.encode(this.curItem.data,this.encoding)
        )
        .saddBuffer(
          this.redisKey,
          iconv.encode(this.keyValue,this.encoding)
        )
        .exec( (error, results) => {
          if(error) {
            that.$message.error(that.$t('Save failed', error))
          }else {
            that.curItem.data = that.keyValue
            that.$message.success(that.$t('Save successed'))
          }
      })
    },
    onLackedData(needsSize) {
      if(!needsSize) {
        return
      }
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      this.loadList(redis, needsSize,true)
    },
    onRowClick(row, column, event){
      if(row){
        this.curItem = row
        this.keyValue = this.curItem.data
      }else {
        this.curItem = {}
        this.keyValue = ''
      }
    },
    handleDelete(index, row) {
      if(!row || row.index < 0){
        return
      }
      this.curDelItem = row
      let that = this
      this.$confirm(this.$t('delete item confirm'),this.$t('Delete'),{
        confirmButtonText: this.$t('Confirm'),
        cancelButtonText: this.$t('Cancel'),
        type: 'warning'
      }).then( () =>{
        this.doDelete()
      }).catch( () => {

      })
    },
    doDelete() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.sremBuffer(
          this.redisKey,
          iconv.encode(this.curItem.data,this.encoding)
        )
        .then(function(result){
          that.$message.success(that.$t('Delete successed'))
        })
        .catch(function(error) {
          that.$message.error(that.$t('Delete failed', error))
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