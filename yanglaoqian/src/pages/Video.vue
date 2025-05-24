<template>
	<div class="monitoring-dashboard">
		<!-- 顶部控制区 -->
		<el-row :gutter="10" class="mb-2">
			<el-col :span="24">
				<chartpanel class="control-header">
					<div class="header-container">
						<!-- 左侧区域选择器 -->
						<div class="area-selector">
							<div class="area-label">监控区域</div>
							<div class="area-tabs">
								<el-radio-group v-model="activeArea" size="large">
									<el-radio-button v-for="area in ['A', 'B', 'C', 'D']" :key="area" :label="area">
										{{ area }}栋
									</el-radio-button>
								</el-radio-group>
				</div>
					</div>
						
						<!-- 右侧状态指示器 -->
						<div class="status-indicators">
							<div class="status-badge" v-for="(status, index) in statusTypes" :key="index">
								<div class="status-icon" :class="`status-${status.value}`">
									<el-icon><component :is="getStatusIcon(status.value)" /></el-icon>
					</div>
								<span class="status-label">{{ status.label }}</span>
								<span class="status-count">{{ getCameraCountByStatus(status.value) }}</span>
					</div>
				</div>
			</div>
		</chartpanel>
			</el-col>
		</el-row>

		<!-- 摄像头网格区域 -->
		<div class="cameras-container">
			<el-row :gutter="10">
				<el-col :span="24">
					<chartpanel class="camera-panel-container">
						<div v-if="filteredCameras.length === 0" class="no-cameras">
							<el-empty description="没有找到摄像头" />
						</div>
						<div v-else class="camera-grid">
							<div v-for="(camera, index) in filteredCameras" 
								:key="`${activeArea}-${index}`" 
								class="camera-card"
								:class="`border-${getStatusClass(camera.status)}`">
								
								<!-- 摄像头视频区域 -->
								<div class="camera-feed">
									<div class="feed-overlay" :class="`overlay-${getStatusClass(camera.status)}`"></div>
									<video 
										v-if="!camera.hasError" 
										:src="camera.src" 
										autoplay 
										loop 
										muted 
										@error="() => handleImageError(camera)"
										class="camera-video"
									></video>
									<img 
										v-else
										src="/image/no-signal.jpg" 
										alt="视频信号丢失"
										class="image-error"
									/>
									
									<!-- 错误信息 -->
									<div v-if="camera.hasError" class="error-message">
										<el-icon><VideoCameraFilled /></el-icon>
										<span>视频信号丢失</span>
									</div>
									
									<!-- 摄像头信息层 -->
									<div class="camera-info-layer">
										<div class="camera-header">
											<div class="camera-title">
												<el-icon><VideoCamera /></el-icon>
												<span>{{ camera.name }}</span>
											</div>
											<div class="camera-time">{{ currentTime }}</div>
										</div>
										
										<div class="camera-footer">
											<div class="camera-location">{{ getLocationName(camera) }}</div>
											<el-tag 
												:type="getStatusTagType(camera.status)" 
												size="small"
												effect="dark">
												{{ getStatusText(camera.status) }}
											</el-tag>
										</div>
									</div>
									
									<!-- 摄像头控制按钮 -->
									<div class="camera-actions">
										<el-button-group>
											<el-tooltip content="全屏查看" placement="top">
												<el-button type="primary" circle @click="handleFullscreen(index)">
													<el-icon><FullScreen /></el-icon>
												</el-button>
											</el-tooltip>
											<el-tooltip content="录像回放" placement="top">
												<el-button type="success" circle @click="handlePlayback(index)">
													<el-icon><VideoPlay /></el-icon>
												</el-button>
											</el-tooltip>
											<el-tooltip content="屏幕截图" placement="top">
												<el-button type="warning" circle @click="handleScreenshot(index)">
													<el-icon><Picture /></el-icon>
												</el-button>
											</el-tooltip>
											<el-tooltip content="更多设置" placement="top">
												<el-button type="info" circle @click="handleMore(index)">
													<el-icon><More /></el-icon>
												</el-button>
											</el-tooltip>
										</el-button-group>
									</div>
								</div>
					</div>
					</div>
				</chartpanel>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted,
		onBeforeUnmount
	} from 'vue';
	
	import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
	
	import { 
		VideoCamera, 
		FullScreen, 
		VideoPlay, 
		Picture, 
		More,
		CircleCheckFilled,
		WarningFilled,
		AlarmClock,
		CircleCloseFilled,
		VideoCameraFilled
	} from '@element-plus/icons-vue';
	import utils from '@/assets/js/utils.js'
	import { loadMapData } from '../utils/request.js'
	
	import chartpanel from '@/components/chartpanel.vue'
	import { ElMessage } from 'element-plus'
	
	// 当前选择的区域
	const activeArea = ref('A');
	
	// 时间显示
	const currentTime = ref('');
	let timeInterval = null;
	
	// 状态类型定义
	const statusTypes = [
		{ label: '正常', value: 'normal' },
		{ label: '异常', value: 'abnormal' },
		{ label: '告警', value: 'alarm' },
		{ label: '故障', value: 'fault' }
	];
	
	// 摄像头数据
	let datas = reactive([
		// A栋监控
		[{
		src:'/video/001.mp4',
			name:'监控点A01',
			location: 'A栋一楼大厅',
			status:'1',
			hasError: false
	},{
		src:'/video/002.mp4',
			name:'监控点A02',
			location: 'A栋二楼走廊',
			status:'1',
			hasError: false
	},{
		src:'/video/003.mp4',
			name:'监控点A03',
			location: 'A栋三楼休息区',
			status:'2',
			hasError: false
	},{
		src:'/video/004.mp4',
			name:'监控点A04',
			location: 'A栋四楼活动室',
			status:'3',
			hasError: false
	},{
		src:'/video/001.mp4',
			name:'监控点A05',
			location: 'A栋五楼走廊',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点A06',
			location: 'A栋六楼电梯',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点A07',
			location: 'A栋一楼前台',
			status:'2',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点A08',
			location: 'A栋二楼电梯口',
			status:'1',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点A09',
			location: 'A栋三楼医疗区',
			status:'3',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点A10',
			location: 'A栋四楼餐厅',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点A11',
			location: 'A栋五楼会议室',
			status:'2',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点A12',
			location: 'A栋六楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点A13',
			location: 'A栋七楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点A13',
			location: 'A栋八楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点A14',
			location: 'A栋九楼休息区',
			status:'3',
			hasError: false
		}],
		// B栋监控
		[{
			src:'/video/001.mp4',
			name:'监控点B01',
			location: 'B栋一楼前台',
			status:'1',
			hasError: false
		},{
		src:'/video/002.mp4',
			name:'监控点B02',
			location: 'B栋二楼餐厅',
			status:'2',
			hasError: false
	},{
		src:'/video/003.mp4',
			name:'监控点B03',
			location: 'B栋三楼休息区',
			status:'3',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点B04',
			location: 'B栋四楼医务室',
			status:'1',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点B05',
			location: 'B栋五楼走廊',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点B06',
			location: 'B栋六楼电梯',
			status:'2',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点B07',
			location: 'B栋一楼大厅',
			status:'1',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点B08',
			location: 'B栋二楼康复室',
			status:'3',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点B09',
			location: 'B栋三楼娱乐室',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点B10',
			location: 'B栋四楼走廊',
			status:'2',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点B11',
			location: 'B栋五楼活动室',
			status:'1',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点B12',
			location: 'B栋六楼会议室',
			status:'1',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点B13',
			location: 'B栋七楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点B14',
			location: 'B栋八楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点B15',
			location: 'B栋九楼休息区',
			status:'3',
			hasError: false
		}],
		// C栋监控
		[{
		src:'/video/001.mp4',
			name:'监控点C01',
			location: 'C栋一楼电梯口',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点C02',
			location: 'C栋二楼活动室',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点C03',
			location: 'C栋三楼走廊',
			status:'2',
			hasError: false
	},{
		src:'/video/004.mp4',
			name:'监控点C04',
			location: 'C栋四楼休息区',
			status:'3',
			hasError: false
	},{
		src:'/video/001.mp4',
			name:'监控点C05',
			location: 'C栋五楼走廊',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点C06',
			location: 'C栋六楼电梯',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点C07',
			location: 'C栋一楼大厅',
			status:'2',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点C08',
			location: 'C栋二楼会议室',
			status:'1',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点C09',
			location: 'C栋三楼餐厅',
			status:'3',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点C10',
			location: 'C栋四楼医务室',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点C11',
			location: 'C栋五楼康复区',
			status:'2',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点C12',
			location: 'C栋六楼休息室',
			status:'1',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点C13',
			location: 'C栋七楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点C13',
			location: 'C栋八楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点C14',
			location: 'C栋九楼休息区',
			status:'3',
			hasError: false
		}],
		// D栋监控
		[{
			src:'/video/001.mp4',
			name:'监控点D01',
			location: 'D栋一楼大厅',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点D02',
			location: 'D栋二楼走廊',
			status:'2',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点D03',
			location: 'D栋三楼休息区',
			status:'1',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点D04',
			location: 'D栋四楼医务室',
			status:'3',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点D05',
			location: 'D栋五楼走廊',
			status:'1',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点D06',
			location: 'D栋六楼电梯',
			status:'2',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点D07',
			location: 'D栋一楼前台',
			status:'3',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点D08',
			location: 'D栋二楼会议室',
			status:'1',
			hasError: false
		},{
			src:'/video/001.mp4',
			name:'监控点D09',
			location: 'D栋三楼娱乐室',
			status:'2',
			hasError: false
		},{
			src:'/video/002.mp4',
			name:'监控点D10',
			location: 'D栋四楼餐厅',
			status:'1',
			hasError: false
		},{
			src:'/video/003.mp4',
			name:'监控点D11',
			location: 'D栋五楼活动室',
			status:'1',
			hasError: false
		},{
			src:'/video/004.mp4',
			name:'监控点D12',
			location: 'D栋六楼休息区',
			status:'3',
			hasError: false
		}]
	]);
	
	// 根据区域筛选摄像头
	const filteredCameras = computed(() => {
		const areaIndex = ['A', 'B', 'C', 'D'].indexOf(activeArea.value);
		return areaIndex >= 0 ? datas[areaIndex] : [];
	});
	
	// 获取状态文本
	const getStatusText = (status) => {
		const statusMap = {
			'1': '正常',
			'2': '异常',
			'3': '告警',
			'4': '故障'
		};
		return statusMap[status] || '未知';
	};
	
	// 获取状态样式类名
	const getStatusClass = (status) => {
		const statusMap = {
			'1': 'normal',
			'2': 'abnormal',
			'3': 'alarm',
			'4': 'fault'
		};
		return statusMap[status] || 'unknown';
	};
	
	// 获取状态图标
	const getStatusIcon = (statusValue) => {
		const iconMap = {
			'normal': 'CircleCheckFilled',
			'abnormal': 'WarningFilled',
			'alarm': 'AlarmClock',
			'fault': 'CircleCloseFilled'
		};
		return iconMap[statusValue] || 'CircleCloseFilled';
	};
	
	// 获取Element UI状态标签类型
	const getStatusTagType = (status) => {
		const typeMap = {
			'1': 'success',
			'2': 'warning',
			'3': 'danger',
			'4': 'info'
		};
		return typeMap[status] || 'info';
	};
	
	// 获取监控点位置
	const getLocationName = (camera) => {
		return camera.location || '未知位置';
	};
	
	// 计算每种状态的摄像头数量
	const getCameraCountByStatus = (statusValue) => {
		let count = 0;
		const statusCode = {
			'normal': '1',
			'abnormal': '2',
			'alarm': '3',
			'fault': '4'
		}[statusValue];
		
		datas.forEach(row => {
			row.forEach(camera => {
				if (camera.status === statusCode) {
					count++;
				}
			});
		});
		
		return count;
	};
	
	// 更新当前时间
	const updateCurrentTime = () => {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		currentTime.value = `${hours}:${minutes}:${seconds}`;
	};
	
	// 修改视频错误处理
	const handleImageError = (camera) => {
		camera.hasError = true;
		console.error(`视频加载失败: ${camera.name} (${camera.src})`);
		ElMessage.error({
			message: `视频信号丢失: ${camera.name}`,
			duration: 3000
		});
	};
	
	// 处理全屏
	const handleFullscreen = (index) => {
		const camera = filteredCameras.value[index];
		ElMessage.success(`正在全屏显示 ${camera.name}`);
	};
	
	// 处理回放
	const handlePlayback = (index) => {
		const camera = filteredCameras.value[index];
		ElMessage.success(`正在回放 ${camera.name} 的录像`);
	};
	
	// 处理截图
	const handleScreenshot = (index) => {
		const camera = filteredCameras.value[index];
		ElMessage.success(`已保存 ${camera.name} 的截图`);
	};
	
	// 处理更多操作
	const handleMore = (index) => {
		const camera = filteredCameras.value[index];
		ElMessage.info(`更多操作：${camera.name}`);
	};
	
	onMounted(() => {
		updateCurrentTime();
		timeInterval = setInterval(updateCurrentTime, 1000);
	});
	
	onBeforeUnmount(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
	});
