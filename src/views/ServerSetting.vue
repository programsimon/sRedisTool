<template>
  <el-container>
    <el-aside width="40%">
      <el-menu ref="mnuServers" @select="onServerSelected">
        <el-submenu :index="group.id" v-for="group in serverGroups" :key="group.id">
          <template slot="title">
            <i class="el-icon-folder-add"></i>
            <span>{{group.name}}</span>
            <el-button-group class="server-group-button">
              <el-tooltip effect="light" :content="$t('Add Group')" placement="bottom">
                <el-button :plain="true" size="mini" icon="el-icon-circle-plus" @click.stop="onAddGroup(group.id)"/>
              </el-tooltip>
              <el-tooltip effect="light" :content="$t('Rename Group')" placement="bottom">
                <el-button :plain="true" size="mini" icon="el-icon-s-tools" @click.stop="onRenameGroup(group.id)"/>
              </el-tooltip>
              <el-tooltip effect="light" :content="$t('Delete Group')" placement="bottom">
                <el-button :plain="true" size="mini" icon="el-icon-delete-solid" @click.stop="onDeleteGroup(group.id)"/>
              </el-tooltip>
              <el-tooltip effect="light" :content="$t('Sort')" placement="bottom">
                <el-button :plain="true" size="mini" icon="el-icon-sort" @click.stop="onSortGroup(group.id)"/>
              </el-tooltip>
              <el-tooltip effect="light" :content="$t('Add Redis Server')" placement="bottom">
                <el-button :plain="true" size="mini" icon="el-icon-plus" @click.stop="onAddServer(group.id)"/>
              </el-tooltip>
            </el-button-group>
          </template>
          <el-menu-item :index="server.id" v-for="server in group.servers" :key="server.id">
            <template slot="title">
              <i class="el-icon-connection"></i>
              <span>{{server.name}}</span>
              <el-button-group class="server-group-button">
                <el-tooltip effect="light" :content="$t('Delete Server')" placement="bottom">
                  <el-button :plain="true" size="mini" icon="el-icon-delete" @click="onDeleteServer(server.id, group.id)"/>
                </el-tooltip>
                <el-tooltip effect="light" :content="$t('Open Server')" placement="bottom">
                  <el-button :plain="true" size="mini" icon="el-icon-folder-opened" @click="onOpenServer(server.id)"/>
                </el-tooltip>
              </el-button-group>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <el-form ref="serverForm" 
          label-position="left" 
          :model="curServer" 
          :rules="serverValidRules"
          inline-message
          status-icon
          label-width="150px" 
          v-show="serverEditVis">
          <el-form-item :label="$t('Server Name')" prop="name">
            <el-input v-model="curServer.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Host')" prop="host">
            <el-input v-model="curServer.host"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Port')" prop="port">
            <el-input v-model.number="curServer.port"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Password')">
            <el-input v-model="curServer.password" :show-password="!showPassword">
              <el-checkbox slot="append" :label="$t('Show Password')" v-model="showPassword"></el-checkbox>
            </el-input>
          </el-form-item>
          
          <el-collapse v-model="activeConfigSctions">
            <el-collapse-item name="cluster">
              <template slot="title">
                <i class="el-icon-s-operation" style="padding-right:5px"/>&nbsp;{{$t('Cluster config')}}
              </template>
              <el-form-item :label="$t('Cluster')" prop="cluster">
                <el-checkbox :label="$t('Cluster')" v-model="curServer.cluster"></el-checkbox>
                <el-tooltip effect="light" :content="$t('Add node help')" placement="bottom">
                  <el-button style="margin-left:10px" size="small" :plain="true" @click="onAddNode">{{$t('Add node')}}</el-button>
                </el-tooltip>
              </el-form-item>
              <div
                v-if="curServer.cluster">
              <el-form-item
                v-for="(node, index) in curServer.clusternodes"
                :key="index"
                :label="$t('Cluster node')"
                :prop="'clusternodes.' + index"
                :rules="{ validator: validateClusterNode, trigger: 'blur' }">
                <el-input size="mini" v-model="node.host"  :placeholder="$t('Host')" class="clsuter-node"></el-input>
                <el-input size="mini" v-model="node.port" :placeholder="$t('Port')" class="clsuter-node"></el-input>
                <el-input size="mini" v-model="node.password" :placeholder="$t('Password')" :show-password="true" class="clsuter-node"></el-input>
                <el-button style="clsuter-node" size="small" :plain="true" @click="onDeleteNode(node)">{{$t('Delete node')}}</el-button>
              </el-form-item>
              </div>
            </el-collapse-item>
            <el-collapse-item name="security">
              <template slot="title">
                <i class="el-icon-guide" style="padding-right:5px"/>&nbsp;{{$t('Security')}}
              </template>
              <el-form-item label-width="1px">
                <el-radio-group v-model="curServer.securitytype">
                  <el-radio label="none">{{$t('NONE')}}</el-radio>
                  <el-radio label="tls">{{$t('SSL/TLS')}}</el-radio>
                  <el-radio label="ssh">{{$t('SSH')}}</el-radio>
                </el-radio-group>
              </el-form-item>
              <input type="file" id="fileinput" style="display: none;" @change="onSelectedFile"/>
              <div v-if="curServer.securitytype=='tls'">
                <el-form-item :label="$t('Public key')">
                  <el-tooltip effect="light" :content="$t('public key tooltip')" placement="bottom">
                    <el-input v-model="curServer.sslcafile" readonly>
                      <el-button slot="append" :plain="true" @click="onSelectFile('sslcafile')">{{$t('Select File')}}</el-button>
                    </el-input>
                  </el-tooltip>
                </el-form-item>
                <el-form-item :label="$t('Private key')">
                  <el-tooltip effect="light" :content="$t('private key tooltip')" placement="bottom">
                    <el-input v-model="curServer.sslkeyfile" readonly>
                      <el-button slot="append" :plain="true" @click="onSelectFile('sslkeyfile')">{{$t('Select File')}}</el-button>
                    </el-input>
                  </el-tooltip>
                </el-form-item>
                <el-form-item :label="$t('Authority')">
                  <el-tooltip effect="light" :content="$t('authority tooltip')" placement="bottom">
                    <el-input v-model="curServer.sslcertfile" readonly>
                      <el-button slot="append" :plain="true" @click="onSelectFile('sslcertfile')">{{$t('Select File')}}</el-button>
                    </el-input>
                  </el-tooltip>
                </el-form-item>
              </div>
              <div v-if="curServer.securitytype=='ssh'">
                <el-form-item :label="$t('Host')">
                  <el-input v-model="curServer.sshhost"></el-input>
                </el-form-item>
                <el-form-item :label="$t('Port')">
                  <el-input v-model.number="curServer.sshport"></el-input>
                </el-form-item>
                <el-form-item :label="$t('SSH User Name')">
                  <el-input v-model="curServer.sshusername"></el-input>
                </el-form-item>
                <el-form-item :label="$t('Password')">
                  <el-input v-model="curServer.sshpassword" :show-password="!showSSHPassword">
                    <el-radio slot="prepend" v-model="curServer.sshkeytype" label="pass"><span></span></el-radio>
                    <el-checkbox slot="append" :label="$t('Show Password')" v-model="showSSHPassword"></el-checkbox>
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('Private key')">
                  <el-input v-model="curServer.sshkeyfile" readonly >
                    <el-radio slot="prepend" v-model="curServer.sshkeytype" label="keyfile"><span></span></el-radio>
                    <el-button slot="append" :plain="true" @click="onSelectFile('sshkeyfile')">{{$t('Select File')}}</el-button>
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('Passphrase')">
                  <el-input v-model="curServer.sshkeypassphrase" :show-password="!showSSHPassphrase" :disabled="!(curServer.sshkeytype == 'keyfile')">
