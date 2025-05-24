<template>
	<div class="monitoring-dashboard">
		<!-- 基础信息面板 -->
		<el-row :gutter="10">
			<el-col :span="24">
				<chartpanel title="养老院概览" class="overview-panel">
					<el-row :gutter="10">
						<!-- 占地面积 -->
						<el-col :span="4">
							<div class="baseinfoitem flex text_color_10">
								<div class="icon">
									<el-icon><House /></el-icon>
								</div>
								<div class="flex_item">
									<div class="value">{{data.areaSize}}</div>
									<div class="name">占地面积</div>
								</div>
							</div>
						</el-col>
						<el-col :span="1">
							<div class="split_line_h"></div>
						</el-col>
						<!-- 床位数 -->
						<el-col :span="4">
							<div class="baseinfoitem flex text_color_11">
								<div class="icon">
									<el-icon><House /></el-icon>
								</div>
								<div class="flex_item">
									<div class="value">{{data.bedCount}}</div>
									<div class="name">总床位数</div>
								</div>
							</div>
						</el-col>
						<el-col :span="1">
							<div class="split_line_h"></div>
						</el-col>
						<!-- 入住人数 -->
						<el-col :span="4">
							<div class="baseinfoitem flex text_color_12">
								<div class="icon">
									<el-icon><User /></el-icon>
								</div>
								<div class="flex_item">
									<div class="value">{{data.residentCount}}</div>
									<div class="name">入住人数</div>
								</div>
							</div>
						</el-col>
						<el-col :span="1">
							<div class="split_line_h"></div>
						</el-col>
						<!-- 去世人数 -->
						<el-col :span="4">
							<div class="baseinfoitem flex text_color_13">
								<div class="icon">
									<el-icon><Remove /></el-icon>
								</div>
								<div class="flex_item">
									<div class="value">{{data.deathCount}}</div>
									<div class="name">去世人数</div>
								</div>
							</div>
						</el-col>
						<el-col :span="1">
							<div class="split_line_h"></div>
						</el-col>
						<!-- 转院人数 -->
						<el-col :span="4">
							<div class="baseinfoitem flex text_color_14">
								<div class="icon">
									<el-icon><SwitchButton /></el-icon>
								</div>
								<div class="flex_item">
									<div class="value">{{data.transferCount}}</div>
									<div class="name">转院人数</div>
								</div>
							</div>
						</el-col>
					</el-row>
				</chartpanel>
			</el-col>
		</el-row>
		
		<!-- 中部区域布局 - 将页面划分为三列 -->
		<el-row :gutter="10" class="main-content">
			<!-- 左侧区域 - 占据6列 -->
			<el-col :span="6">
				<!-- 区域概览 -->
				<chartpanel title="区域概览">
					<div class="area-overview">
						<div v-for="(area, index) in areaData" :key="index" class="area-item" 
							:class="{'area-item-active': area.occupancy > 90}">
							<div class="area-name">{{area.name}}</div>
							<div class="area-stats">
								<div class="stat-item">
									<span class="label">房间数：</span>
									<span class="value">{{area.rooms}}</span>
								</div>
								<div class="stat-item">
									<span class="label">入住率：</span>
									<el-progress 
										:percentage="area.occupancy" 
										:color="getOccupancyColor(area.occupancy)"
										:stroke-width="10"
										:show-text="false">
									</el-progress>
									<span class="value">{{area.occupancy}}%</span>
								</div>
							</div>
						</div>
					</div>
				</chartpanel>
				
				<!-- 七天天气预报 -->
				<chartpanel title="七天天气预报">
					<div class="weather-forecast">
						<div class="today-weather">
							<div class="city-selector">
								<span class="city-name">{{currentCity.value}}</span>
								<el-button type="primary" size="small" circle @click="showCitySelector = true">
									<el-icon><Location /></el-icon>
								</el-button>
							</div>
							<div class="weather-temp">{{weatherList[0].temp}}°C</div>
							<el-icon class="weather-icon large" :class="weatherList[0].icon"></el-icon>
							<div class="weather-desc">{{weatherList[0].desc}}</div>
							<div class="weather-date">今天 ({{weatherList[0].date}})</div>
						</div>
						<div class="future-weather">
							<div v-for="(weather, index) in weatherList.slice(1)" :key="index" class="weather-item">
								<div class="weather-date">{{weather.date}}</div>
								<el-icon class="weather-icon" :class="weather.icon"></el-icon>
								<div class="weather-temp">{{weather.temp}}°C</div>
							</div>
						</div>
					</div>
					
					<!-- 城市选择器弹窗 -->
					<el-dialog
						v-model="showCitySelector"
						title="选择城市"
						width="300px"
						center
					>
						<div class="city-list">
							<div class="cities-header">热门城市</div>
							<div class="cities-grid">
								<el-button 
									v-for="city in popularCities" 
									:key="city" 
									:type="city === currentCity.value ? 'primary' : 'default'"
									@click="changeCity(city)"
								>
									{{city}}
								</el-button>
							</div>
							
							<div class="search-city">
								<el-input
									v-model="searchCity"
									placeholder="输入城市名称"
									size="default"
									clearable
								>
									<template #append>
										<el-button @click="changeCity(searchCity)">
											<el-icon><Search /></el-icon>
										</el-button>
									</template>
								</el-input>
							</div>
						</div>
					</el-dialog>
				</chartpanel>
				
				<!-- 健康监测中心 - 移动到这里 -->
				<chartpanel title="健康监测中心">
					<div class="health-monitor">
						<div class="health-stats">
							<div class="health-stat-item">
								<div class="circle-progress" :style="{background: `conic-gradient(#4ecb73 ${healthData.normal * 3.6}deg, rgba(255,255,255,0.05) 0deg)`}">
									<div class="inner-circle">
										<span class="progress-value">{{healthData.normal}}%</span>
									</div>
								</div>
								<div class="stat-label">健康状况良好</div>
							</div>
							<div class="health-stat-item">
								<div class="circle-progress" :style="{background: `conic-gradient(#fbd437 ${healthData.attention * 3.6}deg, rgba(255,255,255,0.05) 0deg)`}">
									<div class="inner-circle">
										<span class="progress-value">{{healthData.attention}}%</span>
									</div>
								</div>
								<div class="stat-label">需要关注</div>
							</div>
							<div class="health-stat-item">
								<div class="circle-progress" :style="{background: `conic-gradient(#f2637b ${healthData.critical * 3.6}deg, rgba(255,255,255,0.05) 0deg)`}">
									<div class="inner-circle">
										<span class="progress-value">{{healthData.critical}}%</span>
									</div>
								</div>
								<div class="stat-label">紧急状况</div>
							</div>
						</div>
						<div class="health-records">
							<div v-for="(record, index) in healthRecords" :key="index" class="health-record-item">
								<div class="record-time">{{record.time}}</div>
								<div class="record-info">
									<span class="record-resident">{{record.resident}}</span>
									<span class="record-indicator" :class="record.status">{{record.indicator}}</span>
								</div>
								<div class="record-value">{{record.value}}</div>
							</div>
						</div>
					</div>
				</chartpanel>
			</el-col>
			
			<!-- 中间区域 - 占据12列 -->
			<el-col :span="12">
				<!-- 上部区域 -->
				<el-row :gutter="10">
					<el-col :span="12">
						<!-- 入住情况 -->
						<chartpanel title="入住情况">
							<div class="resident-status">
								<v-chart :option="residentOption" autoresize></v-chart>
							</div>
						</chartpanel>
					</el-col>
					<el-col :span="12">
						<!-- 监控中心 -->
						<chartpanel title="监控中心">
							<div class="monitor-overview">
								<div class="camera-stats">
									<div v-for="(stat, index) in monitorStats" :key="index" 
										class="stat-card" :class="{'stat-card-active': stat.type !== 'normal' && stat.value > 0}">
										<div class="stat-icon" :class="stat.type">
											<el-icon><component :is="stat.icon" /></el-icon>
										</div>
										<div class="stat-info">
											<div class="stat-value">{{stat.value}}</div>
											<div class="stat-label">{{stat.label}}</div>
										</div>
									</div>
								</div>
								<div class="camera-list">
									<vue3-seamless-scroll :list="cameraAlerts" class="camera-scroll">
										<div v-for="(alert, index) in cameraAlerts" :key="index" 
											class="alert-item" :class="{'new-camera-alert': index === 0}">
											<span class="alert-time">{{alert.time}}</span>
											<span class="alert-location">{{alert.location}}</span>
											<span class="alert-type" :class="alert.type">{{alert.message}}</span>
										</div>
									</vue3-seamless-scroll>
								</div>
							</div>
						</chartpanel>
					</el-col>
				</el-row>
				
				<!-- 中间图片区域 -->
				<chartpanel class="center-panel">
					<div class="center-image-container">
						<img src="/image/image.png" alt="养老院全景" class="center-image" />
						<!-- <video src="/video/001.mp4" autoplay muted loop alt="养老院全景" class="center-image"></video> -->
						<div class="image-overlay-text">
							<div class="main-title">乐龄慧护</div>
							<div class="sub-title">基于 VR +AI 的智慧养老院数字孪生平台</div>
						</div>
						<!-- 添加VR入口按钮 -->
						<div class="vr-entry-button" @click="showVrView = true">
							<el-button type="primary" class="vr-button" size="large" round>
								<el-icon><VideoCamera /></el-icon>
								进入VR全景
							</el-button>
						</div>
					</div>
				</chartpanel>
				
				<!-- 添加VR视图弹出层 -->
				<div class="vr-overlay" v-if="showVrView">
					<div class="vr-header">
						<div class="vr-title">养老院VR全景</div>
						<el-button @click="showVrView = false" class="close-vr-btn" circle>
							<el-icon><Close /></el-icon>
						</el-button>
					</div>
					<div class="vr-content">
						<iframe ref="vrIframe" :src="'/vr/index.html'" frameborder="0" class="vr-iframe"></iframe>
					</div>
				</div>
				
				<!-- 下部区域 -->
				<el-row :gutter="10">
					<el-col :span="12">
						<!-- 护理等级统计 -->
						<chartpanel title="护理能力评估雷达图">
							<div class="care-level-container">
								<div class="level-chart">
									<v-chart :option="levelOption" autoresize></v-chart>
								</div>
								<div class="level-legend">
									<div v-for="(level, index) in levelData" :key="index" class="level-legend-item">
										<span class="level-color" :style="{background: level.color}"></span>
										<span>{{level.name}}: {{level.desc}}</span>
									</div>
								</div>
							</div>
						</chartpanel>
					</el-col>
					<el-col :span="12">
						<!-- 告警事件 -->
						<chartpanel title="告警事件">
							<div class="alert-container">
								<vue3-seamless-scroll :list="alertList" class="alert-scroll">
									<div v-for="(alert, index) in alertList" :key="index" class="alert-item" :class="{'new-alert': index === 0 && !alert.handled}">
										<div class="alert-time">{{alert.time}}</div>
										<div class="alert-content">
											<el-tag size="small" :type="alert.type">{{alert.status}}</el-tag>
											<span class="alert-text">{{alert.content}}</span>
										</div>
										<div class="alert-status">
											<el-tag size="small" :type="alert.handled ? 'success' : 'danger'">
												{{alert.handled ? '已处理' : '未处理'}}
											</el-tag>
										</div>
									</div>
								</vue3-seamless-scroll>
							</div>
						</chartpanel>
					</el-col>
				</el-row>
			</el-col>
			
			<!-- 右侧区域 - 占据6列 -->
			<el-col :span="6">
				<!-- 最新新闻 -->
				<chartpanel title="最新新闻">
					<div class="news-container">
						<vue3-seamless-scroll :list="newsList" class="news-scroll">
							<div v-for="(news, index) in newsList" :key="index" class="news-item">
								<span class="news-time">{{news.time}}</span>
								<span class="news-title">{{news.title}}</span>
							</div>
						</vue3-seamless-scroll>
					</div>
				</chartpanel>
				
				<!-- 疾病统计 -->
				<chartpanel title="疾病统计">
					<div class="disease-wordcloud">
						<div class="word-cloud-container">
							<div v-for="(disease, index) in diseaseList" :key="index" 
								class="disease-word" 
								:style="{
									fontSize: disease.size + 'rem',
									color: disease.color,
									transform: `rotate(${disease.rotation}deg)`,
									left: disease.left + '%',
									top: disease.top + '%',
									opacity: disease.opacity
								}">
								{{disease.name}}
							</div>
						</div>
					</div>
				</chartpanel>
				
				<!-- 值班人员 -->
				<chartpanel title="值班人员">
					<div class="staff-container">
						<vue3-seamless-scroll :list="staffList" class="staff-scroll">
							<div v-for="(staff, index) in staffList" :key="index" class="staff-card">
								<el-avatar :size="40" :src="staff.avatar" />
								<div class="staff-info">
									<div class="staff-name">
										<span>{{staff.id}} {{staff.name}}</span>
										<el-tag size="small" :type="staff.status === '在岗' ? 'success' : 'info'">{{staff.status}}</el-tag>
									</div>
									<div class="staff-time">{{staff.time}}</div>
								</div>
								<div class="staff-contacts">
									<el-button circle size="small" type="primary">
										<el-icon><Phone /></el-icon>
									</el-button>
									<el-button circle size="small" type="success">
										<el-icon><ChatDotRound /></el-icon>
									</el-button>
								</div>
							</div>
						</vue3-seamless-scroll>
					</div>
				</chartpanel>
			</el-col>
		</el-row>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { User, House, Remove, SwitchButton, VideoCamera, Warning, CircleCheck, Phone, ChatDotRound, Location, Search, Close } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, RadarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import chartpanel from '@/components/chartpanel.vue'