</script>

<style scoped>
.monitoring-dashboard {
	min-height: 100vh;
	padding: 1rem;
	background: linear-gradient(135deg, #1a1f35, #2c3e50);
	color: #FFFFFF;
}

.mb-2 {
	margin-bottom: 1rem;
}

/* 控制头部区域 */
.control-header {
	background: rgba(27, 38, 54, 0.9) !important;
	backdrop-filter: blur(10px) !important;
	border: 1px solid rgba(51, 153, 255, 0.2) !important;
	box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2) !important;
	border-radius: 12px !important;
	overflow: hidden;
}

.header-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.8rem;
}

.area-selector {
	display: flex;
	align-items: center;
	gap: 1.5rem;
}

.area-label {
	font-size: 1rem;
	font-weight: 500;
	color: #FFFFFF;
}

.status-indicators {
	display: flex;
	gap: 1rem;
}

.status-badge {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.4rem 0.8rem;
	border-radius: 8px;
	background: rgba(27, 38, 54, 0.8);
	border: 1px solid rgba(51, 153, 255, 0.2);
	transition: all 0.3s ease;
}

.status-badge:hover {
	background: rgba(51, 153, 255, 0.1);
	transform: translateY(-2px);
}

.status-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 50%;
}

.status-normal {
	background: rgba(76, 175, 80, 0.2);
	color: #4CAF50;
	box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.status-abnormal {
	background: rgba(255, 152, 0, 0.2);
	color: #FFA726;
	box-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
}

.status-alarm {
	background: rgba(244, 67, 54, 0.2);
	color: #EF5350;
	box-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
}

.status-fault {
	background: rgba(97, 97, 97, 0.2);
	color: #9E9E9E;
	box-shadow: 0 0 10px rgba(97, 97, 97, 0.3);
}

.status-label {
	font-size: 0.85rem;
	color: #FFFFFF;
}

.status-count {
	font-size: 0.85rem;
	font-weight: 600;
	padding: 0.1rem 0.4rem;
	border-radius: 4px;
	background: rgba(27, 38, 54, 0.7);
	color: #FFFFFF;
}

/* 摄像头网格区域 */
.camera-panel-container {
	min-height: calc(100vh - 130px);
	background: rgba(27, 38, 54, 0.9) !important;
	border: 1px solid rgba(51, 153, 255, 0.2) !important;
}

.camera-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 1rem;
	padding: 1rem;
}

