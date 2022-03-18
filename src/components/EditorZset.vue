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
        keyType="zset"></key-value-header>
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
        <el-table-column prop="score"></el-table-column>
        <el-table-column prop="data"></el-table-column>
      </paged-table>
    </el-header>
    <el-header class="key-field">
      <el-row>
        <el-col :span="24">
          <el-tag>{{$t('Score value')}}</el-tag>
          <el-input v-model="scoreValue" size="mini" style="width: calc(100% - 80px);padding-left:10px" readonly>  
          </el-input>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <value-editor 
        v-model="keyValue"
        @saveData="onSave"></value-editor>
    </el-main>

    <el-dialog :title="$t('Add')" :visible.sync="addZSetValueVis">
      <el-form label-width="100px">
        <el-form-item :label="$t('Score value')">
          <el-input v-model="addScore"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Key value')">
          <el-input v-model="addValue"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button :plain="true" @click="addZSetValueVis = false" >{{$t('Cancel')}}</el-button>
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
  name: 'EditorZset',
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
      scoreValue: '',
      keyValue: '',
      encoding: '',
      total: 0,
      addZSetValueVis: false,
      addScore: '',
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
      redis.zcard(
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
      let that = this
      redis.zrangeBuffer(
        this.redisKey,
        startPos,
        endPos,
        'WITHSCORES'
      ).then( (result) => {
        let tempDataList = []
        let tempData = {}
        _.each(result, (data, index) => {
          if(index % 2 == 0) {
            tempData = {
              data: iconv.decode(data, that.encoding),
              index: startPos + index / 2
            }
          }else {
            that.scanParam.curBatchCount++
            tempData.score = iconv.decode(data, that.encoding),
            tempDataList.push(tempData)
          }
        })
        that.loading = false
          that.listData = _.concat(that.listData, tempDataList)
      }).catch( (error) => {
          that.loading = false
        that.$message.error(that.$t('Get key failed', error))
      })
    },
    onEncodingChange(val) {     
      this.$nextTick( function() {
        this.onRefresh()
      })
    },
    onAdd() {
      this.addZSetValueVis = true
      this.addValue = ''
      this.addScore = ''
    },
    onConfirmAdd(){
      if(!this.addScore || this.addScore.length <= 0){
        this.$message.error({
          message: this.$t('score missing'),
          showClose: true,
          duration: 10000})
        return
      }else if(isNaN(this.addScore)){
        this.$message.error({
          message: this.$t('score must be number'),
          showClose: true,
          duration: 10000})
        return
      }
      if(!this.addScore || this.addScore.length <= 0){
        this.$message.error({
          message: this.$t('score missing'),
          showClose: true,
          duration: 10000})
        return
      }

      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.zaddBuffer(
        this.redisKey,
        this.addScore,
        iconv.encode(this.addValue,this.encoding)
      ).then(function(result){
        that.$message.success(that.$t('Add successed'))
        that.addZSetValueVis = false
      }).catch(function(error) {
        that.$message.error(that.$t('Add failed', error))
      })
    },
    onSave() {
      if(!this.curItem || !this.curItem.score || this.curItem.score.length <= 0){
        return
      }
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.multi()
        .zremBuffer(
          this.redisKey,
          iconv.encode(this.curItem.data,this.encoding)
        )
        .zaddBuffer(
          this.redisKey,
          this.scoreValue,
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
        this.scoreValue = this.curItem.score
      }else {
        this.curItem = {}
        this.keyValue = ''
        this.scoreValue = ''
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
      redis.zremBuffer(
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