import { Vue3SeamlessScroll } from "vue3-seamless-scroll"
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { callCozeBot, callCozeBotV3 } from '../utils/request.js'
import { getAiConfig } from '../assets/js/config.js'

// 注册必要的组件
use([
    CanvasRenderer,
    PieChart,
    BarChart,
    RadarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    RadarComponent
])

// 基础数据
const data = reactive({
	areaSize: '5000㎡',
	bedCount: '200',
	residentCount: '180',
	deathCount: '5',
	transferCount: '15'
})

// 区域数据 - 动态数据
const areaData = ref([
	{ name: 'A区', rooms: 50, occupancy: 95 },
	{ name: 'B区', rooms: 50, occupancy: 88 },
	{ name: 'C区', rooms: 50, occupancy: 92 },
	{ name: 'D区', rooms: 50, occupancy: 85 }
])

// 入住情况图表配置
const residentOption = reactive({
	tooltip: {
		trigger: 'item'
	},
	legend: {
		orient: 'vertical',
		left: 'left',
		textStyle: { color: '#fff' }
	},
	series: [{
		type: 'pie',
		radius: '50%',
		data: [
			{ value: 180, name: '已入住' },
			{ value: 20, name: '空床位' }
		],
		emphasis: {
			itemStyle: {
				shadowBlur: 10,
				shadowOffsetX: 0,
				shadowColor: 'rgba(0, 0, 0, 0.5)'
			}
		}
	}]
})

