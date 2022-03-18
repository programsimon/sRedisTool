<template>
  <el-container class="container">
    <el-header>
      <el-row>
        <el-col :span="3">
          <el-tag>{{$t('Key value')}}</el-tag>
        </el-col>
        <el-col :span="21">
          <el-form :inline="true" style="text-align:right">
            <el-form-item>
              <el-checkbox v-model="cmOptions.lineWrapping" size="mini">{{$t('Line wrap')}}</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-select v-model="modeName" size="mini" @change="onFormatChanged">
                <el-option 
                  v-for="mode in modes" 
                  :key="mode.name" 
                  :label="mode.name"
                  :value="mode.name">
                  </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-right:0px">
              <el-tooltip effect="light" :content="$t('Copy')" placement="bottom">
                <el-button 
                  type="info" 
                  plain 
                  icon="el-icon-document-copy" 
                  size="mini" 
                  v-clipboard:copy="text" 
                  v-clipboard:success="onCopySuccess"></el-button>
              </el-tooltip>
              <el-tooltip effect="light" :content="$t('Save')" placement="bottom">
                <el-button 
                  type="info" 
                  plain 
                  icon="el-icon-document-checked" 
                  size="mini" 
                  @click="onSave"></el-button>
              </el-tooltip>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <codemirror ref="cm" v-model="text" :options="cmOptions" @changes="onChanges" class="main-area"/>
    </el-main>
  </el-container>
</template>

<script>
import { codemirror } from 'vue-codemirror'

import 'codemirror/lib/codemirror.css'
// require active-line.js
import 'codemirror/addon/selection/active-line.js'
// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js'
// highlightSelectionMatches
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/match-highlighter.js'
// mode 
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'
// foldGutter
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/xml-fold.js'

// 编辑的主题文件
// import 'codemirror/theme/base16-light.css'

export default {
  name: 'ValueEditor',
  components: {
    codemirror
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return{
      text: '',
      modeName: 'Plain Text',
      modes:[
        {
          name: 'Plain Text',
          mode: null
        },
        {
          name: 'JSON',
          mode: {
            name: 'javascript',
            json: true
          }
        },
        {
          name: 'XML',
          mode: {
            name: 'xml'
          }
        }
      ],
      cmOptions: {
          tabSize: 4, // tab
          styleActiveLine: true, // 高亮选中行
          lineNumbers: true, // 显示行号
          styleSelectedText: true,
          line: true,
          foldGutter: true, // 块槽
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true }, // 可以启用该选项来突出显示当前选中的内容的所有实例
          mode: null,
          matchBrackets: true,
          showCursorWhenSelecting: true,
          theme: 'default', // 主题
          lineWrapping: false
      }
    }
  },
  watch: {
    value(val) {
      this.setShowText()
    }
  },
  mounted() {
    // set editor size
    this.$refs.cm.codemirror.setSize('100%','100%')
    this.text = this.value
  },
  methods: {
    setShowText(){
      if(!this.cmOptions.mode){
        this.text = this.value
      }else if(this.cmOptions.mode.name == 'javascript'){
        this.text = this.formatJson(this.value)
      }else if(this.cmOptions.mode.name == 'xml'){
        this.text = this.formatXml(this.value)
      }else {
        this.text = this.value
      }

    },
    onCopySuccess() {
      this.$message({
        message: this.$t('Copied to clipboard'),
        type: 'success'
      });
    },
    onSave() {
      this.$emit('saveData',null)
    },
    onChanges(cm, changes) {
      this.$emit('input', this.text)
    },
    onFormatChanged() {
      let mode = this.findMode(this.modeName)
      this.cmOptions.mode = mode;
      this.setShowText()
    },
    findMode(name) {
      let mode = _.find(this.modes, (mode) =>{
        return mode.name === name
      })
      if(mode) {
        return mode.mode
      }else{
        return null
      }
    },
    formatJson(t) {
      try {
        let json = JSON.stringify(JSON.parse(t), null, this.cmOptions.tabSize || 2)
        return json
      } catch (e) {
        return t
      }
    },
    formatXml(t) {
      var ar = t.replace(/>\s{0,}</g, '><')
        .replace(/</g, '~::~<')
        .replace(/\s*xmlns:/g, '~::~xmlns:')
        .replace(/\s*xmlns=/g, '~::~xmlns=')
        .split('~::~')
      var len = ar.length
      var inComment = false
      var deep = 0
      var str = ''
      var ix = 0

      var space = new Array(this.cmOptions.tabSize || 2).join(' ')

      var shift = ['\n'] // array of shifts
      for (ix = 0; ix < 100; ix++) {
        shift.push(shift[ix] + space)
      }
      for (ix = 0; ix < len; ix++) {
        // start comment or <![CDATA[...]]> or <!DOCTYPE //
        if (ar[ix].search(/<!/) > -1) {
          str += shift[deep] + ar[ix]
          inComment = true
          // end comment  or <![CDATA[...]]> //
          if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
            inComment = false
          }
        // end comment  or <![CDATA[...]]>
        } else if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
          str += ar[ix]
          inComment = false
        // <elm></elm>
        } else if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) &&
          /^<[\w:\-.,]+/.exec(ar[ix - 1]) === /^<\/[\w:\-.,]+/.exec(ar[ix])[0].replace('/', '')) {
          str += ar[ix]
          if (!inComment) deep--
        // <elm> //
        } else
        if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) === -1 && ar[ix].search(/\/>/) === -1) {
          str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix]
        } else
        // <elm>...</elm> //
        if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
          str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix]
        } else
        // </elm> //
        if (ar[ix].search(/<\//) > -1) {
          str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix]
        } else
        // <elm/> //
        if (ar[ix].search(/\/>/) > -1) {
          str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix]
        } else
        // <? xml ... ?> //
        if (ar[ix].search(/<\?/) > -1) {
          str += shift[deep] + ar[ix]
        } else
        // xmlns //
        if (ar[ix].search(/xmlns:/) > -1 || ar[ix].search(/xmlns=/) > -1) {
          str += shift[deep] + ar[ix]
        } else {
          str += ar[ix]
        }
      }

      return (str[0] === '\n') ? str.slice(1) : str
    }
  }
}
</script>

<style scoped>
.main-area{
  padding: 0px;
  width: calc(100% - 5px);
  height: calc(100% - 5px);
  border: 1px solid #DCDFE6;
}
.el-form-item{
  margin-bottom: 0px;
}
.container{
  height:100%;
  width: 100%;
}
.el-header{
  padding: 0;
  height: 50px !important; 
}
.el-main{
  padding: 0;
}
.el-tag{
  width: 70px;
}
</style>