.camera-card {
		position: relative;
	aspect-ratio: 16/9;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	transition: all 0.3s ease;
	transform-origin: center;
}

.camera-card:hover {
	transform: scale(1.02);
	z-index: 10;
}

.border-normal {
	box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
}

.border-abnormal {
	box-shadow: 0 0 15px rgba(255, 152, 0, 0.3);
}

.border-alarm {
	box-shadow: 0 0 15px rgba(244, 67, 54, 0.3);
	animation: pulse 1.5s infinite;
}

.border-fault {
	box-shadow: 0 0 15px rgba(97, 97, 97, 0.3);
}

@keyframes pulse {
	0% { box-shadow: 0 0 15px rgba(244, 67, 54, 0.3); }
	50% { box-shadow: 0 0 20px rgba(244, 67, 54, 0.6); }
	100% { box-shadow: 0 0 15px rgba(244, 67, 54, 0.3); }
}

.camera-video {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 8px;
}

.camera-feed {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: 8px;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.camera-feed video {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s ease;
}

.camera-feed:hover video {
	transform: scale(1.05);
}

.feed-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}

.overlay-normal {
	box-shadow: inset 0 0 30px rgba(76, 175, 80, 0.1);
}

.overlay-abnormal {
	box-shadow: inset 0 0 30px rgba(255, 152, 0, 0.1);
}