// 监控中心数据 - 动态数据
const monitorStats = ref([
	{ type: 'normal', icon: 'CircleCheck', value: 24, label: '正常运行' },
	{ type: 'warning', icon: 'Warning', value: 3, label: '异常预警' },
	{ type: 'error', icon: 'VideoCamera', value: 1, label: '设备故障' }
])

// 摄像头告警信息 - 动态数据
const cameraAlerts = ref([
	{ time: '10:30', location: 'A区走廊', message: '人员聚集', type: 'warning' },
	{ time: '10:15', location: 'B区门口', message: '设备离线', type: 'error' },
	{ time: '10:00', location: 'C区房间', message: '异常活动', type: 'warning' }
])

// 天气数据
const weatherList = reactive([
	{ date: '周一', icon: 'Sunny', temp: 25, desc: '晴' },
	{ date: '周二', icon: 'Cloudy', temp: 23, desc: '多云' },
	{ date: '周三', icon: 'Sunny', temp: 26, desc: '晴' },
	{ date: '周四', icon: 'Lightning', temp: 22, desc: '雷阵雨' },
	{ date: '周五', icon: 'Sunny', temp: 24, desc: '晴' },
	{ date: '周六', icon: 'Cloudy', temp: 20, desc: '阴' },
	{ date: '周日', icon: 'Sunny', temp: 25, desc: '晴' }
])

// 当前城市
const currentCity = ref('武汉')

// 城市选择器
const showCitySelector = ref(false)
const searchCity = ref('')
const popularCities = reactive(['北京', '上海', '广州', '深圳', '武汉', '南京', '杭州', '成都', '重庆', '西安', '长沙', '青岛'])

// 获取全局的menubar引用
const menubarRef = inject('menubarRef')

// 新闻数据
const newsList = reactive([
	{ time: '10:00', title: '养老院举办重阳节活动' },
	{ time: '09:30', title: '新增康复设施投入使用' },
	{ time: '09:00', title: '开展老年人心理健康讲座' },
	{ time: '08:30', title: '举办老年人趣味运动会' }
])

