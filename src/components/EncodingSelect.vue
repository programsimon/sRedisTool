<template>
  <el-select v-model="encoding" :placeholder="$t('Select')" :size="size" @change="emitChange">
    <el-option
      v-for="encoding in encodingList"
      :key="encoding.name"
      :label="encoding.displayName"
      :value="encoding.name">
    </el-option>
  </el-select>
</template>

<script>
import config from '../config/app.config'

export default {
  name: 'EncodingSelect',
  props: {
    value: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    }
  },
  data(){
    return {
      encoding: '',
      encodingList: []
    }
  },
  watch: {
    encoding(val) {
      this.$emit('input', val);
    }
  },
  mounted() {
    this.$nextTick( function() {
      this.init()
    })
  },
  methods: {
    init() {
      this.encodingList = config.encoding
      if(this.value && this.value.length > 0){
        let enc = this.value
        enc = enc.replace(/[-|:| ]/g,'')
        enc = enc.toLowerCase()
        let e = _.find(this.encodingList, (encoding) => {
          return encoding.name === enc
        })
        if(e) {
          // this.emitChange(e.name)
          this.encoding = e.name
          this.$emit('input', this.encoding)
        }
      }
      
      if(!this.encoding || this.encoding.length <= 0) {
        let e = _.find(this.encodingList, (encoding) => {
          return encoding.name === config.defaultEncoding
        })
        if(e) {
          // this.emitChange(e.name)
          this.encoding = e.name
          this.$emit('input', this.encoding)
        }
      }
    },
    emitChange(val) {
      this.$emit('change', val);
    }
  }
}
</script>

<style>

</style>