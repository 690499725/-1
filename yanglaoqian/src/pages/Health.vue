<template>
	<div class="health-page">
		<el-row :gutter="10" style="margin:0px;padding:0px;margin-top: 1vh;">
			<el-col :span="4">
				<!-- 老人列表 -->
				<chartpanel title="" class="left-panel" style="height: calc(100vh - 20px);">
					<div style="text-align: center;padding-top: 1vh;">
						<el-input v-model="keywords" class="keywords" placeholder="请输入关键字" :prefix-icon="Search" />
					</div>
					<el-divider style="margin: 1vh 0 0 0;border-top-color: rgba(255,255,255,0.1);" />
					<el-scrollbar height="calc(100vh - 120px)" class="members">
						<div v-for="(item,index) in memberList" :key="item.id" class="member-item" 
							@click="selectMember(index)" :class="{'member-item-seleted': index === currentMemberIndex}">
							<div class="inner flex">
								<div class="icon">
									<el-icon>
										<Avatar />
									</el-icon>
								</div>
								<div class="flex_item">
									<div class="name">{{item.name}}</div>
									<div class="desc">
										<div class="flex">
											<div class="flex_item">年龄：{{item.age}}岁</div>
											<div class="flex_item">性别：{{item.gender}}</div>
										</div>
										<div class="flex">
											<div class="flex_item">级别：{{item.care_level}}</div>
											<div class="flex_item">床位：{{item.bed_number || '未分配'}}</div>
										</div>
									</div>
								</div>
								<div class="operations">
									<el-dropdown trigger="click" @command="handleCommand">
										<span class="el-dropdown-link">
											<el-icon><more /></el-icon>
										</span>
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item :command="{type: 'edit', index}">编辑</el-dropdown-item>
												<el-dropdown-item :command="{type: 'assign', index}" v-if="!item.bed_id">分配床位</el-dropdown-item>
												<el-dropdown-item :command="{type: 'unassign', index}" v-if="item.bed_id">取消床位</el-dropdown-item>
												<el-dropdown-item :command="{type: 'delete', index}" divided type="danger">删除</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
								</div>
							</div>
						</div>
					</el-scrollbar>
				</chartpanel>
			</el-col>
			<el-col :span="20">
				<div class="right-content">
					<el-row :gutter="10" style="margin:0px;padding:0px;">
						<el-col :span="12">
							<!-- 老人明细 -->
							<chartpanel title="老人明细" style="height: 29.7vh;">
								<div class="flex baseinfo" v-if="currentMember">
									<div class="icon">
										<el-icon>
											<Avatar />
										</el-icon>
										<!-- 紧急定位按钮 -->
										<div class="emergency-btn">
											<el-button type="danger" size="small" @click="openLocationMap" icon="Location">紧急定位</el-button>
										</div>
									</div>
									<div class="flex_item">
										<div class="name">{{currentMember.name}}</div>
										<div class="desc">
											<div class="flex">
												<div class="flex_item">
													性别：{{currentMember.gender}}
												</div>
												<div class="flex_item">
													年龄：{{currentMember.age}}岁
												</div>
											</div>
											<div class="flex">
												<div class="flex_item">
													家属：{{currentMember.emergency_contact || '未填写'}}
												</div>
												<div class="flex_item">
													电话：{{currentMember.emergency_phone || '未填写'}}
												</div>
											</div>
											<div class="flex">
												<div class="flex_item">
													床位：{{currentMember.bed_number || '未分配'}}
												</div>
												<div class="flex_item">
													状态：<span :class="getStatusClass(currentMember.status)">{{getStatusText(currentMember.status)}}</span>
												</div>
											</div>
											<div class="flex">
												<div class="flex_item">
													护理级别：{{currentMember.care_level}}
												</div>
												<div class="flex_item">
													责任护工：{{currentMember.caregiver || '未分配'}}
												</div>
											</div>
											<div>
												<span>健康状况：</span>
												<template v-if="currentMember.health_conditions && currentMember.health_conditions.length">
													<el-tag effect="dark" class="tag" v-for="condition in currentMember.health_conditions" 
														:key="condition.id || condition.name" :type="getConditionType(condition.severity)">
														{{condition.name}}
													</el-tag>
												</template>
												<template v-else>
													<span>暂无记录</span>
												</template>
											</div>
											<!-- 添加健康详情显示 -->
											<div v-if="currentMember.health_detail">
												<span>健康详情：</span>
												<span class="health-detail-text">{{currentMember.health_detail}}</span>
											</div>
										</div>
									</div>
								</div>
								<div v-else class="no-data">
									请选择老人
								</div>
							</chartpanel>
						</el-col>
						<el-col :span="12">
							<!-- 整体健康评估 -->
							<chartpanel title="整体健康评估" style="height: 29.7vh;">
								<v-chart ref="assessmentChart" style="min-height: 25vh;" :option="allchartoption" :init-options="chartOptions" autoresize></v-chart>
							</chartpanel>
						</el-col>
					</el-row>
					<el-row :gutter="10" style="margin:0px;padding:0px;margin-top: 1vh;">
						<el-col :span="12">
							<!-- 心率图 -->
							<chartpanel title="心率统计" style="height: 29.7vh;">
								<v-chart ref="heartChart" style="min-height: 25vh;" :option="heartchartoption" :init-options="chartOptions" autoresize></v-chart>
							</chartpanel>
						</el-col>
						<el-col :span="12">
							<!-- 血压图 -->
							<chartpanel title="血压统计" style="height: 29.7vh;">
								<v-chart ref="bloodChart" style="min-height: 25vh;" :option="bloorchartoption" :init-options="chartOptions" autoresize></v-chart>
							</chartpanel>
						</el-col>
					</el-row>
					<el-row :gutter="10" style="margin:0px;padding:0px;margin-top: 1vh;">
						<el-col :span="12">
							<!-- 血氧图 -->
							<chartpanel title="血氧统计" style="height: 29.7vh;">
								<v-chart ref="oxygenChart" style="min-height: 25vh;" :option="oxygenchartoption" :init-options="chartOptions" autoresize></v-chart>
							</chartpanel>
						</el-col>
						<el-col :span="12">
							<!-- 睡眠状况 -->
							<chartpanel title="睡眠状况" style="height: 29.7vh;">
								<v-chart ref="sleepChart" style="min-height: 25vh;" :option="sleepchartoption" :init-options="chartOptions" autoresize></v-chart>
							</chartpanel>
						</el-col>
					</el-row>
				</div>
			</el-col>
		</el-row>
	</div>

	<!-- 添加/编辑老人对话框 -->
	<el-dialog
		:title="dialogType === 'add' ? '添加老人' : '编辑老人'"
		v-model="memberDialogVisible"
		width="500px"
	>
		<member-form ref="memberFormRef" :initial-form="memberForm" />
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="memberDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitMemberForm">确定</el-button>
			</span>
		</template>
	</el-dialog>

	<!-- 分配床位对话框 -->
	<el-dialog
		title="分配床位"
		v-model="assignBedDialogVisible"
		width="500px"
	>
		<el-form :model="assignForm" :rules="assignRules" ref="assignFormRef" label-width="100px">
			<el-form-item label="老人姓名">
				<el-input v-model="assignForm.member_name" disabled />
			</el-form-item>
			<el-form-item label="床位" prop="bed_id">
				<el-select v-model="assignForm.bed_id" placeholder="请选择床位" filterable>
					<el-option
						v-for="bed in availableBeds"
						:key="bed.id"
						:label="`${bed.building} - ${bed.room_number} - ${bed.bed_number}`"
						:value="bed.id"
					/>
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="assignBedDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitAssignBed">确定</el-button>
			</span>
		</template>
	</el-dialog>

	<!-- 紧急定位地图对话框 -->
	<el-dialog
		title="紧急定位"
		v-model="locationMapVisible"
		width="80%"
		:destroy-on-close="true"
		@closed="closeLocationMap"
		:close-on-press-escape="true"
		:close-on-click-modal="false"
	>
		<div class="location-map-container">
			<el-button class="back-button" size="large" type="primary" icon="Back" @click="locationMapVisible = false">返回</el-button>
			<div id="location-map" style="width: 100%; height: 60vh;"></div>
			<div class="elder-info-panel">
				<el-descriptions title="老人信息" :column="2" border>
					<el-descriptions-item label="姓名">{{currentMember.name}}</el-descriptions-item>
					<el-descriptions-item label="年龄">{{currentMember.age}}岁</el-descriptions-item>
					<el-descriptions-item label="床位">{{currentMember.bed_number || '未分配'}}</el-descriptions-item>
					<el-descriptions-item label="状态">
						<el-tag :type="getStatusType(currentMember.status)">
							{{getStatusText(currentMember.status)}}
						</el-tag>
					</el-descriptions-item>
					<el-descriptions-item label="责任护工">{{currentMember.caregiver || '未分配'}}</el-descriptions-item>
					<el-descriptions-item label="紧急联系人">{{currentMember.emergency_contact || '未填写'}}</el-descriptions-item>
					<el-descriptions-item label="健康状况" :span="2">
						<template v-if="currentMember.health_conditions && currentMember.health_conditions.length">
							<el-tag effect="dark" class="tag" v-for="condition in currentMember.health_conditions" 
								:key="condition.id || condition.name" :type="getConditionType(condition.severity)">
								{{condition.name}}
							</el-tag>
						</template>
						<template v-else>
							<span>暂无记录</span>
						</template>
					</el-descriptions-item>
				</el-descriptions>
				<div v-if="currentMember.health_detail">
					<span>健康详情：</span>
					<div>{{currentMember.health_detail}}</div>
				</div>
			</div>
			</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="locationMapVisible = false">关闭</el-button>
				<el-button type="primary" @click="refreshLocation">刷新位置</el-button>
				<el-button type="success" @click="callCaregiver">联系责任护工</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted,
		onBeforeUnmount,
		nextTick,
		provide
	} from 'vue';

	import { ElMessage, ElMessageBox } from 'element-plus';

	import VChart, {
		THEME_KEY
	} from "vue-echarts";


	
	import { getMembers, createMember, updateMember, deleteMember } from '../api/member';
	import { getBeds, assignBed, unassignBed, getBedDetail } from '../api/bed';
	import {  addHealthData } from '../api/health';

	import * as echarts from 'echarts';
	import 'echarts-extension-amap';
	import 'echarts-wordcloud';
	import 'echarts-liquidfill';

	import Swiper from 'swiper';
	import 'swiper/dist/css/swiper.min.css';

	import chartpanel from '@/components/chartpanel.vue'
	import MemberForm from '@/components/MemberForm.vue'
	
	// 设置echarts主题和性能配置
	provide(THEME_KEY, 'dark');
	const chartOptions = {
		// 设置渲染器为SVG，在一些场景下可能比Canvas性能更好
		renderer: 'svg',
		// 启用脏矩形检测，提高性能
		useDirtyRect: true
	};

	const $echarts = echarts;

	// 搜索关键字
	const keywords = ref('');
	
	// 老人列表数据
	const memberList = ref([]);
	const currentMemberIndex = ref(-1);
	const currentMember = computed(() => {
		if (currentMemberIndex.value >= 0 && memberList.value.length > currentMemberIndex.value) {
			return memberList.value[currentMemberIndex.value];
		}
		return null;
	});
	import { Search, Avatar, More } from '@element-plus/icons-vue';
	// 图表配置
	const heartchartoption = ref({});
	const bloorchartoption = ref({});
	const oxygenchartoption = ref({});
	const sleepchartoption = ref({});
	const allchartoption = ref({});
	
	// 定时器
	let chartUpdateTimer = null;

	// 初始化图表基本配置
	const initChartOptions = () => {
		// 心率图配置
		heartchartoption.value = {
			tooltip: {
				trigger: 'axis'
				},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
			},
			yAxis: {
				type: 'value',
				name: '次/分钟',
				min: 40,
				max: 120
			},
			series: [
				{
					name: '心率',
					type: 'line',
					data: [75, 78, 82, 86, 76, 72, 74],
					smooth: true,
					itemStyle: {
						color: '#FF4500'
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{
								offset: 0,
								color: 'rgba(255, 69, 0, 0.6)'
							},
							{
								offset: 1,
								color: 'rgba(255, 69, 0, 0.1)'
							}
						])
					},
					markArea: {
						itemStyle: {
							color: 'rgba(255, 173, 177, 0.2)'
						},
						data: [
							[
								{
									yAxis: 100
								},
								{
									yAxis: 120
								}
							],
							[
								{
									yAxis: 40
								},
								{
									yAxis: 60
								}
							]
						]
					}
				}
			]
		};

		// 血压图配置
		bloorchartoption.value = {
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: ['收缩压', '舒张压'],
				textStyle: {
					color: '#ddd'
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
			},
			yAxis: {
				type: 'value',
				name: 'mmHg',
				min: 40,
				max: 200
			},
			series: [
				{
					name: '收缩压',
				type: 'line',
					data: [135, 140, 145, 138, 132, 130, 135],
					smooth: true,
				itemStyle: {
						color: '#FF6347'
					}
				},
				{
					name: '舒张压',
					type: 'line',
					data: [85, 88, 90, 86, 82, 80, 84],
					smooth: true,
					itemStyle: {
						color: '#4682B4'
					}
				}
			]
		};

		// 血氧图配置
		oxygenchartoption.value = {
			tooltip: {
				formatter: '{a} <br/>{b} : {c}%'
			},
			series: [
				{
					name: '血氧饱和度',
					type: 'gauge',
					detail: {
						formatter: '{value}%',
						fontSize: 20
					},
					data: [{ value: 97, name: '血氧' }],
					max: 100,
					min: 80,
				axisLine: {
					lineStyle: {
							width: 30,
							color: [
								[0.2, '#FF6E76'],
								[0.4, '#FDDD60'],
								[1, '#7CFFB2']
							]
						}
					},
					pointer: {
						itemStyle: {
							color: 'auto'
						}
					}
				}
			]
		};

		// 睡眠状况图配置
		sleepchartoption.value = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
			},
			yAxis: {
				type: 'value',
				name: '小时',
				min: 0,
				max: 10
			},
			series: [
				{
					name: '深度睡眠',
					type: 'bar',
					stack: 'sleep',
					data: [2.5, 2.8, 3.0, 2.2, 2.6, 3.2, 3.0],
					itemStyle: {
						color: '#5470C6'
					}
				},
				{
					name: '浅度睡眠',
					type: 'bar',
					stack: 'sleep',
					data: [3.8, 3.5, 3.2, 3.8, 3.5, 3.8, 4.0],
					itemStyle: {
						color: '#91CC75'
					}
				},
				{
					name: '清醒',
					type: 'bar',
					stack: 'sleep',
					data: [1.0, 0.8, 0.6, 1.2, 0.9, 0.6, 0.8],
				itemStyle: {
						color: '#FAC858'
					}
				}
			]
		};

		// 整体健康评估雷达图
		allchartoption.value = {
			radar: {
				radius: '70%',
				indicator: [
					{ name: '身体状况', max: 100 },
					{ name: '精神状态', max: 100 },
					{ name: '社交能力', max: 100 },
					{ name: '生活自理', max: 100 },
					{ name: '营养状况', max: 100 }
				]
			},
			series: [
				{
					type: 'radar',
					data: [
						{
							value: [85, 78, 65, 80, 90],
							name: '健康评估',
							areaStyle: {
								color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
									{
										color: 'rgba(255, 145, 124, 0.5)',
										offset: 0
									},
									{
										color: 'rgba(255, 145, 124, 0.1)',
										offset: 1
									}
								])
							},
							itemStyle: {
								color: '#FF9178'
							},
						lineStyle: {
								width: 2
							}
						}
					]
				}
			]
		};
	};
	
	// 生成模拟心率数据
	const generateHeartRateData = () => {
		// 生成基础心率数据（范围60-100之间波动）
		const baseRate = 75; // 基础心率
		const variation = 15; // 变化幅度
		
		return heartchartoption.value.xAxis.data.map(() => {
			// 随机波动
			const randomFactor = Math.random() * 2 - 1; // -1到1之间
			return Math.round(baseRate + randomFactor * variation);
		});
	};
	
	// 生成模拟血压数据
	const generateBloodPressureData = () => {
		// 收缩压（高压）通常范围：120-140
		// 舒张压（低压）通常范围：80-90
		const systolicBase = 130; // 收缩压基准值
		const diastolicBase = 85; // 舒张压基准值
		const systolicVar = 10; // 收缩压变化范围
		const diastolicVar = 5; // 舒张压变化范围
		
		const systolic = [];
		const diastolic = [];
		
		for (let i = 0; i < bloorchartoption.value.xAxis.data.length; i++) {
			// 添加随机波动
			const systolicRand = Math.random() * 2 - 1; // -1到1之间
			const diastolicRand = Math.random() * 2 - 1; // -1到1之间
			
			systolic.push(Math.round(systolicBase + systolicRand * systolicVar));
			diastolic.push(Math.round(diastolicBase + diastolicRand * diastolicVar));
		}
		
		return { systolic, diastolic };
	};
	
	// 生成模拟血氧数据
	const generateOxygenData = () => {
		// 正常血氧范围：95-99%
		const baseOxygen = 97; // 基础血氧值
		const variation = 2; // 变化范围
		
		// 随机生成一个在范围内的血氧值
		const randomFactor = Math.random() * 2 - 1; // -1到1之间
		return Math.round(baseOxygen + randomFactor * variation);
	};
	
	// 生成模拟睡眠数据
	const generateSleepData = () => {
		// 生成睡眠数据：深度睡眠、浅度睡眠、清醒时间
		const deepSleep = [];
		const lightSleep = [];
		const awake = [];
		
		for (let i = 0; i < 7; i++) {
			// 深度睡眠：2-3.5小时
			deepSleep.push(2 + Math.random() * 1.5);
			// 浅度睡眠：3-4.5小时
			lightSleep.push(3 + Math.random() * 1.5);
			// 清醒：0.5-1.5小时
			awake.push(0.5 + Math.random() * 1);
		}
		
		return { deepSleep, lightSleep, awake };
	};
	
	// 生成整体健康评估数据
	const generateHealthAssessmentData = () => {
		// 基础评分
		const baseScores = [85, 78, 65, 80, 90]; // 身体、精神、社交、生活、营养
		const variation = 5; // 变化范围
		
		// 为每个指标添加一些随机变化
		return baseScores.map(score => {
			const randomFactor = Math.random() * 2 - 1; // -1到1之间
			return Math.min(100, Math.max(50, Math.round(score + randomFactor * variation)));
		});
	};
	
	// 更新模拟图表数据
	const updateSimulatedCharts = () => {
		try {
			// 准备数据
			const heartRateData = generateHeartRateData();
			const { systolic, diastolic } = generateBloodPressureData();
			const oxygenValue = generateOxygenData();
			const { deepSleep, lightSleep, awake } = generateSleepData();
			const healthAssessment = generateHealthAssessmentData();
			
			// 使用Promise.all和setTimeout分批更新图表，避免同时更新造成阻塞
			Promise.resolve()
				.then(() => {
					// 更新心率图表
					heartchartoption.value.series[0].data = heartRateData;
					if (heartChart.value) {
						heartChart.value.setOption(heartchartoption.value);
					}
					
					return new Promise(resolve => setTimeout(resolve, 50));
				})
				.then(() => {
					// 更新血压图表
					bloorchartoption.value.series[0].data = systolic;
					bloorchartoption.value.series[1].data = diastolic;
					if (bloodChart.value) {
						bloodChart.value.setOption(bloorchartoption.value);
					}
					
					return new Promise(resolve => setTimeout(resolve, 50));
				})
				.then(() => {
					// 更新血氧图表
					oxygenchartoption.value.series[0].data[0].value = oxygenValue;
					if (oxygenChart.value) {
						oxygenChart.value.setOption(oxygenchartoption.value);
					}
					
					return new Promise(resolve => setTimeout(resolve, 50));
				})
				.then(() => {
					// 更新睡眠图表
					sleepchartoption.value.series[0].data = deepSleep;
					sleepchartoption.value.series[1].data = lightSleep;
					sleepchartoption.value.series[2].data = awake;
					if (sleepChart.value) {
						sleepChart.value.setOption(sleepchartoption.value);
					}
					
					return new Promise(resolve => setTimeout(resolve, 50));
				})
				.then(() => {
					// 更新整体健康评估图表
					allchartoption.value.series[0].data[0].value = healthAssessment;
					if (assessmentChart.value) {
						assessmentChart.value.setOption(allchartoption.value);
					}
				})
				.catch(error => {
					console.error('更新图表时出错:', error);
				});
		} catch (error) {
			console.error('更新模拟图表数据出错:', error);
		}
	};

	// 添加前端映射函数
	const mapGenderToText = (gender) => {
		const genderMap = {
			'male': '男',
			'female': '女'
		};
		return genderMap[gender] || gender;
	};

	const mapCareLevelToText = (careLevel) => {
		const careLevelMap = {
			'self-care': '自理',
			'semi-care': '介助',
			'full-care': '介护',
			'special-care': '特护'
		};
		return careLevelMap[careLevel] || careLevel;
	};

	const mapStatusToText = (status) => {
		const statusMap = {
			'active': '在住',
			'inactive': '离开',
			'deceased': '过世',
			'normal': '正常',
			'warning': '需注意',
			'danger': '危险'
		};
		return statusMap[status] || status;
	};

	// 获取老人列表
	const fetchMembers = async () => {
		try {
			const res = await getMembers({
				name: keywords.value,
				// 添加参数，要求返回完整信息
				include_details: true
			});
			
			if (res.code === 200 && res.data && res.data.members) {
				// 处理返回的数据，确保格式一致
				const mappedMembers = res.data.members.map(member => {
					// 确保所有需要的字段都存在并进行映射
					// 注意：根据后端可能返回的是已经映射好的中文值，这里做双重检查
					const mappedMember = {
						...member,
						// 将英文值映射为中文显示（只有在值是英文时才进行映射）
						gender: ['male', 'female'].includes(member.gender) ? mapGenderToText(member.gender) : member.gender,
						care_level: ['self-care', 'semi-care', 'full-care', 'special-care'].includes(member.care_level) 
							? mapCareLevelToText(member.care_level) 
							: member.care_level,
						status: member.status || 'normal',
						status_text: ['normal', 'warning', 'danger', 'active', 'inactive', 'deceased'].includes(member.status)
							? mapStatusToText(member.status || 'normal')
							: member.status,
						// 确保床位信息存在并正确格式化
						bed_number: member.bed_number || '未分配',
						// 确保责任护工有默认值
						caregiver: member.caregiver || member.responsibility_worker || '未分配',
						// 处理健康状况数据
						health_conditions: processHealthConditions(member),
						// 确保健康详情字段存在
						health_detail: member.health_detail || member.health_status || ''
					};
					
					// 检查是否已有格式化的床位号，如果有床位ID但没有完整床位号，则添加标记
					if (member.bed_id && (!member.bed_number || member.bed_number === '未分配')) {
						mappedMember.bed_number = '已分配(数据同步中...)';
						// 标记此老人需要更新床位信息
						mappedMember._needs_bed_update = true;
					}
					
					console.log('单个老人映射:', member.name, '原始:', member, '映射后:', mappedMember);
					// 调试显示健康状况
					console.log('健康状况格式化后:', displayHealthConditionsText(mappedMember));
					
					return mappedMember;
				});
				
				// 更新状态
				memberList.value = mappedMembers;
				
				console.log('获取老人列表(映射后):', memberList.value);
				
				// 对需要更新床位信息的老人执行异步更新
				memberList.value.forEach(member => {
					if (member._needs_bed_update && member.bed_id) {
						fetchBedDetailsAndUpdate(member.id, member.bed_id);
					}
				});
				
				if (memberList.value.length > 0 && currentMemberIndex.value === -1) {
					currentMemberIndex.value = 0;
					// 获取选中老人的健康数据
					fetchHealthData();
					// 确保图表数据更新
					nextTick(() => {
						updateSimulatedCharts();
					});
				} else if (currentMemberIndex.value >= 0) {
					// 保持选中状态
					const currentId = currentMember.value?.id;
					if (currentId) {
						// 找到当前选中老人的新索引
						const newIndex = memberList.value.findIndex(m => m.id === currentId);
						if (newIndex >= 0) {
							currentMemberIndex.value = newIndex;
							// 更新当前选中老人的健康数据图表
							fetchHealthData();
							// 确保图表数据更新
							nextTick(() => {
								updateSimulatedCharts();
							});
						}
					}
				}
			} else {
				console.error('获取老人列表失败:', res);
				ElMessage.warning('获取老人列表失败');
			}
		} catch (error) {
			console.error('获取老人列表失败:', error);
			ElMessage.error('网络错误，请稍后重试');
		}
	};
	
	// 选择老人
	const selectMember = (index) => {
		currentMemberIndex.value = index;
		fetchHealthData();
		// 确保立即更新图表数据
		nextTick(() => {
			updateSimulatedCharts();
		});
	};
	
	// 床位数据
	const availableBeds = ref([]);
	
	// 获取可用床位列表
	const fetchAvailableBeds = async () => {
		try {
			const res = await getBeds({
				status: 'available'
			});
			availableBeds.value = res.data.beds;
		} catch (error) {
			console.error('获取可用床位列表失败:', error);
		}
	};
	
	// 更新图表函数
	const updateCharts = (healthData) => {
		// 检查是否有健康数据
		if (!healthData || !healthData.length) {
			console.log('使用默认图表数据，无健康数据或数据为空');
			return; // 使用初始化时的默认数据
		}
		
		try {
			// 准备各类型数据
			const heartRateData = [];
			const bloodPressureHigh = [];
			const bloodPressureLow = [];
			const temperatureData = [];
			const oxygenData = [];
			const timestamps = [];
			
			// 筛选最近7条数据（或可用的所有数据）
			const recentData = healthData.slice(0, 7).reverse();
			
			// 提取各类型数据
			recentData.forEach(item => {
				// 格式化时间为小时:分钟
				const time = new Date(item.timestamp);
				const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
				timestamps.push(timeStr);
				
				// 根据数据类型分别处理
				switch(item.type) {
					case 'heart_rate':
						heartRateData.push(Number(item.value));
				break;
					case 'blood_pressure':
						// 血压可能是以/分隔的高压/低压格式
						if (typeof item.value === 'string' && item.value.includes('/')) {
							const [high, low] = item.value.split('/').map(Number);
							bloodPressureHigh.push(high);
							bloodPressureLow.push(low);
						} else {
							// 如果是单值，假设是收缩压
							bloodPressureHigh.push(Number(item.value));
						}
				break;
					case 'temperature':
						temperatureData.push(Number(item.value));
				break;
					case 'oxygen':
						oxygenData.push(Number(item.value));
				break;
				}
			});
			
			// 更新各图表
			// 1. 心率图
			if (heartRateData.length > 0) {
				heartchartoption.value.xAxis.data = timestamps.length > 0 ? timestamps : heartchartoption.value.xAxis.data;
				heartchartoption.value.series[0].data = heartRateData;
			}
			
			// 2. 血压图
			if (bloodPressureHigh.length > 0) {
				bloorchartoption.value.xAxis.data = timestamps.length > 0 ? timestamps : bloorchartoption.value.xAxis.data;
				bloorchartoption.value.series[0].data = bloodPressureHigh;
				
				if (bloodPressureLow.length > 0) {
					bloorchartoption.value.series[1].data = bloodPressureLow;
				}
			}
			
			// 3. 血氧图 - 使用最新的血氧数据
			if (oxygenData.length > 0) {
				oxygenchartoption.value.series[0].data[0].value = oxygenData[0];
			}
			
			// 4. 生成健康评估雷达图数据（模拟数据，实际应从健康状况综合评分）
			// 这里基于健康状况的严重程度和数量生成一个模拟评分
			if (currentMember.value && currentMember.value.health_conditions) {
				const conditions = currentMember.value.health_conditions;
				
				// 简单评分系统 - 根据健康状况的严重程度调整得分
				// 默认基础分数
				const baseScores = [85, 78, 65, 80, 90]; // 身体、精神、社交、生活、营养
				
				// 根据健康状况调整
				let severityFactor = 0;
				if (conditions.length > 0) {
					// 遍历所有健康状况，根据严重程度调整因子
					conditions.forEach(condition => {
						if (condition.severity === 'severe') {
							severityFactor -= 0.15; // 严重状况
						} else if (condition.severity === 'moderate') {
							severityFactor -= 0.07; // 中等状况
						} else if (condition.severity === 'mild') {
							severityFactor -= 0.03; // 轻微状况
						}
					});
				}
				
				// 应用调整因子（确保得分在一个合理范围内）
				const adjustedScores = baseScores.map(score => {
					const adjusted = score * (1 + severityFactor);
					return Math.max(Math.min(adjusted, 100), 20); // 限制在20-100之间
				});
				
				// 更新雷达图
				allchartoption.value.series[0].data[0].value = adjustedScores;
			}
			
			// 应用图表更新
			nextTick(() => {
				try {
					if (document.querySelector('#heartchart')) {
						heartchartoption.value && $echarts.getInstanceByDom(document.querySelector('#heartchart'))?.setOption(heartchartoption.value);
					}
					if (document.querySelector('#bloorchart')) {
						bloorchartoption.value && $echarts.getInstanceByDom(document.querySelector('#bloorchart'))?.setOption(bloorchartoption.value);
					}
					if (document.querySelector('#oxygenchart')) {
						oxygenchartoption.value && $echarts.getInstanceByDom(document.querySelector('#oxygenchart'))?.setOption(oxygenchartoption.value);
					}
					if (document.querySelector('#allchart')) {
						allchartoption.value && $echarts.getInstanceByDom(document.querySelector('#allchart'))?.setOption(allchartoption.value);
					}
				} catch (e) {
					console.error('更新图表实例失败:', e);
				}
			});
			
			console.log('图表数据更新完成');
		} catch (error) {
			console.error('更新图表数据时出错:', error);
		}
	};
	
	// 获取健康数据
	const fetchHealthData = async () => {
		if (!currentMember.value) return;
		
		// 直接使用模拟数据，不再调用API获取数据
		updateSimulatedCharts();
	};
	
	// 老人表单对话框
	const memberDialogVisible = ref(false);
	const dialogType = ref('add'); // 'add' 或 'edit'
	const memberFormRef = ref(null);
	const memberForm = reactive({
		name: '',
		gender: '',
		age: 65,
		id_card: '',
		phone: '',
		emergency_contact: '',
		emergency_phone: '',
		caregiver: '',
		care_level: '自理',
		health_conditions: [],
		health_notes: ''
	});
	
	// 清空表单
	const resetMemberForm = () => {
		Object.assign(memberForm, {
			name: '',
			gender: '',
			age: 65,
			id_card: '',
			phone: '',
			emergency_contact: '',
			emergency_phone: '',
			caregiver: '',
			care_level: '自理',
			health_conditions: [],
			health_notes: ''
		});
	};
	
	// 表单验证规则
	const memberRules = {
		name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
		gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
		age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
		care_level: [{ required: true, message: '请选择护理级别', trigger: 'change' }],
		caregiver: [{ max: 100, message: '责任护工姓名不能超过100个字符', trigger: 'blur' }]
	};
	
	// 打开添加老人对话框
	const openAddMemberDialog = () => {
		dialogType.value = 'add';
		resetMemberForm();
		memberDialogVisible.value = true;
	};
	
	// 打开编辑老人对话框
	const openEditMemberDialog = (index) => {
		dialogType.value = 'edit';
			const member = memberList.value[index];
		
		console.log('编辑前的老人数据:', member);
		
		// 重置表单
		resetMemberForm();
		
		// 填充表单数据，确保使用映射后的中文值
			Object.keys(memberForm).forEach(key => {
				if (key in member) {
				// 特殊处理健康状况字段
				if (key === 'health_conditions') {
					if (Array.isArray(member[key])) {
						// 将对象数组转换为字符串数组
						memberForm[key] = member[key].map(condition => 
							typeof condition === 'object' ? condition.name : condition
						);
					} else if (typeof member[key] === 'string') {
						// 尝试解析JSON字符串
						try {
							const parsed = JSON.parse(member[key]);
							if (Array.isArray(parsed)) {
								memberForm[key] = parsed.map(condition => 
									typeof condition === 'object' ? condition.name : condition
								);
							} else {
								memberForm[key] = [typeof parsed === 'object' ? parsed.name : parsed];
							}
						} catch (e) {
							// 如果解析失败，按逗号分割
							memberForm[key] = member[key].split(',')
								.filter(item => item.trim())
								.map(name => name.trim());
						}
					} else {
						memberForm[key] = [];
					}
				} else {
					memberForm[key] = member[key];
				}
			}
		});
		
		// 确保性别和护理级别使用中文值
		if (['male', 'female'].includes(memberForm.gender)) {
			memberForm.gender = mapGenderToText(memberForm.gender);
		}
		
		if (['self-care', 'semi-care', 'full-care', 'special-care'].includes(memberForm.care_level)) {
			memberForm.care_level = mapCareLevelToText(memberForm.care_level);
		}
		
		console.log('表单填充数据:', memberForm);
		
		memberDialogVisible.value = true;
	};
	
	// 添加反向映射函数
	const mapTextToGender = (text) => {
		const reverseGenderMap = {
			'男': 'male',
			'女': 'female'
		};
		return reverseGenderMap[text] || text;
	};

	const mapTextToCareLevel = (text) => {
		const reverseCareLevelMap = {
			'自理': 'self-care',
			'介助': 'semi-care',
			'介护': 'full-care',
			'特护': 'special-care'
		};
		return reverseCareLevelMap[text] || text;
	};

	// 提交老人表单
	const submitMemberForm = async () => {
		if (!memberFormRef.value) return;
		
		try {
			// 使用MemberForm组件的validate方法验证表单
			const formData = await memberFormRef.value.validate();
			if (!formData) return;
			
			let res;
			if (dialogType.value === 'add') {
				// 创建老人时，需要将中文值映射为英文值
				const submitData = { ...formData };
				
				// 特殊处理性别和护理级别
				if (['男', '女'].includes(submitData.gender)) {
					submitData.gender = mapTextToGender(submitData.gender);
				}
				
				if (['自理', '介助', '介护', '特护'].includes(submitData.care_level)) {
					submitData.care_level = mapTextToCareLevel(submitData.care_level);
				}
				
				// 处理健康状况，确保格式正确
				submitData.health_conditions = processHealthConditionsForSubmit(submitData.health_conditions, submitData.health_detail);
				
				console.log('添加老人-提交数据:', submitData);
				
				res = await createMember(submitData);
				if (res.code === 201 || res.code === 200) {
					ElMessage.success('添加成功');
					memberDialogVisible.value = false;
					
					// 保存健康状况数据
					if (res.data && res.data.member && res.data.member.id) {
						await saveHealthConditions(res.data.member.id, submitData.health_conditions);
					}
					
					// 立即刷新列表
					setTimeout(() => {
						fetchMembers();
						// 更新图表数据
						setTimeout(() => {
							updateSimulatedCharts();
						}, 100);
					}, 300);
				} else {
					throw new Error(res.message || '添加失败');
				}
			} else {
				// 编辑老人时
				const submitData = { ...formData };
				
				// 处理健康状况
				submitData.health_conditions = processHealthConditionsForSubmit(submitData.health_conditions, submitData.health_detail);
				
				// 将中文值映射为英文值
				if (['男', '女'].includes(submitData.gender)) {
					submitData.gender = mapTextToGender(submitData.gender);
				}
				
				if (['自理', '介助', '介护', '特护'].includes(submitData.care_level)) {
					submitData.care_level = mapTextToCareLevel(submitData.care_level);
				}
				
				// 映射本地字段到API接受的字段
				if (submitData.caregiver) {
					submitData.responsibility_worker = submitData.caregiver;
				}
				
				console.log('更新老人-提交数据:', submitData);
				
				res = await updateMember(currentMember.value.id, submitData);
				if (res.code === 200) {
					ElMessage.success('更新成功');
					memberDialogVisible.value = false;
					
					// 保存健康状况数据
					await saveHealthConditions(currentMember.value.id, submitData.health_conditions);
					
					// 延迟一下再刷新数据，确保后端数据已经处理完毕
					setTimeout(() => {
						fetchMembers();
						// 更新图表数据
						setTimeout(() => {
							updateSimulatedCharts();
						}, 100);
					}, 300);
				} else {
					throw new Error(res.message || '更新失败');
				}
			}
		} catch (error) {
			console.error('表单提交错误:', error);
			ElMessage.error(error.message || '操作失败，请检查网络或联系管理员');
		}
	};
	
	// 处理健康状况格式化（提交前）
	const processHealthConditionsForSubmit = (healthConditions, healthDetail) => {
		let processedConditions = [];
		
		if (Array.isArray(healthConditions)) {
			// 将字符串数组转换为所需的对象格式
			processedConditions = healthConditions.map(condition => {
				if (typeof condition === 'string') {
					return {
						id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
						name: condition.trim(),
						severity: 'moderate'
					};
				}
				// 确保对象有id字段
				if (typeof condition === 'object' && !condition.id) {
					return {
						...condition,
						id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
					};
				}
				return condition;
			});
		}
		
		// 保存健康详情文本
		if (healthDetail && healthDetail.trim()) {
			// 将健康详情添加到处理后的条件中
			const formattedDetail = {
				detail: healthDetail,
				type: 'note'
			};
			
			// 添加健康详情
			processedConditions.push(formattedDetail);
		}
		
		return processedConditions;
	};
	
	// 分配床位对话框
	const assignBedDialogVisible = ref(false);
	const assignFormRef = ref(null);
	const assignForm = reactive({
		member_id: '',
		member_name: '',
		bed_id: ''
	});
	
	// 分配床位表单验证规则
	const assignRules = {
		bed_id: [{ required: true, message: '请选择床位', trigger: 'change' }]
	};
	
	// 打开分配床位对话框
	const openAssignBedDialog = (index) => {
		const member = memberList.value[index];
		assignForm.member_id = member.id;
		assignForm.member_name = member.name;
		assignForm.bed_id = '';
		
		fetchAvailableBeds();
		assignBedDialogVisible.value = true;
	};
	
	// 提交分配床位
	const submitAssignBed = async () => {
		if (!assignFormRef.value) return;
		
		await assignFormRef.value.validate(async (valid) => {
			if (valid) {
				try {
					console.log('分配床位-提交数据:', assignForm);
					
					const res = await assignBed(assignForm);
					
					if (res.code === 200) {
						ElMessage.success('分配床位成功');
						
						// 立即更新当前老人的床位信息
						const bedInfo = availableBeds.value.find(bed => bed.id === assignForm.bed_id);
						if (bedInfo && memberList.value[currentMemberIndex.value]) {
							// 直接更新当前老人的床位信息
							memberList.value[currentMemberIndex.value].bed_id = assignForm.bed_id;
							
							// 构建标准格式的床位号
							const bedNumber = `${bedInfo.building}-${bedInfo.room_number}-${bedInfo.bed_number}`;
							memberList.value[currentMemberIndex.value].bed_number = bedNumber;
							
							// 记录更新
							console.log('本地更新床位信息成功:', 
								memberList.value[currentMemberIndex.value].name,
								'床位号:', bedNumber);
						} else {
							console.warn('本地更新床位信息失败，将通过API更新');
						}
						
						// 关闭对话框
						assignBedDialogVisible.value = false;
						
						// 稍微延迟再刷新数据，确保后端数据已更新
			setTimeout(() => {
							// 重新获取完整列表确保数据同步
							fetchMembers();
						}, 300);
					} else {
						ElMessage.error(res.message || '分配床位失败');
					}
				} catch (error) {
					console.error('分配床位错误:', error);
					ElMessage.error('分配床位失败，请检查网络或联系管理员');
				}
			}
		});
	};
	
	// 取消床位分配
	const handleUnassignBed = async (index) => {
		const member = memberList.value[index];
		if (!member.bed_id) {
			ElMessage.warning('该老人未分配床位');
			return;
		}
		
		ElMessageBox.confirm('确定要取消该床位分配吗？', '提示', {
			type: 'warning'
		}).then(async () => {
			try {
				// 详细记录请求数据
				console.log('取消床位分配-请求数据:', {
					memberId: member.id,
					memberName: member.name,
					bedId: member.bed_id,
					bedNumber: member.bed_number
				});
				
				// 确保传递的是床位ID
				const res = await unassignBed(member.bed_id);
				
				// 详细记录响应
				console.log('取消床位分配-响应数据:', res);
				
				if (res.code === 200) {
					ElMessage.success('取消床位分配成功');
					
					// 彻底清除床位信息
					if (memberList.value[index]) {
						memberList.value[index].bed_id = null;
						memberList.value[index].bed_number = '未分配';
						// 确保清除所有相关属性
						memberList.value[index].building = null;
						memberList.value[index].floor = null;
						memberList.value[index].room_number = null;
						
						console.log('本地更新取消床位成功, 更新后的数据:', memberList.value[index]);
					}
					
					// 延长刷新时间，确保后端处理完成
					setTimeout(() => {
						// 强制重新获取数据
						fetchMembers();
						
						// 再次检查确认数据已更新
						setTimeout(() => {
							const updatedMember = memberList.value.find(m => m.id === member.id);
							console.log('二次确认老人床位数据:', updatedMember);
							
							// 如果仍有床位信息，再次强制清除
							if (updatedMember && updatedMember.bed_id) {
								console.warn('床位取消分配后仍有床位信息, 强制清除');
								updatedMember.bed_id = null;
								updatedMember.bed_number = '未分配';
								updatedMember.building = null;
								updatedMember.floor = null;
								updatedMember.room_number = null;
							}
			}, 500);
					}, 800);
				} else {
					throw new Error(res.message || '取消床位分配失败');
				}
			} catch (error) {
				console.error('取消床位分配错误:', error);
				ElMessage.error(error.message || '取消床位分配失败，请检查网络或联系管理员');
			}
		});
	};
	
	// 删除老人
	const handleDeleteMember = async (index) => {
		const member = memberList.value[index];
		
		ElMessageBox.confirm(`确定要删除老人"${member.name}"吗？`, '提示', {
				type: 'warning'
		}).then(async () => {
			try {
				await deleteMember(member.id);
				ElMessage.success('删除成功');
				fetchMembers();
				if (currentMemberIndex.value === index) {
					currentMemberIndex.value = -1;
				}
			} catch (error) {
				ElMessage.error('删除失败');
			}
		});
	};
	
	// 处理下拉菜单命令
	const handleCommand = ({ type, index }) => {
		switch (type) {
			case 'edit':
				openEditMemberDialog(index);
				break;
			case 'assign':
				openAssignBedDialog(index);
				break;
			case 'unassign':
				handleUnassignBed(index);
				break;
			case 'delete':
				handleDeleteMember(index);
				break;
		}
	};
	
	// 获取状态样式
	const getStatusClass = (status) => {
		const classes = {
			normal: 'text_color_12',
			warning: 'text_color_13',
			danger: 'text_color_11'
		};
		return classes[status] || 'text_color_12';
	};
	
	// 获取状态文本
	const getStatusText = (status) => {
		return mapStatusToText(status);
	};
	
	// 获取健康状况类型
	const getConditionType = (severity) => {
		const types = {
			mild: 'success',
			moderate: 'warning',
			severe: 'danger'
		};
		return types[severity] || 'info';
	};

	// 获取床位详情并更新老人信息
	const fetchBedDetailsAndUpdate = async (memberId, bedId) => {
		if (!bedId) return;
		
		try {
			// 获取单个床位详情
			const res = await getBedDetail(bedId);
			
			if (res.code === 200 && res.data && res.data.bed) {
				const bedInfo = res.data.bed;
				
				// 查找并更新老人的床位信息
				const memberIndex = memberList.value.findIndex(m => m.id === memberId);
				if (memberIndex >= 0) {
					// 更新床位信息，标准格式：楼栋-房间号-床位号
					const bedNumber = `${bedInfo.building}-${bedInfo.room_number}-${bedInfo.bed_number}`;
					memberList.value[memberIndex].bed_number = bedNumber;
					
					// 移除需要更新标记
					delete memberList.value[memberIndex]._needs_bed_update;
					
					console.log('已更新老人床位信息:', 
						memberList.value[memberIndex].name, 
						'床位号:', bedNumber);
				}
			} else {
				console.warn('获取床位详情失败, 尝试使用列表API:', res);
				// 备选方案：使用床位列表API
				const listRes = await getBeds({
					bed_id: bedId
				});
				
				if (listRes.code === 200 && listRes.data && listRes.data.beds && listRes.data.beds.length > 0) {
					const bedInfo = listRes.data.beds[0];
					
					// 查找并更新老人的床位信息
					const memberIndex = memberList.value.findIndex(m => m.id === memberId);
					if (memberIndex >= 0) {
						// 更新床位信息，标准格式：楼栋-房间号-床位号
						const bedNumber = `${bedInfo.building}-${bedInfo.room_number}-${bedInfo.bed_number}`;
						memberList.value[memberIndex].bed_number = bedNumber;
						
						// 移除需要更新标记
						delete memberList.value[memberIndex]._needs_bed_update;
						
						console.log('通过列表API更新老人床位信息:', 
							memberList.value[memberIndex].name, 
							'床位号:', bedNumber);
					}
				}
			}
		} catch (error) {
			console.error('获取床位详情错误:', error);
		}
	};

	// 紧急定位地图对话框
	const locationMapVisible = ref(false);
	let locationMap = null;
	
	// 打开紧急定位地图
	const openLocationMap = () => {
		if (!currentMember.value) {
			ElMessage.warning('请先选择老人');
			return;
		}
		
		locationMapVisible.value = true;
		
		// 使用 nextTick 确保 DOM 已经更新
		nextTick(() => {
			initLocationMap();
			
			// 监听窗口大小变化，重新调整地图大小
			window.addEventListener('resize', handleMapResize);
		});
	};
	
	// 初始化定位地图
	const initLocationMap = () => {
		if (!document.getElementById('location-map')) return;
		
		// 检查高德地图API是否已加载
		if (typeof AMap === 'undefined') {
			console.error('高德地图API未加载');
			ElMessage.error('地图服务加载失败，请刷新页面重试');
			return;
		}
		
		// 初始化地图，添加willReadFrequently属性以优化Canvas性能
		locationMap = $echarts.init(document.getElementById('location-map'), null, {
			renderer: 'canvas',
			useDirtyRect: true,
			willReadFrequently: true
		});
		
		// 模拟老人位置坐标 (实际项目中应该从后端获取)
		const elderlyLocation = getElderlyLocation();
		
		// 地图配置
		const option = {
			amap: {
				rotateEnable: true,
				pitchEnable: true,
				zoom: 17,
				center: elderlyLocation,
				viewMode: '3D',
				resizeEnable: true,
				mapStyle: 'amap://styles/darkblue',
				renderOnMoving: true,
				echartsLayerInteractive: true,
				largeMode: false,
				key: '121424b9d00639786b04a1446b57cb2f', // 高德地图API密钥
				securityJsCode: 'ae563e43044574fbb9142bf46bdadd81', // 安全密钥
			},
			series: [{
				name: '老人位置',
				type: 'effectScatter',
				coordinateSystem: 'amap',
				zlevel: 5,
				symbol: 'pin',
				symbolSize: [30, 30],
				itemStyle: {
					color: '#FF5722'
				},
				data: [
					[...elderlyLocation, 100, currentMember.value.name]
				],
				rippleEffect: {
					scale: 8,
					brushType: "stroke"
				},
				label: {
					show: true,
					position: 'top',
					formatter: '{@[3]}',
					fontSize: 14,
					color: '#fff',
					textBorderColor: '#000',
					textBorderWidth: 2
				},
				hoverAnimation: true
			}]
		};
		
		try {
			// 设置地图配置
			locationMap.setOption(option);
			
			// 获取高德地图实例
			const amapComponent = locationMap.getModel().getComponent('amap');
			const amap = amapComponent.getAMap();
			
			// 修复：高德地图2.0版本中控件的创建和添加方式
			// 添加比例尺控件
			amap.plugin(['AMap.Scale'], () => {
				const scale = new AMap.Scale({
					position: 'LB'
				});
				amap.addControl(scale);
			});
			
			// 添加工具条控件
			amap.plugin(['AMap.ToolBar'], () => {
				const toolBar = new AMap.ToolBar({
					position: 'RB'
				});
				amap.addControl(toolBar);
			});
			
			// 添加控制条控件
			amap.plugin(['AMap.ControlBar'], () => {
				const controlBar = new AMap.ControlBar({
					position: {
						top: '10px',
						right: '10px'
					}
				});
				amap.addControl(controlBar);
			});
			
			// 在地图上添加标记点
			const marker = new AMap.Marker({
				position: elderlyLocation,
				title: currentMember.value.name
			});
			amap.add(marker);
			
			// 添加定位按钮
			amap.plugin(['AMap.Geolocation'], () => {
				const geolocation = new AMap.Geolocation({
					enableHighAccuracy: true,
					timeout: 10000,
					buttonPosition: 'RB',
					buttonOffset: new AMap.Pixel(10, 70),
					zoomToAccuracy: true
				});
				amap.addControl(geolocation);
			});
			
			console.log('地图初始化成功');
		} catch (error) {
			console.error('地图初始化失败:', error);
			ElMessage.error('地图加载失败: ' + error.message);
		}
	};
	
	// 获取老人位置（模拟数据，实际应从设备获取）
	const getElderlyLocation = () => {
		// 这里应该调用API获取实际位置，这里使用模拟坐标
		// 可以根据老人ID从后端获取实时位置
		return [108.840763, 34.209887]; // 默认位置坐标
	};

	// 处理地图大小调整
	const handleMapResize = () => {
		if (locationMap) {
			locationMap.resize();
		}
	};
	
	// 监听对话框关闭事件，销毁地图实例
	const closeLocationMap = () => {
		// 移除事件监听
		window.removeEventListener('resize', handleMapResize);
		
		// 销毁地图实例
		if (locationMap) {
			locationMap.dispose();
			locationMap = null;
		}
	};

	// 刷新位置
	const refreshLocation = async () => {
		if (!locationMap) return;
		
		// 显示加载状态
		ElMessage.info({
			message: '正在获取最新位置...',
			duration: 1000
		});
		
		try {
			// 这里应该调用API获取最新位置
			// 为了演示，我们添加一个延迟和模拟位置变化
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// 模拟位置有微小变化，实际应该从API获取
			const baseLocation = [108.840763, 34.209887];
			const randomOffset = () => (Math.random() - 0.5) * 0.001; // 小范围随机偏移
			const newLocation = [
				baseLocation[0] + randomOffset(),
				baseLocation[1] + randomOffset()
			];
			
			// 更新地图中心点
			const option = locationMap.getOption();
			option.amap.center = newLocation;
			
			// 更新标记点位置
			option.series[0].data = [[...newLocation, 100, currentMember.value.name]];
			
			// 重新设置配置
			locationMap.setOption(option);
			
			// 同时刷新老人健康数据
			fetchHealthData();
			
			ElMessage.success('位置和健康数据已更新');
		} catch (error) {
			console.error('刷新位置失败:', error);
			ElMessage.error('获取位置信息失败');
		}
	};

	// 获取状态类型（对应el-tag类型）
	const getStatusType = (status) => {
		const types = {
			normal: 'success',
			warning: 'warning',
			danger: 'danger',
			active: 'success',
			inactive: 'info',
			deceased: 'danger'
		};
		return types[status] || 'info';
	};

	// 添加健康数据（如果有修改或新增健康状况）
	const saveHealthConditions = async (memberId, healthConditions) => {
		if (!memberId) return;
		
		try {
			// 处理健康状况数据，确保格式一致
			let processedConditions = [];
			
			if (Array.isArray(healthConditions)) {
				// 将字符串数组转换为所需的对象格式
				processedConditions = healthConditions.map(condition => {
					if (typeof condition === 'string') {
						return {
							id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
							name: condition.trim(),
							severity: 'moderate'
						};
					}
					// 确保对象有id字段
					if (typeof condition === 'object' && !condition.id) {
						return {
							...condition,
							id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
						};
					}
					return condition;
				});
			}
			
			// 构建健康数据对象
			const healthData = {
				member_id: memberId,
				type: 'general',
				// 使用处理过的健康状况数组
				health_conditions: processedConditions,
				timestamp: new Date().toISOString()
			};
			
			// 调用API保存健康状况
			const response = await addHealthData(healthData);
			console.log('保存健康状况成功:', response);
			
			// 不需要刷新页面，因为本地数据已更新
		} catch (error) {
			console.error('保存健康状况失败:', error);
			// 不显示错误提示，避免干扰用户
		}
	};

	// 初始化时获取数据
	onMounted(() => {
		// 初始化图表配置
		initChartOptions();
		// 获取老人列表数据
		fetchMembers();
		
		// 立即更新一次图表数据
		updateSimulatedCharts();
		
		// 使用requestAnimationFrame代替setInterval，更平滑地更新
		let lastTime = 0;
		const updateInterval = 5000; // 更新间隔（毫秒）
		
		function update(time) {
			// 计算时间差
			if (!lastTime) lastTime = time;
			const deltaTime = time - lastTime;
			
			// 达到更新间隔时更新数据
			if (deltaTime >= updateInterval) {
				lastTime = time;
				updateSimulatedCharts();
			}
			
			// 继续循环
			chartUpdateTimer = requestAnimationFrame(update);
		}
		
		// 启动动画循环
		chartUpdateTimer = requestAnimationFrame(update);
	});
	
	// 组件卸载前清除定时器
	onBeforeUnmount(() => {
		// 清除图表更新定时器
		if (chartUpdateTimer) {
			cancelAnimationFrame(chartUpdateTimer);
			chartUpdateTimer = null;
		}
	});

	// 添加健康状况格式化和显示函数
	const formatHealthConditions = (healthData) => {
		let healthConditions = [];
		
		// 尝试处理健康状况数据
		if (healthData.health_conditions) {
			if (Array.isArray(healthData.health_conditions)) {
				// 已经是数组格式
				healthConditions = healthData.health_conditions;
			} else if (typeof healthData.health_conditions === 'string') {
				// 尝试解析JSON字符串
				try {
					const parsed = JSON.parse(healthData.health_conditions);
					healthConditions = Array.isArray(parsed) ? parsed : [parsed];
				} catch (e) {
					// 如果不是JSON格式，按逗号分隔
					healthConditions = healthData.health_conditions.split(',')
						.filter(item => item.trim())
						.map(name => ({
							name: name.trim(),
							severity: 'moderate'
						}));
				}
			}
		} else if (healthData.health_status) {
			// 为了兼容旧数据，仍然尝试从health_status获取
			try {
				const parsed = JSON.parse(healthData.health_status);
				healthConditions = Array.isArray(parsed) ? parsed : [parsed];
			} catch (e) {
				// 不是JSON格式，可能是普通文本
				if (typeof healthData.health_status === 'string') {
					healthConditions = healthData.health_status.split(',')
						.filter(item => item.trim())
						.map(name => ({
							name: name.trim(),
							severity: 'moderate'
						}));
				}
			}
		}
		
		return healthConditions;
	};

	// 显示健康状况文本（用于调试和日志）
	const displayHealthConditionsText = (healthData) => {
		const conditions = formatHealthConditions(healthData);
		return conditions.map(condition => 
			typeof condition === 'object' ? condition.name : condition
		).join(', ');
	};

	// 更新格式化健康状况函数 - 用于处理fetchMembers返回的数据
	const processHealthConditions = (member) => {
		let healthConditions = [];
		
		// 1. 首先尝试使用health_conditions字段
		if (member.health_conditions) {
			if (Array.isArray(member.health_conditions)) {
				// 已经是数组格式
				healthConditions = member.health_conditions.map(condition => {
					if (typeof condition === 'string') {
						return {
							name: condition,
							severity: 'moderate',
							id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
						};
					}
					return condition;
				});
			} else if (typeof member.health_conditions === 'string') {
				// 尝试解析JSON字符串
				try {
					const parsed = JSON.parse(member.health_conditions);
					if (Array.isArray(parsed)) {
						healthConditions = parsed.map(condition => {
							if (typeof condition === 'string') {
								return {
									name: condition,
									severity: 'moderate',
									id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
								};
							}
							return condition;
						});
					} else if (parsed) {
						healthConditions = [parsed];
					}
				} catch (e) {
					// 如果不是JSON格式，按逗号分隔
					healthConditions = member.health_conditions.split(',')
						.filter(item => item.trim())
						.map(name => ({
							name: name.trim(),
							severity: 'moderate',
							id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
						}));
				}
			}
		} 
		// 2. 如果health_conditions为空，尝试从health_status字段获取（旧版后端格式）
		else if (member.health_status && healthConditions.length === 0) {
			try {
				const parsed = JSON.parse(member.health_status);
				if (Array.isArray(parsed)) {
					healthConditions = parsed.map(condition => {
						if (typeof condition === 'string') {
							return {
								name: condition,
								severity: 'moderate',
								id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
							};
						}
						return condition;
					});
				} else if (parsed) {
					healthConditions = [parsed];
				}
			} catch (e) {
				// 不是JSON格式，可能是普通文本
				if (typeof member.health_status === 'string') {
					healthConditions = member.health_status.split(',')
						.filter(item => item.trim())
						.map(name => ({
							name: name.trim(),
							severity: 'moderate',
							id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
						}));
				}
			}
		}
		
		// 确保每个健康状况都有ID和严重程度
		healthConditions = healthConditions.map(condition => {
			if (typeof condition === 'string') {
				return {
					name: condition,
					severity: 'moderate',
					id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
				};
			} else if (typeof condition === 'object') {
				if (!condition.id) {
					condition.id = `hc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				}
				if (!condition.severity) {
					condition.severity = 'moderate';
				}
			}
			return condition;
		});
		
		return healthConditions;
	};

	// 图表引用
	const heartChart = ref(null);
	const bloodChart = ref(null);
	const oxygenChart = ref(null);
	const sleepChart = ref(null);
	const assessmentChart = ref(null);
</script>

<style scoped>
.health-page {
	height: 100%;
	overflow-y: auto;
	padding: 10px;
}

.right-content {
	height: calc(100vh - 90px);
	overflow-y: auto;
	padding-right: 10px;
}

.chartpanel {
	margin-bottom: 10px;
}

.left-panel {
	/* border-right: 0.0625rem solid #ffffff11; */
	padding: 0 !important;
}

.keywords {
	width: 90%;
	margin: 0 auto;
}

.keywords .el-input__wrapper {
	background: rgba(255, 255, 255, 0.5) !important;
	box-shadow: none;
	border-radius: 30px;
	text-align: center;
}

.keywords .el-input__wrapper .el-input__inner {
	text-align: center;
	color: #333;
}

.members {
	height: auto;
}

.members .member-item {
	
	/* background: #F3512110; */
	cursor: pointer;
}
.members .member-item .inner{
	border-bottom: 0.0625rem solid #ffffff22;
	padding: 0.3125rem 0.625rem;
	border-radius: 0.1875rem;
	margin: 1vh;
}

.members .member-item .inner:hover {
	background: #5483b3;
}

.members .member-item-seleted .inner{
	background: #5483b3;
}

.members .member-item .icon {
	width: 20%;
	text-align: center;
	font-size: 2.2rem;
	line-height: 7vh;
	position: relative;
	top: 0.5vh
}

.members .member-item .name {
	height: 3vh;
	line-height: 3vh;
	font-size: 1.4rem;
}

.members .member-item .desc {
	height: 2vh;
	line-height: 2vh;
	font-size: 1.2rem;
	color: #ddd;
}
	
.baseinfo{
	line-height: 3vh;
	font-size: 1.4rem;
	margin-top: 2vh;
}
.baseinfo .icon{
	width: 20%;
	text-align: center;
	font-size:7rem;
	line-height: 2vh;
}
.baseinfo .name{
	font-size: 1.6rem;
	line-height: 4vh;
}
.baseinfo .desc{
	color: #ddd;
}
.tag{
	margin-right: 1vh;
}
.location-map-container {
	position: relative;
}
	
.back-button {
	position: absolute;
	top: 10px;
	left: 10px;
	z-index: 1000;
	font-weight: bold;
}

.elder-info-panel {
	margin-top: 15px;
	padding: 10px;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 5px;
}

.health-detail-text {
  margin: 5px 0;
  line-height: 1.4;
  color: #ddd;
  white-space: pre-line;
}

.emergency-btn {
  margin-top: 1vh;
  text-align: center;
  width: 100%;
}

.emergency-btn .el-button {
  width: 50%;
  margin: 0 auto;
  font-weight: bold;
}
</style>