// 疾病词云列表数据
const diseaseList = reactive([
	{ name: '高血压', size: 1.8, color: '#FF6B6B', rotation: 0, left: 50, top: 30, opacity: 1 },
	{ name: '糖尿病', size: 1.6, color: '#4ECDC4', rotation: -15, left: 30, top: 50, opacity: 0.9 },
	{ name: '心脏病', size: 1.5, color: '#FFE66D', rotation: 10, left: 60, top: 20, opacity: 0.85 },
	{ name: '老年痴呆', size: 1.4, color: '#1A535C', rotation: -5, left: 15, top: 35, opacity: 0.8 },
	{ name: '骨质疏松', size: 1.3, color: '#FF9F1C', rotation: 20, left: 70, top: 60, opacity: 0.75 },
	{ name: '关节炎', size: 1.2, color: '#6A0572', rotation: -10, left: 40, top: 70, opacity: 0.7 },
	{ name: '中风', size: 1.1, color: '#F95738', rotation: 5, left: 20, top: 15, opacity: 0.65 },
	{ name: '肺炎', size: 1.0, color: '#3BCEAC', rotation: -20, left: 80, top: 40, opacity: 0.6 },
	{ name: '冠心病', size: 0.9, color: '#0D324D', rotation: 15, left: 50, top: 65, opacity: 0.55 },
	{ name: '白内障', size: 0.8, color: '#7B4B94', rotation: -8, left: 25, top: 45, opacity: 0.5 }
])

// 值班人员数据
const staffList = reactive([
	{ id: '004', name: '赵医生', avatar: '/image/img016.png', status: '在岗', time: '12:00-18:00' },
	{ id: '001', name: '张护士', avatar: '/image/img017.png', status: '在岗', time: '12:00-18:00' },
	{ id: '002', name: '李经理', avatar: '/image/img018.png', status: '休假', time: '08:00-16:00' },
	{ id: '007', name: '王护工', avatar: '/image/img019.png', status: '在岗', time: '08:00-16:00' },
	{ id: '009', name: '刘医生', avatar: '/image/img020.png', status: '在岗', time: '08:00-16:00' }
])

// 护理等级统计图表配置
const levelOption = reactive({
	color: ['#3aa1ff', '#4ecb73', '#fbd437', '#f2637b'],
	tooltip: {
		trigger: 'item'
	},
	radar: {
		// shape: 'circle',
		indicator: [
			{ name: '自理能力', max: 100 },
			{ name: '认知水平', max: 100 },
			{ name: '生活护理', max: 100 },
			{ name: '疾病管理', max: 100 },
			{ name: '心理状况', max: 100 }
		],
		splitArea: {
			areaStyle: {
				color: ['rgba(255, 255, 255, 0.05)']
			}
		},
		axisLine: {
			lineStyle: {
				color: 'rgba(255, 255, 255, 0.2)'
			}
		},
		splitLine: {
			lineStyle: {
				color: 'rgba(255, 255, 255, 0.2)'
			}
		},
		name: {
			textStyle: {
				color: '#fff'
			}
		}
	},
	series: [{
		name: '护理等级分析',
		type: 'radar',
		data: [
			{
				value: [90, 85, 95, 80, 88],
				name: '自理',
				areaStyle: {
					color: 'rgba(58, 161, 255, 0.3)'
				},
				lineStyle: {
					width: 2
				}
			},
			{
				value: [70, 65, 60, 60, 75],
				name: '介助',
				areaStyle: {
					color: 'rgba(78, 203, 115, 0.3)'
				},
				lineStyle: {
					width: 2
				}
			},
			{
				value: [40, 35, 30, 45, 50],
				name: '介护',
				areaStyle: {
					color: 'rgba(251, 212, 55, 0.3)'
				},
				lineStyle: {
					width: 2
				}
			},
			{
				value: [10, 15, 20, 25, 10],
				name: '特护',
				areaStyle: {
					color: 'rgba(242, 99, 123, 0.3)'
				},
				lineStyle: {
					width: 2
				}
			}
		]
	}]
})

// 告警事件数据 - 动态数据
const alertList = ref([
	{ time: '11:48:51', content: '101床#叶先生', status: '摔倒报警', type: 'danger', handled: true },
	{ time: '11:48:51', content: '201床#洪女士', status: '长时间离床', type: 'warning', handled: false },
	{ time: '11:48:51', content: '301床#刘女士', status: '长时间离床', type: 'warning', handled: false },
	{ time: '11:48:51', content: '105床#李先生', status: '摔倒报警', type: 'danger', handled: true },
	{ time: '11:48:51', content: '201床#钱女士', status: '长时间离床', type: 'warning', handled: false }
])

// 添加健康监测数据
const healthData = reactive({
	normal: 65,
	attention: 25,
	critical: 10
})

// 健康记录数据
const healthRecords = reactive([
	{ time: '12:30', resident: '203床#张先生', indicator: '血压', value: '145/90', status: 'attention' },
	{ time: '12:15', resident: '108床#王女士', indicator: '血糖', value: '8.9', status: 'attention' },
	{ time: '11:45', resident: '301床#刘先生', indicator: '体温', value: '38.5°C', status: 'critical' },
	{ time: '11:30', resident: '112床#周女士', indicator: '血压', value: '120/80', status: 'normal' },
	{ time: '11:00', resident: '205床#赵先生', indicator: '心率', value: '98', status: 'attention' }
])

// 护理等级数据说明
const levelData = reactive([
	{ name: '自理', desc: '可自主活动，基本生活自理', color: '#3aa1ff' },
	{ name: '介助', desc: '部分需要生活辅助，认知正常', color: '#4ecb73' },
	{ name: '介护', desc: '需要专业照护，日常活动受限', color: '#fbd437' },
	{ name: '特护', desc: '完全依赖护理，需24小时照顾', color: '#f2637b' }
])

// 获取入住率颜色的函数
const getOccupancyColor = (rate) => {
	if (rate >= 95) return '#F56C6C'  // 红色，非常高
	if (rate >= 90) return '#E6A23C'  // 橙色，较高
	if (rate >= 80) return '#67C23A'  // 绿色，正常
	return '#909399'                  // 灰色，较低
}

// 添加动态更新函数
const updateAreaData = () => {
	areaData.value = areaData.value.map(area => {
		return {
			...area,
			occupancy: Math.max(80, Math.min(98, area.occupancy + Math.floor(Math.random() * 5) - 2))
		}
	})
}

