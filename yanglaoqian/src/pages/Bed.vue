<template>
	<div class="bed-page">
		<el-row :gutter="10" style="margin:0px;padding:0px;margin-top: 1vh;">
			<el-col :span="24">
				<div class="bed-content">
					<div class="bed-container dark-theme">
						<chartpanel title="床位管理">
							<!-- 搜索表单 -->
							<el-form :inline="true" :model="searchForm" class="search-form" >
								<el-form-item label="建筑">
									<el-select v-model="searchForm.building" placeholder="请选择建筑">
										<el-option v-for="item in buildingOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</el-form-item>
								<el-form-item label="楼层">
									<el-select v-model="searchForm.floor" placeholder="请选择楼层">
										<el-option v-for="item in floorOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</el-form-item>
								<el-form-item label="房间号">
									<el-input v-model="searchForm.room_number" placeholder="请输入房间号" />
								</el-form-item>
								<el-form-item label="状态">
									<el-select v-model="searchForm.status" placeholder="请选择状态">
										<el-option label="可用" value="available" />
										<el-option label="已占用" value="occupied" />
										<el-option label="维护中" value="maintenance" />
									</el-select>
								</el-form-item>
								<el-form-item>
									<el-button type="primary" @click="handleSearch">搜索</el-button>
									<el-button @click="resetSearch">重置</el-button>
									<el-button type="primary" @click="handleAdd">新增床位</el-button>
								</el-form-item>
							</el-form>

							<!-- 统计信息 -->
							<el-row :gutter="20" class="statistics">
								<el-col :span="6">
									<div class="stat-card">
										<div class="stat-title">总床位数</div>
										<div class="stat-value">{{ statistics.total }}</div>
									</div>
								</el-col>
								<el-col :span="6">
									<div class="stat-card">
										<div class="stat-title">已占用</div>
										<div class="stat-value">{{ statistics.occupied }}</div>
									</div>
								</el-col>
								<el-col :span="6">
									<div class="stat-card">
										<div class="stat-title">可用</div>
										<div class="stat-value">{{ statistics.available }}</div>
									</div>
								</el-col>
								<el-col :span="6">
									<div class="stat-card">
										<div class="stat-title">维护中</div>
										<div class="stat-value">{{ statistics.maintenance }}</div>
									</div>
								</el-col>
							</el-row>

							<!-- 床位列表 -->
							<el-table :data="bedList" style="width: 100%" v-loading="loading" class="dark-table">
								<el-table-column prop="bed_number" label="床位号" />
								<el-table-column prop="building" label="建筑" />
								<el-table-column prop="floor" label="楼层" />
								<el-table-column prop="room_number" label="房间号" />
								<el-table-column prop="status" label="状态">
									<template #default="{ row }">
										<el-tag :type="getStatusType(row.status)">
											{{ getStatusText(row.status) }}
										</el-tag>
									</template>
								</el-table-column>
								<el-table-column prop="description" label="描述" />
								<el-table-column label="操作" width="250">
									<template #default="{ row }">
										<el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
										<el-button 
											type="success" 
											size="small" 
											@click="handleAssign(row)"
											v-if="row.status === 'available'"
										>分配</el-button>
										<el-button 
											type="warning" 
											size="small" 
											@click="handleUnassign(row)"
											v-if="row.status === 'occupied'"
										>取消分配</el-button>
										<el-button 
											type="danger" 
											size="small" 
											@click="handleDelete(row)"
										>删除</el-button>
									</template>
								</el-table-column>
							</el-table>

							<!-- 分页 -->
							<div class="pagination">
								<el-pagination
									v-model:current-page="currentPage"
									v-model:page-size="pageSize"
									:page-sizes="[10, 20, 50, 100]"
									layout="total, sizes, prev, pager, next"
									:total="total"
									@size-change="handleSizeChange"
									@current-change="handleCurrentChange"
								/>
							</div>
						</chartpanel>

						<!-- 床位使用率可视化组件 -->
						<el-row :gutter="10" style="margin-top: 1vh;">
							<el-col :span="12">
								<chartpanel title="床位使用率">
									<v-chart ref="bedUsageChart" style="min-height: 300px;" :option="bedUsageOption"></v-chart>
								</chartpanel>
							</el-col>
							<el-col :span="12">
								<chartpanel title="床位分布情况">
									<v-chart ref="bedDistributionChart" style="min-height: 300px;" :option="bedDistributionOption"></v-chart>
								</chartpanel>
							</el-col>
						</el-row>

						<!-- 新增/编辑对话框 -->
						<el-dialog
							:title="dialogTitle"
							v-model="dialogVisible"
							width="500px"
						>
							<el-form
								:model="bedForm"
								:rules="rules"
								ref="bedFormRef"
								label-width="100px"
							>
								
								<el-form-item label="建筑" prop="building">
									<el-select v-model="bedForm.building" placeholder="请选择建筑">
										<el-option v-for="item in buildingOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</el-form-item>
								<el-form-item label="楼层" prop="floor">
									<el-select v-model="bedForm.floor" placeholder="请选择楼层">
										<el-option v-for="item in floorOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</el-form-item>
								<el-form-item label="房间号" prop="room_number">
									<el-input v-model="bedForm.room_number" />
								</el-form-item>
								<el-form-item label="床位号" prop="bed_number">
									<el-input v-model="bedForm.bed_number" />
								</el-form-item>
								
							
								<el-form-item label="状态" prop="status">
									<el-select v-model="bedForm.status">
										<el-option label="可用" value="available" />
										<el-option label="已占用" value="occupied" />
										<el-option label="维护中" value="maintenance" />
									</el-select>
								</el-form-item>
								<el-form-item label="描述" prop="description">
									<el-input
										v-model="bedForm.description"
										type="textarea"
										:rows="3"
									/>
								</el-form-item>
							</el-form>
							<template #footer>
								<span class="dialog-footer">
									<el-button @click="dialogVisible = false">取消</el-button>
									<el-button type="primary" @click="handleSubmit">确定</el-button>
								</span>
							</template>
						</el-dialog>

						<!-- 分配床位对话框 -->
						<el-dialog
							title="分配床位"
							v-model="assignDialogVisible"
							width="500px"
						>
							<el-form
								:model="assignForm"
								:rules="assignRules"
								ref="assignFormRef"
								label-width="100px"
							>
								<el-form-item label="选择老人" prop="member_id">
									<el-select 
										v-model="assignForm.member_id" 
										placeholder="请选择老人" 
										filterable 
										:loading="membersLoading"
										style="width: 100%"
									>
										<el-option
											v-for="item in membersList"
											:key="item.id"
											:label="item.name"
											:value="item.id"
										>
											<div class="member-option">
												<span>{{item.name}}</span>
												<span class="member-info">{{item.age}}岁 | {{item.gender}} | {{item.care_level || '未设置级别'}}</span>
											</div>
										</el-option>
									</el-select>
								</el-form-item>
							</el-form>
							<template #footer>
								<span class="dialog-footer">
									<el-button @click="assignDialogVisible = false">取消</el-button>
									<el-button type="primary" @click="handleAssignSubmit">确定</el-button>
								</span>
							</template>
						</el-dialog>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted,
		computed
	} from 'vue';
	
	import chartpanel from "@/components/chartpanel.vue"
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import {
		PieChart,
		BarChart,
		LineChart,
		GaugeChart,
		RadarChart
	} from "echarts/charts";
	import {
		GridComponent,
		TooltipComponent,
		TitleComponent,
		LegendComponent,
		DataZoomComponent,
	} from "echarts/components";
	import VChart from "vue-echarts";
	import * as echarts from 'echarts/core';
	
	use([
		CanvasRenderer,
		PieChart,
		BarChart,
		LineChart,
		GaugeChart,
		RadarChart,
		GridComponent,
		TooltipComponent,
		TitleComponent,
		LegendComponent,
		DataZoomComponent,
	]);
	
	import { ElMessage, ElMessageBox } from 'element-plus'
	import {
		getBeds,
		getBedStatistics,
		createBed,
		updateBed,
		deleteBed,
		assignBed,
		unassignBed
	} from '../api/bed'
	import { getMembers } from '../api/member'
	import { useUserStore } from '@/stores/userStore'
	
	// 定义建筑和楼层选项常量
	const buildingOptions = [
		{ label: 'A栋', value: 'A栋' },
		{ label: 'B栋', value: 'B栋' },
		{ label: 'C栋', value: 'C栋' },
		{ label: 'D栋', value: 'D栋' }
	];

	const floorOptions = [
		{ label: '1层', value: '1层' },
		{ label: '2层', value: '2层' },
		{ label: '3层', value: '3层' },
		{ label: '4层', value: '4层' }
	];
	
	//搜索表单
	const searchForm = reactive({
		building: '',
		floor: '',
		room_number: '',
		status: ''
	})
	
	//床位列表数据
	const bedList = ref([])
	const loading = ref(false)
	const currentPage = ref(1)
	const pageSize = ref(10)
	const total = ref(0)
	
	//统计信息
	const statistics = reactive({
		total: 0,
		occupied: 0,
		available: 0,
		maintenance: 0
	})
	
	//表单对话框
	const dialogVisible = ref(false)
	const dialogTitle = ref('')
	const bedFormRef = ref(null)
	const bedForm = reactive({
		bed_number: '',
		building: '',
		floor: '',
		room_number: '',
		status: 'available',
		description: ''
	})
	
	//分配床位对话框
	const assignDialogVisible = ref(false)
	const assignFormRef = ref(null)
	const assignForm = reactive({
		bed_id: '',
		member_id: ''
	})
	
	// 老人列表数据
	const membersList = ref([])
	const membersLoading = ref(false)
	
	//表单验证规则
	const rules = {
		building: [{ required: true, message: '请选择建筑', trigger: 'change' }],
		bed_number: [{ required: true, message: '请输入床位号', trigger: 'blur' }],
		floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
		room_number: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
		status: [{ required: true, message: '请选择状态', trigger: 'change' }]
	}
	
	const assignRules = {
		member_id: [{ required: true, message: '请选择老人', trigger: 'change' }]
	}
	
	//获取床位列表
	const fetchBedList = async () => {
		loading.value = true
		try {
			const params = {
				page: currentPage.value,
				limit: pageSize.value,
				...searchForm
			}
			const res = await getBeds(params)
			bedList.value = res.data.beds
			total.value = res.data.total
			
			// 获取完数据后立即更新图表
			if (statistics.total > 0) {
				// 获取所有床位数据用于图表展示
				const allBedsRes = await getBeds({
					...searchForm,
					limit: total.value // 获取所有数据
				})
				if (allBedsRes.data && allBedsRes.data.beds) {
					updateChartData(allBedsRes.data.beds)
				}
			}
		} catch (error) {
			console.error('获取床位列表失败:', error)
		} finally {
			loading.value = false
		}
	}
	
	//获取统计信息
	const fetchStatistics = async () => {
		try {
			const res = await getBedStatistics()
			Object.assign(statistics, res.data)
			
			// 获取完统计信息后更新图表
			updateChartData()
		} catch (error) {
			console.error('获取统计信息失败:', error)
		}
	}
	
	//搜索
	const handleSearch = () => {
		currentPage.value = 1
		fetchBedList()
	}
	
	//重置搜索
	const resetSearch = () => {
		Object.keys(searchForm).forEach(key => {
			searchForm[key] = '';
		});
		currentPage.value = 1;
		fetchBedList();
		fetchStatistics();
	}
	
	//新增床位
	const handleAdd = () => {
		dialogTitle.value = '新增床位'
		Object.keys(bedForm).forEach(key => {
			bedForm[key] = key === 'status' ? 'available' : ''
		})
		bedForm.id = null
		dialogVisible.value = true
	}
	
	//编辑床位
	const handleEdit = (row) => {
		dialogTitle.value = '编辑床位'
		Object.keys(bedForm).forEach(key => {
			bedForm[key] = row[key]
		})
		bedForm.id = row.id
		dialogVisible.value = true
	}
	
	//提交表单
	const handleSubmit = async () => {
		if (!bedFormRef.value) return
		
		await bedFormRef.value.validate(async (valid) => {
			if (valid) {
				try {
					if (bedForm.id) {
						await updateBed(bedForm.id, bedForm)
						ElMessage.success('更新成功')
					} else {
						await createBed(bedForm)
						ElMessage.success('创建成功')
					}
					dialogVisible.value = false
					fetchBedList()
					fetchStatistics()
				} catch (error) {
					console.error('操作失败:', error)
					ElMessage.error(error.message || '操作失败')
				}
			}
		})
	}
	
	//删除床位
	const handleDelete = (row) => {
		const confirmMessage = isAdmin.value 
			? '确定要删除该床位吗？此操作不可恢复。' 
			: '您没有删除床位的权限，请联系管理员。'
		
		const confirmType = isAdmin.value ? 'warning' : 'info'
		const showCancelButton = isAdmin.value
		const confirmButtonText = isAdmin.value ? '确定删除' : '我知道了'
		const cancelButtonText = '取消'

		ElMessageBox.confirm(confirmMessage, '提示', {
			confirmButtonText: confirmButtonText,
			cancelButtonText: cancelButtonText,
			showCancelButton: showCancelButton,
			type: confirmType,
			customClass: 'custom-message-box'
		}).then(async () => {
			if (!isAdmin.value) {
				return
			}
			try {
				const res = await deleteBed(row.id)
				if (res.code === 200) {
					ElMessage.success('删除成功')
					fetchBedList()
					fetchStatistics()
				} else {
					throw new Error(res.message || '删除失败')
				}
			} catch (error) {
				console.error('删除失败:', error)
				ElMessage.error('删除失败，请稍后重试')
			}
		}).catch(() => {
			// 用户取消删除操作
		})
	}
	
	//获取老人列表数据
	const fetchMembersList = async () => {
		membersLoading.value = true
		try {
			const res = await getMembers({
				status: 'active',
				include_details: true,
				unassigned: true
			})
			
			console.log('获取未分配床位老人列表响应:', res);
			
			if (res.code === 200 && res.data && res.data.members) {
				membersList.value = res.data.members;
				console.log('获取到的未分配床位老人列表:', membersList.value);
			} else {
				console.error('获取老人列表数据格式不正确:', res)
				ElMessage.warning('获取老人数据失败')
			}
		} catch (error) {
			console.error('获取老人列表失败:', error)
			ElMessage.error('获取老人数据失败')
		} finally {
			membersLoading.value = false
		}
	}
	
	//分配床位
	const handleAssign = (row) => {
		assignForm.bed_id = row.id
		assignForm.member_id = ''
		fetchMembersList() // 打开对话框前获取老人列表
		assignDialogVisible.value = true
	}
	
	//提交分配
	const handleAssignSubmit = async () => {
		if (!assignFormRef.value) return
		
		await assignFormRef.value.validate(async (valid) => {
			if (valid) {
				try {
					await assignBed(assignForm)
					ElMessage.success('分配成功')
					assignDialogVisible.value = false
					fetchBedList()
					fetchStatistics()
				} catch (error) {
					console.error('分配失败:', error)
				}
			}
		})
	}
	
	//取消分配
	const handleUnassign = (row) => {
		ElMessageBox.confirm('确定要取消该床位的分配吗？此操作将解除老人与床位的关联。', '提示', {
			confirmButtonText: '确定取消',
			cancelButtonText: '取消',
			type: 'warning'
		}).then(async () => {
			try {
				const res = await unassignBed(row.id)
				if (res.code === 200) {
					ElMessage.success('取消分配成功')
					fetchBedList()
					fetchStatistics()
				} else {
					throw new Error(res.message || '取消分配失败')
				}
			} catch (error) {
				console.error('取消分配失败:', error)
				ElMessage.error('取消分配失败，请稍后重试')
			}
		}).catch(() => {
			// 用户取消操作
		})
	}
	
	//分页
	const handleSizeChange = (val) => {
		pageSize.value = val
		fetchBedList()
	}
	
	const handleCurrentChange = (val) => {
		currentPage.value = val
		fetchBedList()
	}
	
	//状态相关
	const getStatusType = (status) => {
		const types = {
			available: 'success',
			occupied: 'warning',
			maintenance: 'danger'
		}
		return types[status] || 'info'
	}
	
	const getStatusText = (status) => {
		const texts = {
			available: '可用',
			occupied: '已占用',
			maintenance: '维护中'
		}
		return texts[status] || status
	}
	
	// 床位使用率图表配置
	const bedUsageOption = reactive({
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b}: {c} ({d}%)',
			backgroundColor: 'rgba(0, 0, 0, 0.7)',
			borderColor: '#5483B3',
			borderWidth: 1,
			padding: [10, 15],
			textStyle: {
				color: '#fff'
			}
		},
		legend: {
			orient: 'vertical',
			right: 10,
			top: 'center',
			textStyle: {
				color: '#fff',
				fontSize: 14
			},
			itemGap: 20,
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			textBorderColor: 'transparent'
		},
		series: [
			{
				name: '床位使用情况',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				label: {
					show: false,
					position: 'center',
					color: '#fff'
				},
				emphasis: {
					label: {
						show: true,
						fontSize: '18',
						fontWeight: 'bold'
					},
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				},
				labelLine: {
					show: false
				},
				itemStyle: {
					borderRadius: 5,
					borderColor: '#000',
					borderWidth: 2
				},
				animationType: 'scale',
				animationEasing: 'elasticOut',
				animationDelay: function (idx) {
					return Math.random() * 200;
				},
				data: [
					{ value: 0, name: '已占用', itemStyle: { color: 'rgba(245, 108, 108, 0.8)' } },
					{ value: 0, name: '可用', itemStyle: { color: 'rgba(103, 194, 58, 0.8)' } },
					{ value: 0, name: '维护中', itemStyle: { color: 'rgba(230, 162, 60, 0.8)' } }
				]
			}
		]
	});
	
	// 床位分布图表配置
	const bedDistributionOption = reactive({
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			},
			backgroundColor: 'rgba(0, 0, 0, 0.7)',
			borderColor: '#5483B3',
			borderWidth: 1,
			padding: [10, 15],
			textStyle: {
				color: '#fff'
			}
		},
		legend: {
			textStyle: {
				color: '#fff',
				fontSize: 14
			},
			itemGap: 20,
			icon: 'roundRect',
			itemWidth: 15,
			itemHeight: 10,
			top: 10
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: [],
			axisLine: {
				lineStyle: {
					color: 'rgba(255, 255, 255, 0.3)'
				}
			},
			axisLabel: {
				color: '#fff',
				fontSize: 12,
				rotate: 30,
				margin: 15
			},
			axisTick: {
				alignWithLabel: true,
				lineStyle: {
					color: 'rgba(255, 255, 255, 0.3)'
				}
			}
		},
		yAxis: {
			type: 'value',
			axisLine: {
				show: true,
				lineStyle: {
					color: 'rgba(255, 255, 255, 0.3)'
				}
			},
			axisLabel: {
				color: '#fff',
				fontSize: 12
			},
			splitLine: {
				lineStyle: {
					color: 'rgba(255, 255, 255, 0.1)',
					type: 'dashed'
				}
			}
		},
		series: [
			{
				name: '已占用',
				type: 'bar',
				stack: 'total',
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#f56c6c' },
						{ offset: 1, color: '#c53030' }
					]),
					borderRadius: [4, 4, 0, 0]
				},
				emphasis: {
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#ff7c7c' },
							{ offset: 1, color: '#d54040' }
						])
					}
				},
				data: [],
				animation: true,
				animationDelay: function (idx) {
					return idx * 100 + 100;
				}
			},
			{
				name: '可用',
				type: 'bar',
				stack: 'total',
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#67c23a' },
						{ offset: 1, color: '#4e9e2e' }
					]),
					borderRadius: [4, 4, 0, 0]
				},
				emphasis: {
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#77d24a' },
							{ offset: 1, color: '#5eae3e' }
						])
					}
				},
				data: [],
				animation: true,
				animationDelay: function (idx) {
					return idx * 100 + 200;
				}
			},
			{
				name: '维护中',
				type: 'bar',
				stack: 'total',
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#e6a23c' },
						{ offset: 1, color: '#c67d1e' }
					]),
					borderRadius: [4, 4, 0, 0]
				},
				emphasis: {
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#f6b24c' },
							{ offset: 1, color: '#d68d2e' }
						])
					}
				},
				data: [],
				animation: true,
				animationDelay: function (idx) {
					return idx * 100 + 300;
				}
			}
		],
		animationEasing: 'elasticOut',
		animationDelayUpdate: function (idx) {
			return idx * 5;
		}
	});
	
	// 更新图表数据
	const updateChartData = (allBeds) => {
		// 更新床位使用率图表
		bedUsageOption.series[0].data[0].value = statistics.occupied;
		bedUsageOption.series[0].data[1].value = statistics.available;
		bedUsageOption.series[0].data[2].value = statistics.maintenance;
		
		// 获取楼宇分布数据
		const buildings = Array.from(new Set(allBeds.map(bed => bed.building)));
		bedDistributionOption.xAxis.data = buildings;
		
		// 按楼宇统计床位状态
		const occupiedByBuilding = [];
		const availableByBuilding = [];
		const maintenanceByBuilding = [];
		
		buildings.forEach(building => {
			const bedsInBuilding = allBeds.filter(bed => bed.building === building);
			occupiedByBuilding.push(bedsInBuilding.filter(bed => bed.status === 'occupied').length);
			availableByBuilding.push(bedsInBuilding.filter(bed => bed.status === 'available').length);
			maintenanceByBuilding.push(bedsInBuilding.filter(bed => bed.status === 'maintenance').length);
		});
		
		bedDistributionOption.series[0].data = occupiedByBuilding;
		bedDistributionOption.series[1].data = availableByBuilding;
		bedDistributionOption.series[2].data = maintenanceByBuilding;
	};
	
	//初始化
	onMounted(() => {
		fetchBedList()
		fetchStatistics()
	})

	// 手动刷新方法
	const handleRefresh = () => {
		fetchBedList()
		fetchStatistics()
	}

	// 在 setup 中添加用户角色判断
	const userStore = useUserStore()
	const isAdmin = computed(() => {
		return userStore.userInfo.role === 'admin'
	})
