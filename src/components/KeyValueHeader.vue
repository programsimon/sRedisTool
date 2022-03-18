<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="24">
        <el-tag>{{keyType.toUpperCase()}}</el-tag>
        <el-input v-model="redisKey" size="mini" style="width: calc(100% - 80px);padding-left:10px" readonly>  
        </el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
      <el-button type="info" size="mini" plain @click="onRefresh">{{$t('Refresh')}}</el-button>
      <el-button type="info" size="mini" plain @click="onRename">{{$t('Rename')}}</el-button>
      <el-button type="info" size="mini" plain @click="onSetTTL">{{'TTL:' + ttl}}</el-button>
      <el-button type="info" size="mini" plain @click="onDelete">{{$t('Delete')}}</el-button>
      <el-button type="info" size="mini" plain @click="onAdd" v-show="addButton">{{$t('Add')}}</el-button>
      <encoding-select ref="encodingSelect" v-model="encodingSelected" size="mini" @change="onEncodingChange" style="margin-left:10px"></encoding-select>
      </el-col>
    </el-row>
    <template>
      <el-dialog :title="$t('Set TTL')" :visible.sync="setTTLVis">
        <el-form>
          <el-form-item label="TTL" >
            <el-input v-model="setttl" autofocus="true"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button :plain="true" @click="setTTLVis = false">{{$t('Cancel')}}</el-button>
          <el-button type="primary" :plain="true" @click="onConfirmSetTTL">{{$t('Confirm')}}</el-button>
        </div>
      </el-dialog>
    </template>
    <template>
      <el-dialog :title="$t('Rename')" :visible.sync="renameVis">
        <el-form>
          <el-form-item :label="$t('Key')" >
            <el-input v-model="renameKey" autofocus="true"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button :plain="true" @click="renameVis = false">{{$t('Cancel')}}</el-button>
          <el-button type="primary" :plain="true" @click="onConfirmRename">{{$t('Confirm')}}</el-button>
        </div>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import RedisPool from 'm/RedisPool'

import EncodingSelect from 'c/EncodingSelect'

export default {
  name: 'KeyValueHeader',
  components: {
    EncodingSelect
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
    },
    keyType: {
      type: String,
      default: ''
    },
    encoding: {
      type: String,
      default: ''
    },
    addButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      ttl: -1,
      setTTLVis: false,
      renameVis: false,
      setttl: -1,
      renameKey: '',
      encodingSelected: ''
    }
  },
  watch: {
    encodingSelected(val) {
      this.$emit('update:encoding', val)
    },
    redisKey(val) {
      this.init()
    }
  },
  mounted() {
    this.encodingSelected = this.encoding || this.config.encoding
    this.$nextTick( function() {
      this.init()
    })
  },
  methods: {
    init() {
      this.refreshTTL()
    },
    onRename() {
      this.renameKey = this.redisKey
      this.renameVis = true
    },
    onConfirmRename() {
      if(!this.renameKey || this.renameKey.length <= 0){
        this.$message.error({
          message: this.$t('key missing'),
          showClose: true,
          duration: 3000})
        return
      }

      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.rename(this.redisKey,this.renameKey
      ).then(function(result){
        that.$message.success(that.$t('Rename key successed'))
        that.renameVis = false
        // send event to parent
        that.$emit('rename-key', {
          name: 'onRenameKey',
          key: that.renameKey,
          oldKey: that.redisKey
        })

      }).catch(function(error) {
        that.$message.error(that.$t('Rename key failed', error))
      })
    },
    onDelete() {
      let that = this
      this.$confirm(this.$t('delete confirm'),this.$t('Delete Key'),{
        confirmButtonText: this.$t('Confirm'),
        cancelButtonText: this.$t('Cancel'),
        type: 'warning'
      }).then( () =>{
        let redis = RedisPool.getRedis(this.redisId)
        if(!redis) {
          that.$message.error(that.$t('Redis connect invalid'))
          return
        }
        redis.del(that.redisKey
        ).then( (result) => {
          that.$message.success(that.$t('Key deleted'))
        })

      }).catch( () => {

      })
    },
    onSetTTL() {
      this.setttl = this.ttl
      this.setTTLVis = true
    },
    onConfirmSetTTL() {
      if(!this.setttl || this.setttl.length <= 0){
        setttl = -1
      }else if(isNaN(this.setttl)){
        this.$message.error({
          message: this.$t('TTL must be positive integer'),
          showClose: true,
          duration: 3000})
        return
      }else if(!this.isInteger(this.setttl)){
        this.$message.error({
          message: this.$t('TTL must be positive integer'),
          showClose: true,
          duration: 3000})
        return
      }
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.expire(this.redisKey,this.setttl
      ).then(function(result){
        that.$message.success(that.$t('Set TTL successed'))
        that.setTTLVis = false
        that.refreshTTL()
      }).catch(function(error) {
        that.$message.error(that.$t('Set TTL failed', error))
      })
    },
    refreshTTL() {
      let that = this
      let redis = RedisPool.getRedis(this.redisId)
      if(!redis) {
        return
      }
      redis.ttl(this.redisKey)
      .then(function (result) {
        that.ttl = result
      })
    },
    isInteger(val) {
      return (/^[0-9]*[1-9][0-9]*$/.test(val))
    },
    onRefresh(){
      // send event to parent
      this.$emit('refresh', {})
    },
    onAdd() {
      // send event to parent
      this.$emit('add', {})
    },
    onEncodingChange(val) {
      this.$emit('encoding-change', {
        val: val,
        oldval: this.encodingSelected
      })
    }
  }

}
</script>

<style scoped>
.el-form-item{
  margin-bottom: 10px;
}
.el-row{
  margin-bottom: 10px;
}
.el-tag{
  width: 70px;
}
</style>