const updateMonitorStats = () => {
	monitorStats.value = monitorStats.value.map(stat => {
		let change = Math.floor(Math.random() * 3) - 1
		return {
			...stat,
			value: Math.max(0, stat.value + change)
		}
	})
}

const updateCameraAlerts = () => {
	// 随机位置
	const locations = ['A区走廊', 'B区门口', 'C区房间', 'D区活动室', 'E区餐厅']
	// 随机消息类型
	const messages = [
		{ msg: '人员聚集', type: 'warning' },
		{ msg: '设备离线', type: 'error' },
		{ msg: '异常活动', type: 'warning' },
		{ msg: '无人值守', type: 'warning' },
		{ msg: '信号丢失', type: 'error' }
	]
	
	// 随机添加新的告警
	if (Math.random() > 0.7) {
		const now = new Date()
		const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
		const randomLocation = locations[Math.floor(Math.random() * locations.length)]
		const randomMessage = messages[Math.floor(Math.random() * messages.length)]
		
		// 添加到列表头部
		cameraAlerts.value.unshift({
			time,
			location: randomLocation,
			message: randomMessage.msg,
			type: randomMessage.type
		})
		
		// 保持列表不超过5项
		if (cameraAlerts.value.length > 5) {
			cameraAlerts.value.pop()
		}
	}
}

const updateAlertList = () => {
	// 随机床位和姓氏
	const beds = ['101', '102', '103', '201', '202', '203', '301', '302', '303']
	const names = ['张', '王', '李', '赵', '钱', '孙', '周', '吴', '郑']
	const statusTypes = [
		{ status: '摔倒报警', type: 'danger' },
		{ status: '长时间离床', type: 'warning' },
		{ status: '呼叫求助', type: 'danger' },
		{ status: '体征异常', type: 'warning' },
		{ status: '活动异常', type: 'warning' }
	]
	
	// 随机添加新的告警事件
	if (Math.random() > 0.7) {
		const now = new Date()
		const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
		const randomBed = beds[Math.floor(Math.random() * beds.length)]
		const randomName = names[Math.floor(Math.random() * names.length)]
		const randomStatus = statusTypes[Math.floor(Math.random() * statusTypes.length)]
		
		// 添加到列表头部
		alertList.value.unshift({
			time,
			content: `${randomBed}床#${randomName}${Math.random() > 0.5 ? '先生' : '女士'}`,
			status: randomStatus.status,
			type: randomStatus.type,
			handled: false
		})
		
		// 保持列表不超过5项
		if (alertList.value.length > 5) {
			alertList.value.pop()
		}
	}
	
	// 随机将一些告警标记为已处理
	alertList.value = alertList.value.map(alert => {
		if (!alert.handled && Math.random() > 0.8) {
			return { ...alert, handled: true }
		}
		return alert
	})
}

// 添加健康监测动态更新函数
const updateHealthData = () => {
	// 随机变化健康状态百分比，但总和保持100%
	let normal = Math.floor(Math.random() * 20) + 55  // 55-75
	let attention = Math.floor(Math.random() * 15) + 15  // 15-30
	let critical = 100 - normal - attention

	healthData.normal = normal
	healthData.attention = attention
	healthData.critical = critical

	// 更新健康记录
	const indicators = [
		{ name: '血压', units: ['120/80', '135/85', '145/90', '150/95', '160/100'] },
		{ name: '血糖', units: ['5.4', '6.2', '7.1', '8.9', '10.2'] },
		{ name: '体温', units: ['36.5°C', '37.2°C', '37.8°C', '38.5°C', '39.1°C'] },
		{ name: '心率', units: ['65', '75', '85', '95', '110'] },
		{ name: '血氧', units: ['98%', '96%', '94%', '92%', '90%'] }
	]
	
	const residents = [
		'101床#张先生', '102床#王女士', '103床#李先生', '201床#赵女士', '202床#钱先生',
		'203床#孙女士', '204床#周先生', '301床#吴女士', '302床#郑先生', '303床#冯女士'
	]
	
	// 随机更新一条记录
	if (Math.random() > 0.5) {
		const now = new Date()
		const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
		const randomResident = residents[Math.floor(Math.random() * residents.length)]
		const randomIndicator = indicators[Math.floor(Math.random() * indicators.length)]
		const randomValue = randomIndicator.units[Math.floor(Math.random() * randomIndicator.units.length)]
		
		// 根据值确定状态
		let status = 'normal'
		if (randomIndicator.name === '血压' && randomValue.startsWith('15')) status = 'attention'
		if (randomIndicator.name === '血压' && randomValue.startsWith('16')) status = 'critical'
		if (randomIndicator.name === '血糖' && parseFloat(randomValue) > 7) status = 'attention'
		if (randomIndicator.name === '血糖' && parseFloat(randomValue) > 9) status = 'critical'
		if (randomIndicator.name === '体温' && randomValue.startsWith('37.8')) status = 'attention'
		if (randomIndicator.name === '体温' && (randomValue.startsWith('38') || randomValue.startsWith('39'))) status = 'critical'
		if (randomIndicator.name === '心率' && parseInt(randomValue) > 90) status = 'attention'
		if (randomIndicator.name === '心率' && parseInt(randomValue) > 100) status = 'critical'
		if (randomIndicator.name === '血氧' && randomValue.startsWith('94')) status = 'attention'
		if (randomIndicator.name === '血氧' && (randomValue.startsWith('92') || randomValue.startsWith('90'))) status = 'critical'
		
		// 添加到列表头部
		healthRecords.unshift({
			time,
			resident: randomResident,
			indicator: randomIndicator.name,
			value: randomValue,
			status
		})
		
		// 保持列表不超过5项
		if (healthRecords.length > 5) {
			healthRecords.pop()
		}
	}
}

// 更新疾病词云动画
const updateDiseaseWordcloud = () => {
	diseaseList.forEach(disease => {
		// 随机更新位置和旋转
		disease.left = Math.max(10, Math.min(80, disease.left + (Math.random() * 10 - 5)))
		disease.top = Math.max(10, Math.min(80, disease.top + (Math.random() * 10 - 5)))
		disease.rotation = Math.max(-25, Math.min(25, disease.rotation + (Math.random() * 8 - 4)))
		disease.opacity = Math.max(0.4, Math.min(1, disease.opacity + (Math.random() * 0.2 - 0.1)))
	})
}

