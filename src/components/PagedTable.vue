<template>
  <div>
    <el-table 
      :data="chunkedData[currentPage - 1]"
      :size="size"
      :width="width"
      :height="height"
      :max-height="maxHeight"
      :show-header="showHeader"
      border
      highlight-current-row
      @row-click="onRowClick"
      >
      <slot></slot>
    </el-table>
    <el-pagination
            @current-change="onCurrentChange"
            :page-size="pageSize"
            :current-page.sync="currentPage"
            :pager-count="5"
            layout="total, ->, prev, pager, next, jumper"
            :total="total">
    </el-pagination>
  </div>
</template>

<script>

export default {
  name: 'PagedTable',
  props: {
    data: {
        type: Array,
        default: function() {
          return [];
        }
      },
    size: String,
    width: [String, Number],
    height: [String, Number],
    maxHeight: [String, Number],
    showHeader: {
      type: Boolean,
      default: true
    },
    // props of pagination
    pageSize: {
      type: Number,
      default: 10
    },
    total: Number,
    
  },
  data() {
    return {
      currentPage: 1,
      chunkedData: []
    }
  },
  mounted() {
    this.setTableData()
  },
  watch: {
    data() {
      this.setTableData()
    }
  },
  methods: {
    onCurrentChange(page) {
      let needsSize = this.currentPage * this.pageSize
      if(needsSize > this.data.length
          && (needsSize - this.pageSize )< this.total) {
        this.emitLackedPageData(Math.min(needsSize, this.total))
      }
    },
    setTableData(){
      if(!this.currentPage || this.currentPage <= 0){
        this.currentPage = 1
      }
      if(!this.total || this.total <= 0){
        this.chunkedData = []
      }else {
        this.chunkedData = _.chunk(this.data, this.pageSize)
      }
      // this.$nextTick(() => {
      //   this.$forceUpdate()
      // })
    },
    emitLackedPageData(needsSize) {
      this.$emit('lackedData',needsSize)
    },
    onRowClick(row, column, event){
      this.$emit('row-click',row, column, event)
    }
  }
}
</script>

<style scoped>

</style>