.overlay-alarm {
	box-shadow: inset 0 0 30px rgba(244, 67, 54, 0.2);
}

.overlay-fault {
	box-shadow: inset 0 0 30px rgba(97, 97, 97, 0.2);
}

.camera-info-layer {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	pointer-events: none;
}

.camera-header, .camera-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.6rem;
	background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
	pointer-events: auto;
}

.camera-footer {
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.camera-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.9rem;
	font-weight: 500;
}

.camera-location {
	font-size: 0.8rem;
}

.camera-actions {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) scale(0);
	z-index: 3;
	display: flex;
	gap: 0.5rem;
	opacity: 0;
	transition: all 0.3s ease;
	pointer-events: none;
}

.camera-card:hover .camera-actions {
	opacity: 1;
	transform: translate(-50%, -50%) scale(1);
	pointer-events: auto;
}

.image-error {
	filter: grayscale(100%) brightness(0.3);
}

.error-message {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	z-index: 3;
	background: rgba(0, 0, 0, 0.7);
	padding: 1rem;
	border-radius: 8px;
	color: #F44336;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.no-cameras {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 300px;
	color: #9E9E9E;
}

/* 响应式调整 */
@media (max-width: 768px) {
	.header-container {
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}
	
	.area-selector {
		width: 100%;
	}
	
	.status-indicators {
		width: 100%;
		flex-wrap: wrap;
	}
	}
</style>
