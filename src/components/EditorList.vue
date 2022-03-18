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
        keyType="list"></key-value-header>
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

    <el-dialog :title="$t('Add')" :visible.sync="addListValueVis">
      <el-form label-width="100px">
        <el-form-item :label="$t('Add to')" >
          <el-radio-group v-model="addTo">
            <el-radio :label="'left'">Left (lpush)</el-radio>
            <el-radio :label="'right'">Right (rpush)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('Field value')">
          <el-input v-model="addValue"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer">
        <el-button :plain="true" @click="addListValueVis = false" >{{$t('Cancel')}}</el-button>
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
  name: 'EditorList',
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
      curItem: {},
      keyValue: '',
      encoding: '',
      total: 0,
      delTmpData: '!!__SRT__LIST__DEL__PARAM!!',
      curDelItem: {},
      addListValueVis: false,
      addValue: '',
      addTo: '',
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
      redis.llen(
        this.redisKey
      ).then( (result) => {
        that.total = result
        that.loadList(redis, that.config.maxloadkeysize)
      }).catch( (error) => {
        that.$message.error(that.$t('Get key failed', error))
      })
    },
    loadList(redis, minDataSize) {
      let startPos = this.listData.length
      if(startPos >= minDataSize) {
        return
      }
      let endPos = startPos + Math.max(this.config.maxloadkeysize, minDataSize - startPos)
      let that = this
      redis.lrangeBuffer(
        this.redisKey,
        startPos,
        endPos
      ).then( (result) => {
        that.listData = _.concat(that.listData, _.map(result, (data, index) => {
          return {
            data : iconv.decode(data, that.encoding),
            index: startPos + index
          }
        }))

      }).catch( (error) => {
        that.$message.error(that.$t('Get key failed', error))
      })
    },
    onEncodingChange(val) {
      this.$nextTick( function() {
        this.onRefresh()
      })
    },
    onAdd() {
      this.addListValueVis = true
      this.addTo = 'left'
      this.addValue = ''
    },
    onConfirmAdd(){
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      if(this.addTo === 'right') {
        redis.rpushBuffer(
          this.redisKey,
          iconv.encode(this.addValue,this.encoding)
        ).then(function(result){
          that.$message.success(that.$t('Add successed'))
          that.addListValueVis = false
        }).catch(function(error) {
          that.$message.error(that.$t('Add failed', error))
        })
      }else {
        redis.lpushBuffer(
          this.redisKey,
          iconv.encode(this.addValue,this.encoding)
        ).then(function(result){
          that.$message.success(that.$t('Add successed'))
          that.addListValueVis = false
        }).catch(function(error) {
          that.$message.error(that.$t('Add failed', error))
        })
      }
    },
    onSave() {
      if(!this.curItem || this.curItem.index < 0){
        return
      }
      this.confirmDataIndex(this.curItem.index, this.curItem.data, this.doSaveCurItem)
    },
    // check data changed
    confirmDataIndex(index, data, succcb) {
      let that = this
      let newData = ''
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.lindexBuffer(
        this.redisKey,
        index
      ).then( (result) => {
        newData = iconv.decode(result,this.encoding)
        if(newData !== data) {
          that.$message.warning(that.$t('list data changed'))
        }else {
          succcb()
        }
      }).catch( (error) => {
        that.$message.error(that.$t('Get key failed', error))
      })
    },
    doSaveCurItem() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.lsetBuffer(
        this.redisKey,
        this.curItem.index,
        iconv.encode(this.keyValue,this.encoding)
      ).then( (result) => {
        that.$message.success(that.$t('Save successed'))
        that.curItem.data = that.keyValue
      }).catch( (error) => {
        that.$message.error(that.$t('Save failed', error))
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
      this.loadList(redis, needsSize)
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
        that.confirmDataIndex(that.curDelItem.index, that.curItem.data, that.doDelete)

      }).catch( () => {

      })
    },
    doDelete() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.multi()
        .lset(
          this.redisKey,
          this.curDelItem.index,
          this.delTmpData
        )
        .lrem(
          this.redisKey,
          1,
          this.delTmpData
        )
        .exec( (error, results) => {
          if(error) {
            that.$message.error(that.$t('Delete failed', error))
          }else {
            that.$message.success(that.$t('Delete successed'))
          }
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