// 获取天气数据函数
const fetchWeatherData = async () => {
	try {
		const aiConfig = getAiConfig()
		
		// 使用V1 API来获取天气数据
		const response = await callCozeBot(
			{ city: currentCity.value },
			aiConfig.weather.workflow_id,
			aiConfig.weather.app_id
		)
		
		// 解析API返回的数据
		if (response && response.code === 0) {
			try {
				// 检查data是否是字符串，如果是则解析
				let weatherData;
				if (typeof response.data === 'string') {
					weatherData = JSON.parse(response.data);
				} else {
					weatherData = response.data;
				}
				
				const forecastList = weatherData.output
				
				if (forecastList && Array.isArray(forecastList) && forecastList.length > 0) {
					// 获取今天的日期和星期
					const today = new Date()
					const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
					
					// 处理每一天的天气数据
					for (let i = 0; i < Math.min(forecastList.length, 7); i++) {
						const forecast = forecastList[i]
						const currentDate = new Date(today)
						currentDate.setDate(today.getDate() + i)
						const dayName = dayNames[currentDate.getDay()]
						
						// 计算平均温度
						const avgTemp = Math.round((parseInt(forecast.temp_high) + parseInt(forecast.temp_low)) / 2) 
						
						// 更新天气显示数据
						weatherList[i].temp = avgTemp
						weatherList[i].desc = forecast.weather_day || forecast.condition
						weatherList[i].icon = mapWeatherToIcon(forecast.weather_day || forecast.condition)
						weatherList[i].date = dayName
					}
					
					// 延迟更新菜单栏中的天气信息，确保menubarRef已经初始化
					setTimeout(() => {
						updateHeaderWeather()
					}, 500)
					
					// 显示成功消息
					ElMessage({
						message: `已成功获取${currentCity.value}的天气信息`,
						type: 'success',
						duration: 3000
					})
				} else {
					throw new Error('天气数据格式不正确')
				}
			} catch (parseError) {
				ElMessage.error('解析天气数据失败: ' + parseError.message)
			}
		} else {
			ElMessage.error(`获取天气数据失败: ${response?.msg || '未知错误'}`)
		}
	} catch (error) {
		ElMessage.error('获取天气数据失败，请检查网络连接')
	}
}

// 更新导航栏天气信息
const updateHeaderWeather = () => {
	try {
		// 如果有menubar组件引用，直接调用其方法更新天气
		if (menubarRef && menubarRef.value) {
			menubarRef.value.updateWeather({
				temp: weatherList[0].temp,
				desc: weatherList[0].desc,
				icon: weatherList[0].icon,
				city: currentCity.value
			})
		} else {
			console.warn('未找到menubar组件引用，无法更新导航栏天气')
		}
	} catch (error) {
		console.error('更新导航栏天气信息失败:', error)
	}
}

// 天气描述映射到图标
const mapWeatherToIcon = (desc) => {
	if (!desc) return 'Sunny'
	
	if (desc.includes('晴')) return 'Sunny'
	if (desc.includes('多云')) return 'Cloudy'
	if (desc.includes('阴')) return 'Cloudy'
	if (desc.includes('雨')) {
		if (desc.includes('雷')) return 'Lightning'
		return 'Rainy'
	}
	if (desc.includes('雪')) return 'Snowflake'
	if (desc.includes('雾')) return 'Foggy'
	if (desc.includes('霾')) return 'Foggy'
	
	return 'Sunny' // 默认
}

// 切换城市
const changeCity = (city) => {
	if (city && city.trim()) {
		currentCity.value = city.trim()
		showCitySelector.value = false
		searchCity.value = ''
		// 获取新城市的天气
		fetchWeatherData()
	} else {
		ElMessage.warning('请输入有效的城市名称')
	}
}

// VR视图控制
const showVrView = ref(false)
const vrIframe = ref(null)

// 设置定时更新
onMounted(() => {
	// 延迟获取天气数据以确保menubarRef已经初始化
	setTimeout(() => {
		fetchWeatherData()
	}, 1000)
	
	// 设置定时更新各个组件的数据
	setInterval(() => {
		updateAreaData()
		updateMonitorStats()
		updateCameraAlerts()
		updateAlertList()
		updateHealthData()
		updateDiseaseWordcloud()
	}, 8000) // 改为8秒更新一次，减少资源占用
})
</script>

