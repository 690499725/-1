import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

// 按需导入Element Plus图标
import { 
	House, 
	User, 
	Setting, 
	Menu, 
	Location, 
	Timer,
	Phone,
	ChatDotRound,
	Position,
	Close,
	Search,
	Remove,
	SwitchButton,
	Document,
	Calendar,
	Monitor,
	Bell,
	Warning
} from '@element-plus/icons-vue'

// 按需导入echarts组件
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, RadarChart } from 'echarts/charts'
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的ECharts组件
echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	LineChart,
	BarChart,
	PieChart,
	RadarChart,
	CanvasRenderer
])

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 注册必要的Element Plus图标
const icons = {
	House, 
	User, 
	Setting, 
	Menu, 
	Location, 
	Timer,
	Phone,
	ChatDotRound,
	Position,
	Close,
	Search,
	Remove,
	SwitchButton,
	Document,
	Calendar,
	Monitor,
	Bell,
	Warning
}

// 注册图标
for (const [key, component] of Object.entries(icons)) {
	app.component(key, component)
}

// 全局配置
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
	locale: zhCn,
})

// 全局挂载echarts
app.config.globalProperties.$echarts = echarts

app.mount('#app')
