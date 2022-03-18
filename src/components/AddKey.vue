<template>
  <el-dialog :title="$t('Add Key')" :visible.sync="dialogVisible">
    <el-form label-width="100px">
      <el-form-item :label="$t('Key')" >
        <el-input v-model="key"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Key type')" >
        <el-select v-model="keyType">
          <el-option
            v-for="type in surpportedType"
            :key="type"
            :label="type"
            :value="type">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Field value')" v-show="fieldVisible">
        <el-input v-model="fieldValue"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Score value')" v-show="scoreVisible">
        <el-input v-model.number="score"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Key value')" >
        <el-input type="textarea" v-model="keyValue"></el-input>
      </el-form-item>
    </el-form>
    
    <div slot="footer">
      <encoding-select ref="encodingSelect" v-model="encoding" size="mini" style="padding-right:20px"></encoding-select>
      <el-button :plain="true" @click="dialogVisible = false" >{{$t('Cancel')}}</el-button>
      <el-button :plain="true" type="primary" @click="onConfirm">{{$t('Confirm')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import EncodingSelect from './EncodingSelect.vue'
import iconv from 'iconv-lite'

export default {
  components: { EncodingSelect },
  name: 'AddKey',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    configEncoding: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      fieldVisible: false,
      scoreVisible: false,
      encoding : '',
      key: '',
      keyType: 'string',
      keyValue: '',
      fieldValue: '',
      score: 0,
      surpportedType: [
        'string','hash','list','set','zset'
      ]
    }
  },
  watch: {
    visible(val) {
      if(val === true){
        this.dialogVisible = val
        this.init()
      }
    },
    dialogVisible(val) {
      if(val === false) {
        this.$emit('update:visible',false)
      }
    },
    keyType(val) {
      this.onKeyTypeChanged(val)
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.encoding = ''
      this.key = ''
      this.keyType = 'string'
      this.keyValue = ''
      this.fieldValue = ''
      this.score = 0
      this.$refs.encodingSelect.init()
    },
    onConfirm() {
      if(!this.checkInput()){
        return
      }
      let redis = this.$parent.getRedisInstance()
      if(redis == null) {
        this.$message.error({
          message: this.$t('redis is not valid to add key'),
          showClose: true,
          duration: 10000})
        return
      }
      let that = this
      switch(this.keyType){
        case 'string':
          redis.setBuffer(
            this.key,
            iconv.encode(this.keyValue,this.encoding)
          ).then( (result) => {
            that.$message.success(that.$t('Add key successed'))
            that.dialogVisible = false
          }).catch( (error) => {
            that.$message.error(that.$t('Add key failed', error))
          })
          break
        case 'hash':
          redis.hsetBuffer(
            this.key,
            iconv.encode(this.fieldValue,this.encoding),
            iconv.encode(this.keyValue,this.encoding)
          ).then(function(result){
            that.$message.success(that.$t('Add key successed'))
            that.dialogVisible = false
          }).catch(function(error) {
            that.$message.error(that.$t('Add key failed', error))
          })
          break
        case 'list':
          redis.rpushBuffer(
            this.key,
            iconv.encode(this.keyValue,this.encoding)
          ).then(function(result){
            that.$message.success(that.$t('Add key successed'))
            that.dialogVisible = false
          }).catch(function(error) {
            that.$message.error(that.$t('Add key failed', error))
          })
          break
        case 'set':
          redis.saddBuffer(
            this.key,
            iconv.encode(this.keyValue,this.encoding)
          ).then(function(result){
            that.$message.success(that.$t('Add key successed'))
            that.dialogVisible = false
          }).catch(function(error) {
            that.$message.error(that.$t('Add key failed', error))
          })
          break
        case 'zset':
          redis.zaddBuffer(
            this.key,
            this.score,
            iconv.encode(this.keyValue,this.encoding)
          ).then(function(result){
            that.$message.success(that.$t('Add key successed'))
            that.dialogVisible = false
          }).catch(function(error) {
            that.$message.error(that.$t('Add key failed', error))
          })
          break

      }
     
    },
    checkInput() {
      if(!this.key || this.key.length <= 0){
        this.$message.error({
          message: this.$t('key missing'),
          showClose: true,
          duration: 10000})
        return false
      }
      if(!this.keyType || this.keyType.length <= 0){
        this.$message.error({
          message: this.$t('key type missing'),
          showClose: true,
          duration: 10000})
        return false
      }
      let findKeyType = _.find(this.surpportedType, (type) => {
        return type == this.keyType
      })
      if(!findKeyType) {
        this.$message.error({
          message: this.$t('key type invalid'),
          showClose: true,
          duration: 10000})
        return false
      }
      if((!this.fieldValue || this.fieldValue.length <= 0)
        && this.keyType === 'hash'){
        this.$message.error({
          message: this.$t('field missing'),
          showClose: true,
          duration: 10000})
        return false
      }
      if(this.keyType === 'zset')
      {
        if(!this.score || this.score.length <= 0){
          this.$message.error({
            message: this.$t('score missing'),
            showClose: true,
            duration: 10000})
          return false
        }else if(isNaN(this.score)){
          this.$message.error({
            message: this.$t('score must be number'),
            showClose: true,
            duration: 10000})
          return false
        }
      }
      
      return true
    }, 
    onKeyTypeChanged(newType) {

      this.fieldVisible = false
      this.scoreVisible = false
      switch(newType) {
        case 'hash':
          this.fieldVisible = true
          break
        case 'zset':
          this.scoreVisible = true
          break
        default:
          break
      }
    }
  }
}
</script>

<style scoped>

</style>