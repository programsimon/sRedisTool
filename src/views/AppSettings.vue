<template>
  <div>
    <el-form label-width="150px">
      <el-form-item :label="$t('Language')" >
        <el-select v-model="settingsForm.locale" placeholder="$t('Select')">
          <el-option
            v-for="item in settingsForm.languages"
            :key="item"
            :label="$t(item)"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :plain="true" @click="initSettings" >{{$t('Cancel')}}</el-button>
        <el-button :plain="true" type="primary" @click="onChangeSetting">{{$t('Confirm')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import bridge from 'm/ElectronBridge'
import eventBus from 'm/EventBus'
import config from '../config/app.config'

export default {
  name: 'AppSettings',
  componentName: 'AppSettings',
  data () {
    return {
      settingsForm: {
        languages: [],
        locale: ''
      },
      orgSettings: {}
    }
  },
  mounted() {
    // register event from other componets
    eventBus.$on('showSettings', param => {
      this.initSettings()
    })

    this.initSettings()
  },
  methods: {
    initSettings() {
      this.settingsForm.languages = config.languages
      this.settingsForm.locale = bridge.getConfig('language')

      this.orgSettings = _.cloneDeep(this.settingsForm)
    },
    onChangeSetting() {
      // locale changed
      if(this.settingsForm.locale !== this.orgSettings.locale) {
        config.languages.find((lang) => {
          if(lang === this.settingsForm.locale) {
            bridge.setConfig('language', lang)
            return true
          }
        })
      }
      this.orgSettings = _.cloneDeep(this.settingsForm)
    }
  }
}
</script>