</script>

<style scoped>
.bed-page {
	height: 100%;
	overflow-y: auto;
	padding: 10px;
}

.bed-content {
	height: calc(100vh - 20px);
	overflow-y: auto;
	padding-right: 10px;
}

.bed-container {
	padding: 20px;
	/* background: linear-gradient(135deg, #000000 0%, #111111 100%); */
	min-height: 100vh;
	overflow-x: hidden;
}

.dark-table {
	--el-table-bg-color: rgba(0, 0, 0, 0.2);
	--el-table-tr-bg-color: rgba(0, 0, 0, 0.2);
	--el-table-border-color: rgba(255, 255, 255, 0.1);
	--el-table-text-color: #fff;
	--el-table-header-text-color: #7DA0CA;
	--el-table-header-bg-color: rgba(0, 0, 0, 0.5);
	margin-top: 15px;
	border-radius: 4px;
	overflow: hidden;
}

.dark-table :deep(td), .dark-table :deep(th) {
	border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
	transition: background-color 0.3s;
}

.dark-table :deep(tr:hover > td) {
	background-color: rgba(250, 196, 0, 0.1) !important;
}

.statistics {
	margin: 20px 0;
}

.stat-card {
	background: rgba(30, 30, 30, 0.6);
	padding: 20px;
	border-radius: 8px;
	text-align: center;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	height: 100px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.stat-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.stat-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 2px;
	background: #7DA0CA;
}