<style scoped>
/* 页面整体样式 */
.monitoring-dashboard {
	min-height: 100vh;
	padding: 0.6rem;
	background: linear-gradient(135deg, #1a1f35, #2c3e50);
	color: #FFFFFF;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

/* 主要内容区样式 */
.main-content {
	flex: 1;
	display: flex;
	margin-top: 0.5vh !important;
}

/* 图表行样式 */
.chart-row {
	margin-top: 0.5vh !important;
}

/* 中间图片容器样式 */
.center-panel {
	margin: 0.5vh 0;
}

.center-image-container {
	position: relative;
	width: 100%;
	height: 20vh;
	overflow: hidden;
	border-radius: 8px;
}

/* 图表容器样式 */
.chart-container {
	height: 100%;
	min-height: 18vh;
	width: 100%;
}

/* 基础信息项样式 */
.baseinfoitem {
	width: 100%;
	height: 4vh;
	padding: 0.4rem;
	border-radius: 4px;
	background: rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(51, 153, 255, 0.2);
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
}

.baseinfoitem:hover {
	transform: translateY(-2px);
	background: rgba(255, 255, 255, 0.1);
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.baseinfoitem .icon {
	width: 25%;
	text-align: center;
	font-size: 1.2rem;
	line-height: 4vh;
}

.baseinfoitem .value {
	font-size: 1.2rem;
	font-weight: bold;
	margin-bottom: 0.2rem;
}

.baseinfoitem .name {
	font-size: 0.8rem;
	opacity: 0.8;
}

/* 分隔线样式 */
.split_line_h {
	width: 100%;
	height: 3vh;
	display: flex;
	justify-content: center;
	align-items: center;
}

.split_line_h::after {
	content: '';
	width: 1px;
	height: 50%;
	background: linear-gradient(180deg, transparent, rgba(51, 153, 255, 0.3), transparent);
}

/* 文字颜色类 */
.text_color_10 { color: #3399FF; }
.text_color_11 { color: #4CAF50; }
.text_color_12 { color: #FF9900; }
.text_color_13 { color: #FF5252; }
.text_color_14 { color: #9C27B0; }

/* 布局类 */
.flex {
	display: flex;
	align-items: center;
}

.flex_item {
	flex: 1;
	margin-left: 1rem;
}

/* 区域概览样式 */
.area-overview {
	padding: 0.4rem;
	height: 18vh;
	overflow-y: auto;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 0.4rem;
}

.area-item {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 0.8rem;
	transition: all 0.3s ease;
	border-left: 3px solid transparent;
}

.area-item-active {
	border-left: 3px solid #E6A23C;
	box-shadow: 0 0 10px rgba(230, 162, 60, 0.3);
}

.area-item:hover {
	transform: translateY(-2px);
	background: rgba(255, 255, 255, 0.1);
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.area-name {
	font-size: 1.1rem;
	font-weight: bold;
	margin-bottom: 0.5rem;
}

.area-stats {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.stat-item {
	font-size: 0.9rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.stat-item .el-progress {
	flex: 1;
	margin: 0 0.5rem;
}

/* 入住情况样式 */
.resident-status {
	height: 18vh;
}

/* 监控中心样式 */
.monitor-overview {
	height: 18vh;
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.camera-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 0.5rem;
	padding: 0.3rem;
}

.stat-card {
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 0.5rem;
	transition: all 0.3s ease;
	border: 1px solid transparent;
}

.stat-card-active {
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
	}
}

.stat-card:hover {
	transform: translateY(-2px);
	background: rgba(255, 255, 255, 0.1);
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.camera-list {
	flex: 1;
	overflow: hidden;
}

.camera-scroll {
	height: 100%;
	width: 100%;
}

.new-camera-alert {
	animation: highlight 2s ease-in-out;
}

@keyframes highlight {
	0% { background-color: rgba(255, 152, 0, 0.3); }
	100% { background-color: transparent; }
}

/* 天气样式 */
.weather-forecast {
	display: flex;
	flex-direction: column;
	height: 18vh;
}

.today-weather {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	margin-bottom: 0.5rem;
	position: relative;
}

.city-selector {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 0.3rem;
}

.city-name {
	font-size: 1rem;
	font-weight: bold;
	color: #4ECDC4;
	margin-right: 5px;
}

.today-weather .weather-temp {
	font-size: 1.8rem;
	font-weight: bold;
}

.today-weather .weather-icon {
	font-size: 2.5rem;
	margin: 0.2rem 0;
}

.future-weather {
	display: flex;
	justify-content: space-between;
	flex: 1;
}

.future-weather .weather-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0.3rem;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	flex: 1;
	margin: 0 0.2rem;
}

.future-weather .weather-date {
	font-size: 0.7rem;
	margin-bottom: 0.3rem;
}

.future-weather .weather-icon {
	font-size: 1.2rem;
	margin-bottom: 0.3rem;
}

.future-weather .weather-temp {
	font-size: 0.8rem;
}

/* 新闻样式 */
.news-container {
	height: 18vh;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 0.4rem;
}

.news-scroll {
	height: 100%;
}

.news-item {
	display: flex;
	padding: 0.8rem;
	border-bottom: 1px solid rgba(51, 153, 255, 0.2);
	transition: all 0.3s ease;
}

.news-item:hover {
	background: rgba(255, 255, 255, 0.1);
}

.news-time {
	width: 60px;
	color: #999;
}

.news-title {
	flex: 1;
	margin: 0 1rem;
}

/* 值班人员样式 */
.staff-container {
	height: 18vh;
	overflow: hidden;
}

.staff-scroll {
	height: 100%;
}

.staff-card {
	display: flex;
	align-items: center;
	padding: 0.5rem;
	margin-bottom: 0.5rem;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	transition: all 0.3s ease;
}

.staff-card:hover {
	background: rgba(255, 255, 255, 0.1);
	transform: translateY(-2px);
}

.staff-avatar {
	margin-right: 0.8rem;
}

.staff-info {
	flex: 1;
	margin-left: 0.8rem;
}

.staff-name {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.9rem;
	margin-bottom: 0.3rem;
}

.staff-time {
	font-size: 0.7rem;
	color: #999;
}

.staff-contacts {
	display: flex;
	gap: 0.5rem;
}

/* 护理等级统计样式 */
.care-level-container {
	height: 18vh;
	position: relative;
}

.level-chart {
	width: 100%;
	height: 100%;
}

.level-legend {
	position: absolute;
	top: 5px;
	right: 5px;
	background: rgba(0,0,0,0.5);
	padding: 5px;
	border-radius: 4px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 5px;
	font-size: 0.7rem;
}

.level-legend-item {
	display: flex;
	align-items: center;
}

.level-color {
	width: 10px;
	height: 10px;
	margin-right: 5px;
}

/* 告警事件样式 */
.alert-container {
	height: 18vh;
	overflow: hidden;
}

.alert-scroll {
	height: 100%;
}

.alert-item {
	display: flex;
	align-items: center;
	padding: 0.5rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	transition: background-color 0.3s ease;
}

.new-alert {
	animation: newAlert 2s ease-in-out;
}

@keyframes newAlert {
	0% { background-color: rgba(244, 67, 54, 0.3); }
	100% { background-color: transparent; }
}

.alert-item:hover {
	background: rgba(255, 255, 255, 0.1);
}

.alert-time {
	width: 60px;
	color: #999;
}

.alert-content {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.alert-text {
	font-size: 0.9rem;
}

.alert-status {
	margin-left: 0.8rem;
}

/* 响应式布局 */
@media (max-width: 1200px) {
	.area-overview {
		grid-template-columns: 1fr;
	}
	
	.camera-stats {
		grid-template-columns: 1fr;
	}
	
	.weather-forecast {
		flex-direction: column;
		height: auto;
	}
}

@media (max-width: 768px) {
	.baseinfoitem {
		height: auto;
		flex-direction: column;
		text-align: center;
	}
	
	.baseinfoitem .icon {
		width: 100%;
		line-height: 1;
		margin-bottom: 0.5rem;
	}
}

/* 中心图片容器样式 */
.center-image-container {
	position: relative;
	width: 100%;
	height: 25vh;
	overflow: hidden;
	border-radius: 8px;
}

.center-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.image-overlay-text {
	position: absolute;
	top: 1rem;
	right: 1rem;
	text-align: right;
	color: #fff;
	text-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
}

.main-title {
	font-size: 2.5rem;
	font-weight: bold;
	margin-bottom: 0.5rem;
	color: #7DA0CA;
}

.sub-title {
	font-size: 1.2rem;
	font-weight: 500;
}

/* 疾病词云样式 */
.disease-wordcloud {
	width: 100%;
	height: 18vh;
	overflow: hidden;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
}

.word-cloud-container {
	width: 100%;
	height: 100%;
	position: relative;
}

.disease-word {
	position: absolute;
	transition: all 3s ease;
	font-weight: bold;
	text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
	white-space: nowrap;
}

.disease-image {
	width: 100%;
	height: 100%;
	object-fit: contain;
	display: none;
}

/* 养老院概览特殊样式 */
.overview-panel {
	min-height: 8vh !important;
	padding: 1vh !important;
	margin-bottom: 0.6vh !important;
}

.overview-panel .chart_content {
	min-height: 6vh !important;
}

/* 健康监测中心样式 */
.health-monitor {
	height: 18vh;
	display: flex;
	flex-direction: column;
}

.health-stats {
	display: flex;
	justify-content: space-around;
	margin-bottom: 1vh;
}

.health-stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.circle-progress {
	width: 4.5vh;
	height: 4.5vh;
	border-radius: 50%;
	position: relative;
	margin-bottom: 0.5vh;
}

.inner-circle {
	position: absolute;
	top: 0.5vh;
	left: 0.5vh;
	width: calc(100% - 1vh);
	height: calc(100% - 1vh);
	border-radius: 50%;
	background: rgba(15, 23, 42, 0.85);
	display: flex;
	align-items: center;
	justify-content: center;
}

.progress-value {
	font-size: 0.8rem;
	font-weight: bold;
}

.stat-label {
	font-size: 0.7rem;
	text-align: center;
}

.health-records {
	flex: 1;
	overflow-y: auto;
}

.health-record-item {
	display: flex;
	align-items: center;
	padding: 0.4rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.record-time {
	width: 50px;
	font-size: 0.7rem;
	color: #999;
}

.record-info {
	flex: 1;
	display: flex;
	align-items: center;
}

.record-resident {
	font-size: 0.8rem;
	margin-right: 0.5rem;
}

.record-indicator {
	padding: 0.1rem 0.4rem;
	border-radius: 4px;
	font-size: 0.7rem;
}

.record-indicator.normal { background: rgba(76, 175, 80, 0.2); color: #4CAF50; }
.record-indicator.attention { background: rgba(255, 152, 0, 0.2); color: #FF9800; }
.record-indicator.critical { background: rgba(244, 67, 54, 0.2); color: #F44336; }

.record-value {
	width: 80px;
	text-align: right;
	font-size: 0.8rem;
	font-weight: bold;
}

/* 监控中心样式更新 - 保留原有样式 */
.stat-icon {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 0.8rem;
}

.stat-icon.normal { background: rgba(76, 175, 80, 0.2); color: #4CAF50; }
.stat-icon.warning { background: rgba(255, 152, 0, 0.2); color: #FF9800; }
.stat-icon.error { background: rgba(244, 67, 54, 0.2); color: #F44336; }

.stat-info {
	text-align: center;
}

.stat-value {
	font-size: 1.2rem;
	font-weight: bold;
}

.stat-label {
	font-size: 0.8rem;
	opacity: 0.8;
}

.alert-time {
	width: 60px;
	color: #999;
}

.alert-location {
	flex: 1;
	margin: 0 1rem;
}

.alert-type {
	padding: 0.2rem 0.5rem;
	border-radius: 4px;
	font-size: 0.8rem;
}

.alert-type.warning { background: #FF9800; }
.alert-type.error { background: #F44336; }

/* 城市选择器样式 */
.city-list {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.cities-header {
	font-size: 14px;
	color: #909399;
	margin-bottom: 5px;
}

.cities-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.search-city {
	margin-top: 15px;
}

/* VR入口按钮样式 */
.vr-entry-button {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10;
}

.vr-button {
	padding: 12px 24px;
	font-size: 16px;
	background: rgba(64, 158, 255, 0.8);
	box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
	transition: all 0.3s ease;
}

.vr-button:hover {
	background: rgba(64, 158, 255, 1);
	transform: scale(1.05);
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

/* VR视图弹出层样式 */
.vr-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.9);
	z-index: 9999;
	display: flex;
	flex-direction: column;
}

.vr-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 20px;
	background: rgba(30, 41, 59, 0.8);
}

.vr-title {
	font-size: 18px;
	font-weight: bold;
	color: #fff;
}

.close-vr-btn {
	background: transparent;
	border-color: rgba(255, 255, 255, 0.3);
	color: #fff;
}

.close-vr-btn:hover {
	background: rgba(255, 255, 255, 0.1);
}

.vr-content {
	flex: 1;
	overflow: hidden;
}

.vr-iframe {
	width: 100%;
	height: 100%;
	border: none;
}
</style>