\                    <el-checkbox slot="append" :label="$t('Show Password')" v-model="showSSHPassphrase"></el-checkbox>
                  </el-input>
                </el-form-item>
              </div>
            </el-collapse-item>
            <el-collapse-item name="advanced">
              <template slot="title">
                <i class="el-icon-s-home" style="padding-right:5px"/>&nbsp;{{$t('Advanced config')}}
              </template>
              <el-form-item :label="$t('Default database')" prop="defaultdatabase">
                <el-input v-model.number="curServer.defaultdatabase"></el-input>
              </el-form-item>
              <el-form-item :label="$t('Max load key size per time')" prop="maxloadkeysize">
                <el-tooltip effect="light" :content="$t('Maxloadkeysize help')" placement="bottom">
                  <el-input v-model.number="curServer.maxloadkeysize"></el-input>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('Encoding')" prop="encoding">
                <encoding-select v-model="curServer.encoding"></encoding-select>
              </el-form-item>
              <el-form-item :label="$t('Sort keys')" >
                <el-checkbox :label="$t('Sort')" v-model="curServer.sort"></el-checkbox>
              </el-form-item>
              <el-form-item :label="$t('Group show keys')" prop="groupshow">
                <el-checkbox :label="$t('Group show')" v-model="curServer.groupshow"></el-checkbox>
              </el-form-item>
              <el-form-item :label="$t('By head charactor size')" prop="substrsize">
                <el-input v-model.number="curServer.substrsize" :disabled="!curServer.groupshow || curServer.grouptype !== 'substr'">
                  <el-radio slot="prepend" v-model="curServer.grouptype" label="substr" :disabled="!curServer.groupshow"><span></span></el-radio>
                </el-input>
              </el-form-item>
              <el-form-item :label="$t('By split charactor')" prop="splitstr">
                <el-tooltip effect="light" :content="$t('Splitchar help')" placement="bottom">
                  <el-input 
                    v-model="curServer.splitstr" :disabled="!curServer.groupshow || curServer.grouptype !== 'split'">
                    <el-radio slot="prepend" v-model="curServer.grouptype" label="split" :disabled="!curServer.groupshow"><span></span></el-radio>
                  </el-input>
                </el-tooltip>
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </el-form>
      </el-main>
      <el-footer v-show="serverEditVis">
        <el-button :plain="true" @click="onTestServer">{{$t('Test Connection')}}</el-button>
        <el-button :plain="true" @click="onCloseServer" >{{$t('Close')}}</el-button>
        <el-button :plain="true" type="primary" @click="onSaveServer">{{$t('Save')}}</el-button>
      </el-footer>
    </el-container>
    <template>
      <el-dialog :title="groupNameTitle" :visible.sync="groupVis">
        <el-form>
          <el-form-item :label="$t('Group Name')" >
            <el-input v-model="curGroup.name" :placeholder="$t('Input group name')" autofocus="true"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button :plain="true" @click="groupVis = false">{{$t('Cancel')}}</el-button>
          <el-button type="primary" :plain="true" @click="onSaveGroup">{{$t('Confirm')}}</el-button>
        </div>
      </el-dialog>
    </template>
  </el-container>
