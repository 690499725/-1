<template>
  <div class="member-stats">
    <el-row :gutter="10">
      <el-col :span="12">
        <chartpanel title="老人护理级别分布">
          <v-chart ref="careLevelChart" style="min-height: 300px;" :option="careLevelOption" autoresize></v-chart>
        </chartpanel>
      </el-col>
      <el-col :span="12">
        <chartpanel title="老人年龄分布">
          <v-chart ref="ageDistributionChart" style="min-height: 300px;" :option="ageDistributionOption" autoresize></v-chart>
        </chartpanel>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import chartpanel from "@/components/chartpanel.vue"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import {
  PieChart,
  BarChart
} from "echarts/charts"
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from "echarts/components"
import VChart from "vue-echarts"
import * as echarts from 'echarts'

// 注册必要的组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
])

const props = defineProps({
  memberList: {
    type: Array,
    default: () => []
  }
})

// 老人护理级别分布图表配置
const careLevelOption = computed(() => {
  // 统计各护理级别人数
  const careLevelData = {}
  props.memberList.forEach(member => {
    const level = member.care_level || '未设置'
    if (careLevelData[level]) {
      careLevelData[level]++
    } else {
      careLevelData[level] = 1
    }
  })

  // 转换为图表数据格式
  const chartData = Object.keys(careLevelData).map(key => ({
    name: key,
    value: careLevelData[key]
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    series: [
      {
        name: '护理级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#141414',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }
})

// 老人年龄分布图表配置
const ageDistributionOption = computed(() => {
  // 定义年龄段
  const ageGroups = {
    '60岁以下': 0,
    '60-69岁': 0,
    '70-79岁': 0,
    '80-89岁': 0,
    '90岁以上': 0
  }

  // 统计各年龄段人数
  props.memberList.forEach(member => {
    const age = parseInt(member.age)
    if (age < 60) {
      ageGroups['60岁以下']++
    } else if (age >= 60 && age < 70) {
      ageGroups['60-69岁']++
    } else if (age >= 70 && age < 80) {
      ageGroups['70-79岁']++
    } else if (age >= 80 && age < 90) {
      ageGroups['80-89岁']++
    } else {
      ageGroups['90岁以上']++
    }
  })

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: Object.keys(ageGroups),
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisLabel: {
        color: '#ccc'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ccc'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      axisLabel: {
        color: '#ccc'
      }
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: Object.values(ageGroups),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  }
})
</script>

<style scoped>
.member-stats {
  margin-top: 20px;
}
</style> 