.stat-title {
	font-size: 16px;
	color: #7DA0CA;
	margin-bottom: 10px;
	text-transform: uppercase;
	letter-spacing: 1px;
}

.stat-value {
	font-size: 32px;
	font-weight: bold;
	color: #fff;
	text-shadow: 0 0 10px rgba(250, 196, 0, 0.3);
}

.pagination {
	margin-top: 20px;
	text-align: center;
}

.el-row {
	margin-bottom: 20px;
}

.search-form {
	background: rgba(30, 30, 30, 0.6);
	padding: 20px;
	border-radius: 8px;
	margin-bottom: 20px;
}

:deep(.el-form-item__label) {
	color: #eee;
}

:deep(.el-button) {
	transition: all 0.3s ease;
}

:deep(.el-button:hover) {
	transform: translateY(-2px);
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

:deep(.el-button--primary) {
	background: linear-gradient(45deg, #5483B3, #5483B3);
	border: none;
}

:deep(.el-button--primary:hover) {
	background: linear-gradient(45deg, #5483B3, #5483B3);
}

:deep(.el-button--danger) {
	background: linear-gradient(45deg, #f56c6c, #c53030);
	border: none;
}

:deep(.el-button--success) {
	background: linear-gradient(45deg, #67c23a, #4e9e2e);
	border: none;
}

:deep(.el-button--warning) {
	background: linear-gradient(45deg, #e6a23c, #c67d1e);
	border: none;
}

:deep(.el-tag) {
	border: none;
	font-weight: bold;
	padding: 2px 10px;
	border-radius: 12px;
}

:deep(.el-dialog) {
	background-color: #1a1a1a;
	border-radius: 10px;
	box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
	overflow: hidden;
}

:deep(.el-dialog__title) {
	color: #5483B3;
	font-weight: bold;
}

:deep(.el-dialog__body) {
	color: #fff;
}

:deep(.el-dialog__header) {
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	padding: 20px;
}

:deep(.el-dialog__footer) {
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding: 15px 20px;
}

:deep(.el-input__inner) {
	background-color: rgba(255, 255, 255, 0.15);
	color: #fff;
	border-color: rgba(250, 196, 0, 0.3);
	border-radius: 4px;
	transition: all 0.3s ease;
	font-weight: bold;
}

:deep(.el-input__inner::placeholder) {
	color: rgba(255, 255, 255, 0.5);
}

:deep(.el-input__inner:focus) {
	border-color: #5483B3;
	box-shadow: 0 0 10px rgba(250, 196, 0, 0.5);
	background-color: rgba(250, 196, 0, 0.1);
}

:deep(.el-textarea__inner) {
	background-color: rgba(255, 255, 255, 0.15);
	color: #fff;
	border-color: rgba(250, 196, 0, 0.3);
	border-radius: 4px;
	transition: all 0.3s ease;
}

:deep(.el-textarea__inner::placeholder) {
	color: rgba(255, 255, 255, 0.5);
}

:deep(.el-textarea__inner:focus) {
	border-color: #5483B3;
	box-shadow: 0 0 10px rgba(250, 196, 0, 0.5);
	background-color: rgba(250, 196, 0, 0.1);
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
	background-color: rgba(0, 0, 0, 0.4);
	color: #fff;
	border-color: rgba(255, 255, 255, 0.2);
}

:deep(.el-select__popper) {
	background-color: #1a1a1a;
	border: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 5px 20px rgba(0, 0, 0, 0.8);
}

:deep(.el-select-dropdown__item) {
	color: #eee;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
	background-color: rgba(250, 196, 0, 0.1);
	color: #5483B3;
}

:deep(.el-pagination) {
	--el-pagination-bg-color: transparent;
	--el-pagination-text-color: #fff;
	--el-pagination-button-color: #fff;
	--el-pagination-hover-color: #5483B3;
}

:deep(.el-pagination button) {
	background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-pagination button:hover) {
	color: #5483B3;
}

:deep(.el-pagination .el-pager li) {
	background-color: rgba(255, 255, 255, 0.1);
	color: #fff;
}

:deep(.el-pagination .el-pager li.is-active) {
	background-color: #C1E8FF;
	color: #7DA0CA;
}

:deep(.el-pagination .el-pager li:hover) {
	color: #5483B3;
}

.member-option {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
}

.member-info {
	font-size: 12px;
	color: #aaa;
	margin-left: 10px;
}
</style>