</template>

<script>
import bridge from 'm/ElectronBridge'
import eventBus from 'm/EventBus'
import RedisPool from 'm/RedisPool'
import EncodingSelect from 'c/EncodingSelect.vue';

export default {
  name: "ServerSetting",
  components: { EncodingSelect },
  componentName: "ServerSetting",
  data() {
    let validator= {
      validateDefaultDatabase: (rule, value, callback) => {
        var reg = /^\d+$/;
        if(!reg.test(value)){
          callback(new Error(this.$t('Default database should be nonnegative integer')))
        }else {
          callback()
        }
      },
      validateMaxSize: (rule, value, callback) => {
        var reg = /^\d+$/;
        if(!reg.test(value)){
          callback(new Error(this.$t('Load key size should be nonnegative integer')))
        }else {
          callback()
        }
      },
      validateGroupShow:  (rule, value, callback) => {
        if(value 
          && this.curServer.grouptype !== 'split'
          && this.curServer.grouptype !== 'substr'
          ) {
          callback(new Error(this.$t('After selected group show,should select a group type')))
        }else{
          callback()
        }
      },
      validateGroupSubstr:  (rule, value, callback) => {
        if(this.curServer.grouptype !== 'substr') {
          callback()
          return
        }
        var reg = /^[1-9]\d*$/;
        if(!reg.test(value)){
          callback(new Error(this.$t('Head charactor size should be positive integer')))
        }else {
          callback()
        }
      },
      validateGroupSplit:  (rule, value, callback) => {
        if(this.curServer.grouptype !== 'split') {
          callback()
          return
        }
        if(!value || value.length <= 0) {
          callback(new Error(this.$t('Please input split charactor')))
        }else {
          callback()
        }
      }
      
    }
    return {
      groupVis: false,
      groupNameTitle: '',
      serverEditVis: false,
      showPassword: false,
      showSSHPassword: false,
      showSSHPassphrase: false,
      serverGroups: [],
      curGroup: {},
      curServer: {},
      serverValidRules: {
        name: [
          { required: true, message: this.$t('Please input server Name'), trigger: 'blur' }
        ],
        host: [
          { required: true, message: this.$t('Please input host address'), trigger: 'blur' }
        ],
        port: [
          { required: true, message: this.$t('Please input service port'), trigger: 'blur' },
          { type: 'number', message: this.$t('Service port should be number'), trigger: 'blur' }
        ],
        defaultdatabase: [
          { validator: validator.validateDefaultDatabase, trigger: 'blur' }
        ],
        maxloadkeysize: [
          { validator: validator.validateMaxSize, trigger: 'blur' }
        ],
        groupshow: [
          { validator: validator.validateGroupShow, trigger: 'none' }
        ],
        substrsize: [
          { validator: validator.validateGroupSubstr, trigger: 'blur' },
          { type: 'number', message: this.$t('Head charactor size should be positive integer'), trigger: 'blur' }
        ],
        splitstr: [
          { validator: validator.validateGroupSplit, trigger: 'blur' }
        ]
      },
      activeConfigSctions: [],
      activeSelectFileType: ''
    }
  },
  mounted() {
    // register event from other componets
    eventBus.$on("showSettings", (param) => {
      this.showServers();
    })

    this.showServers();
  },
  methods: {
    showServers() {
      this.serverGroups = bridge.getConfig('servergroups');
    },
    onAddGroup(groupId) {
      var idx = this.findGroupIndex(groupId)
      this.curGroup = {
        name : '',
        prevGroupIndex : idx,
        servers: []
      }
      this.groupNameTitle = this.$t('Add Group')
      this.groupVis = true
    },
    onRenameGroup(groupId) {
      var group = this.findGroup(groupId)
      if(!group) {
        return
      }
      this.curGroup = Object.assign({},group)
      this.groupNameTitle = this.$t('Rename Group')
      this.groupVis = true
    },
    onDeleteGroup(groupId) {
      var group = this.findGroup(groupId)
      if(!group) {
        return
      }
      if(this.serverGroups.length == 1) {
        this.$message.error(this.$t('delete last group'))
        return
      }
      this.$confirm(this.$t('delete group information',group), this.$t('Message'), {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          type: 'warning'
      }).then(() => {
        var idx = this.findGroupIndex(groupId)
        this.serverGroups.splice(idx, 1)
        bridge.setConfig('servergroups',this.serverGroups)
      }).catch(() => {

      })
    },
    onSortGroup(groupId) {
      var group = this.findGroup(groupId)
      if(!group) {
        return
      }
      group.servers = _.sortBy(group.servers,'name')

    },
    onSaveGroup() {
      if(!this.curGroup){
        return
      }
      if(!this.curGroup.name || this.curGroup.name.length <= 0){
        this.$message.error(this.$t('Please input group Name'))
        return
      }
      // rename group
      if(this.curGroup.id && this.curGroup.id.length > 0){
        var group = this.findGroup(this.curGroup.id)
        if(!group){
          return
        }
        group.name = this.curGroup.name
        bridge.setConfig('servergroups',this.serverGroups)
      }
      // new group
      else{
        this.curGroup.id = this.$uuid().replace(/-/g, '')
        if(this.curGroup.prevGroupIndex < 0){
          this.serverGroups.push(this.curGroup)
        }else{
          this.serverGroups.splice(this.curGroup.prevGroupIndex + 1, 0, this.curGroup)
        }
        bridge.setConfig('servergroups',this.serverGroups)
      }
      this.groupVis = false
    },
    onAddServer(groupId) {
      this.curServer = this.defaultServerInfo(groupId)
      this.doShowEditArea()
    },
    onServerSelected(serverId, ids) {
      var group = this.findGroup(ids[0])
      var server = this.findServer(serverId, group)
      this.curServer = _.defaultsDeep(_.cloneDeep(server),this.defaultServerInfo(group.id))
      this.doShowEditArea()
    },
    doShowEditArea() {
      this.showPassword = false
      this.serverEditVis = true
      this.activeConfigSctions = []
      this.$refs['serverForm'].resetFields()
    },
    onDeleteServer(serverId, groupId) {
      var group = this.findGroup(groupId)
      if(!group) {
        return
      }
      var server = this.findServer(serverId, group)
      if(!server) {
        return
      }
      this.$confirm(this.$t('delete server information',server), this.$t('Message'), {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          type: 'warning'
      }).then(() => {
        var index = this.findServerIndex(serverId, group)
        if(index >= 0){
          group.servers.splice(index,1)
          bridge.setConfig('servergroups',this.serverGroups)
        }
      }).catch(() => {

      });
    },
    onOpenServer(serverId) {
      var server = this.findServer(serverId)
      this.curServer = _.cloneDeep(server)
      eventBus.$emit('addConnection', server)
    },
    onSaveServer() {
      this.$refs['serverForm'].validate((valid) => {
        if (!valid) {
          return
        }
        var group = this.findGroup(this.curServer.groupid)
        if(!group) {
          // use the first one
          group = this.serverGroups[0]
          this.curServer.groupid = group.id
        }

        var serverIndex = this.findServerIndex(this.curServer.id, group)

        if(serverIndex >= 0) {
          var s = _.cloneDeepWith(this.curServer)
          // delete groupid prop
          s = _.omit(s, ['groupid']);
          group.servers[serverIndex] = s
        }else {
          this.curServer.id = this.$uuid().replace(/-/g, '')
          var s = _.cloneDeepWith(this.curServer)
          // delete groupid prop
          s = _.omit(s, ['groupid'])
          if(!group.servers){
            group.servers = []
          }
          group.servers.push(s)
        }
        this.$forceUpdate() 
        bridge.setConfig('servergroups',this.serverGroups)
        this.$message.success(this.$t('Save successed'))
      });
    },
    onCloseServer() {
      this.serverEditVis = false
    },
    onTestServer() {
      this.$refs['serverForm'].validate((valid) => {
        if (!valid) {
          this.$message.error(this.$t('after validated'))
          return
        }
        let serverCofnig = _.cloneDeep(this.curServer)
        serverCofnig.redisretrytimes = -1
        RedisPool.newRedis(serverCofnig)
          .then(redis => {
            redis.once('ready', async () => {
              this.$message.success(this.$t('Test connection successed'))
              RedisPool.closeRedis(redis.connectionId)
            })
            redis.once('error', async (error) => {
              this.$message.error(this.$t('Test connection failed', error))
              RedisPool.closeRedis(redis.connectionId)
            })
            redis.once('ClusterAllFailedError', async (error) => {
              this.$message.error(this.$t('Test connection failed', error))
              RedisPool.closeRedis(redis.connectionId)
            })

          })
      })
    },
    onEditServer(serverId) {
      var group= this.findGroupByServerId(serverId)
      this.$refs.mnuServers.open(group.id)
      this.onServerSelected(serverId, [group.id])
    },
    findGroup(groupId) {
      var group = this.serverGroups.find((group) => {
        if(group.id === groupId) {
          return true
        }
      })
      return group
    },
    findGroupIndex(groupId) {
      var idx = -1
      _.each(this.serverGroups, (group, index) => {
        if(group.id === groupId){
          idx = index
          return false
        }
      })
      return idx
    },
    findGroupByServerId(serverId) {
      var group = null
      _.each(this.serverGroups, (g, index) => {
        var server = g.servers.find((s) => {
          if(s.id === serverId){
            return true
          }
        })
        if(server) {
          group = g
          return true
        }
      })
      return group
    },
    findServer(serverId, group) {
      if(!serverId){
        return null
      }
      var server = null
      if(group) {
        server = group.servers.find((s) => {
          if(s.id === serverId){
            return true
          }
        })
      }
      if(server) {
        return server
      }
      _.each(this.serverGroups, (group, index) => {
        server = group.servers.find((s) => {
          if(s.id == serverId) {
            return true
          }
        })
        if(server) {
          return false
        }
      })
      return server
    },
    findServerIndex(serverId, group) {
      var idx = -1
      _.each(group.servers, (server, index) => {
        if(server.id === serverId){
          idx = index
          return false
        }
      })
      return idx
    },
    onAddNode() {
      if(!this.curServer.clusternodes || !Array.isArray(this.curServer.clusternodes)) {
        this.curServer.clusternodes = []
      }
      let node = {
        host: '',
        port: 6379,
        password: ''
      }
      this.curServer.clusternodes.push(node)
    },
    onDeleteNode(node) {
      var index = this.curServer.clusternodes.indexOf(node)
      if (index !== -1) {
        this.curServer.clusternodes.splice(index, 1)
      }
    },
    validateClusterNode(rule, node, callback) {
      if(this.curServer.cluster !== true) {
          callback()
          return
      }
      if(!node.host || node.host.length <= 0) {1
        callback(new Error(this.$t('Please input host address')))
      }else if(!node.port) {1
        callback(new Error(this.$t('Please input service port')))
      }else if(isNaN(node.port)) {
        callback(new Error(this.$t('Service port should be number')))
      }else {
        callback()
      }
    },
    onSelectFile(filetype) {
      if(!filetype){
        return
      }
      this.activeSelectFileType = filetype
      let fileInput = document.querySelector('#fileinput')
      
      if(this.activeSelectFileType == 'sslcafile'){
        fileInput.accept = '.pem,.crt'
      }else if(this.activeSelectFileType == 'sslkeyfile'){
        fileInput.accept = '.pem,.key'
      }else if(this.activeSelectFileType == 'sslcertfile'){
        fileInput.accept = '.pem,.crt'
      }else if(this.activeSelectFileType == 'sshkeyfile'){
        fileInput.accept = '*.*'
      }
      fileInput.click()
    },
    onSelectedFile(){
      let fileInput = document.querySelector('#fileinput')
      let filename = ''
      if(fileInput && fileInput.files && fileInput.files.length > 0){
        filename =  fileInput.files[0].path
      }
      if(!filename){
        return
      }
      if(this.activeSelectFileType == 'sslcafile'){
        this.curServer.sslcafile = filename
      }else if(this.activeSelectFileType == 'sslkeyfile'){
        this.curServer.sslkeyfile = filename
      }else if(this.activeSelectFileType == 'sslcertfile'){
        this.curServer.sslcertfile = filename
      }else if(this.activeSelectFileType == 'sshkeyfile'){
        this.curServer.sshkeyfile = filename
      }
    },
    defaultServerInfo(groupId){
      return {
        groupid: groupId,
        id: '',
        host: 'localhost',
        port: 6379,
        password: '',
        cluster: false,
        clusternodes: null,
        defaultdatabase: 0,
        maxloadkeysize: 1000,
        groupshow: false,
        grouptype: 'split',
        substrsize: 3,
        splitstr: ':',
        encoding: 'utf8',
        sort: false,
        securitytype: 'none',
        sslcafile: '',
        sslkeyfile: '',
        sslcertfile: '',
        sshhost: '',
        sshport: 22,
        sshusername: '',
        sshpassword: '',
        sshkeyfile: '',
        sshkeypassphrase: '',
        sshkeytype: 'pass'
      }
    }
  },
};
</script>
<style scoped>
.server-group-button{
  position: absolute;
  top: 50%;
  right: 40px;
  margin-top: -14px;
  font-size: 12px;
}
.el-container{
  height:calc(70vh - 132px)
}
.el-main{
  padding: 0 20px;
}
.el-button--mini{
  padding: 7px 3px;
}
.el-footer{
  padding: 10px 0px;
  text-align:right;
}
.clsuter-node{
  width: 20%;
  margin-right: 10px;
}
</style>