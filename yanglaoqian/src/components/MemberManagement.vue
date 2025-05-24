<template>
  <div class="member-management">
    <!-- 老人管理功能头部 -->
    <div class="header">
      <h3>老人管理</h3>
      <el-button type="primary" size="small" @click="openAddMemberDialog">添加老人</el-button>
    </div>
    
    <!-- 老人列表 -->
    <el-table :data="memberList" style="width: 100%" v-loading="loading" class="dark-table">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="gender" label="性别" />
      <el-table-column prop="age" label="年龄" />
      <el-table-column prop="care_level" label="护理级别" />
      <el-table-column prop="responsibility_worker" label="责任护工">
        <template #default="{ row }">
          <span>{{ row.responsibility_worker || '未分配' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="健康状况">
        <template #default="{ row }">
          <el-popover
            placement="top-start"
            trigger="hover"
            :width="300"
            :content="formatHealthInfo(row)"
          >
            <template #reference>
              <el-tag 
                v-if="row.health_conditions && row.health_conditions.length > 0" 
                type="danger"
              >
                {{ row.health_conditions.length }}项
              </el-tag>
              <el-tag v-else type="info">暂无记录</el-tag>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="bed_number" label="床位号">
        <template #default="{ row }">
          <span v-if="row.bed_id">{{ formatBedNumber(row) }}</span>
          <el-tag v-else type="info">未分配</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row, $index }">
          <el-button type="primary" size="small" @click="openEditMemberDialog(row, $index)">编辑</el-button>
          <el-button 
            type="success" 
            size="small" 
            @click="openAssignBedDialog(row, $index)"
            v-if="!row.bed_id"
          >分配床位</el-button>
          <el-button 
            type="warning" 
            size="small" 
            @click="handleUnassignBed(row, $index)"
            v-if="row.bed_id"
          >取消分配</el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDeleteMember(row)"
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
    
    <!-- 可视化组件 -->
    <el-row :gutter="10" style="margin-top: 20px;">
      <el-col :span="12">
        <chartpanel title="老人护理级别分布">
          <v-chart ref="careLevelChart" style="min-height: 300px;" :option="careLevelOption"></v-chart>
        </chartpanel>
      </el-col>
      <el-col :span="12">
        <chartpanel title="老人年龄分布">
          <v-chart ref="ageDistributionChart" style="min-height: 300px;" :option="ageDistributionOption"></v-chart>
        </chartpanel>
      </el-col>
    </el-row>
    
    <!-- 添加/编辑老人对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加老人' : '编辑老人'"
      v-model="memberDialogVisible"
      width="500px"
    >
      <el-form :model="memberForm" :rules="memberRules" ref="memberFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="memberForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="memberForm.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="memberForm.age" :min="1" :max="150" />
        </el-form-item>
        <el-form-item label="身份证号" prop="id_card">
          <el-input v-model="memberForm.id_card" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="紧急联系人" prop="emergency_contact">
          <el-input v-model="memberForm.emergency_contact" placeholder="请输入紧急联系人" />
        </el-form-item>
        <el-form-item label="紧急电话" prop="emergency_phone">
          <el-input v-model="memberForm.emergency_phone" placeholder="请输入紧急联系电话" />
        </el-form-item>
        <el-form-item label="护理级别" prop="care_level">
          <el-select v-model="memberForm.care_level" placeholder="请选择护理级别">
            <el-option label="自理" value="自理" />
            <el-option label="介助" value="介助" />
            <el-option label="介护" value="介护" />
            <el-option label="特护" value="特护" />
          </el-select>
        </el-form-item>
        <el-form-item label="健康状况" prop="health_conditions">
          <el-select v-model="memberForm.health_conditions" multiple placeholder="请选择健康状况" style="width: 100%">
            <el-option label="高血压" value="高血压" />
            <el-option label="糖尿病" value="糖尿病" />
            <el-option label="心脏病" value="心脏病" />
            <el-option label="老年痴呆" value="老年痴呆" />
            <el-option label="骨质疏松" value="骨质疏松" />
            <el-option label="关节炎" value="关节炎" />
            <el-option label="中风" value="中风" />
            <el-option label="肺炎" value="肺炎" />
            <el-option label="冠心病" value="冠心病" />
            <el-option label="白内障" value="白内障" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任护工" prop="responsibility_worker">
          <el-select v-model="memberForm.responsibility_worker" placeholder="请选择责任护工" filterable allow-create>
            <el-option
              v-for="item in workerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="健康详情" prop="health_detail">
          <el-input type="textarea" v-model="memberForm.health_detail" placeholder="请输入健康状况详细描述" rows="3" />
        </el-form-item>
      </el-form>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMembers, createMember, updateMember, deleteMember, getMember } from '../api/member'
import { getBeds, assignBed, unassignBed } from '../api/bed'
import chartpanel from "@/components/chartpanel.vue"
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  PieChart,
  BarChart,
  LineChart
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from "echarts/components";
import VChart from "vue-echarts";
import * as echarts from 'echarts/core';
import { useUserStore } from '@/stores/userStore'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
]);

// 老人列表数据
const memberList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 护工列表（模拟数据，实际应从API获取）
const workerOptions = [
  { label: '张护工', value: '张护工' },
  { label: '王护工', value: '王护工' },
  { label: '李护工', value: '李护工' },
  { label: '赵护工', value: '赵护工' },
  { label: '刘护工', value: '刘护工' }
]

// 护理级别分布图表配置
const careLevelOption = reactive({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: '#fac400',
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
      name: '护理级别分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold',
          textBorderColor: 'transparent',
          textShadowBlur: 4,
          textShadowColor: 'rgba(0, 0, 0, 0.5)'
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
        { value: 0, name: '自理', itemStyle: { color: 'rgba(103, 194, 58, 0.8)' } },
        { value: 0, name: '介助', itemStyle: { color: 'rgba(230, 162, 60, 0.8)' } },
        { value: 0, name: '介护', itemStyle: { color: 'rgba(245, 108, 108, 0.8)' } },
        { value: 0, name: '特护', itemStyle: { color: 'rgba(144, 147, 153, 0.8)' } }
      ]
    }
  ]
});

// 年龄分布图表配置
const ageDistributionOption = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: '#fac400',
    borderWidth: 1,
    padding: [10, 15],
    textStyle: {
      color: '#fff'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '6%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['60-70岁', '71-80岁', '81-90岁', '91-100岁', '100岁以上'],
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisLabel: {
      color: '#fff',
      fontSize: 12,
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
    name: '人数',
    nameTextStyle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 12,
      padding: [0, 0, 5, 0]
    },
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
      name: '人数',
      type: 'bar',
      barWidth: '60%',
      data: [0, 0, 0, 0, 0],
      itemStyle: {
        color: function(params) {
          const colorList = [
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67c23a' },
              { offset: 1, color: '#3e9320' }
            ]),
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#e6a23c' },
              { offset: 1, color: '#b57f20' }
            ]),
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f56c6c' },
              { offset: 1, color: '#c03b3b' }
            ]),
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#909399' },
              { offset: 1, color: '#606266' }
            ]),
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#409eff' },
              { offset: 1, color: '#2b76c5' }
            ])
          ];
          return colorList[params.dataIndex];
        },
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      animation: true,
      animationDelay: function (idx) {
        return idx * 120;
      }
    }
  ],
  animationEasing: 'elasticOut'
});

// 在 setup 中添加用户角色判断
const userStore = useUserStore()
const isAdmin = computed(() => {
	return userStore.userInfo.role === 'admin'
})

// 获取老人列表
const fetchMembers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      // 可以添加筛选条件
      // name: searchName.value,
      // gender: filterGender.value,
      // care_level: filterCareLevel.value,
      // status: filterStatus.value
    }
    
    const res = await getMembers(params)
    console.log('获取老人列表响应:', res)
    
    if (res.code === 200) {
      // 处理后端可能的数据不一致问题
      const processedMembers = (res.data.members || []).map(member => {
        // 如果床位ID为空，确保所有床位相关信息都为空
        if (!member.bed_id) {
          member.bed_number = null
          member.building = null
          member.floor = null
          member.room_number = null
        }
        return member
      })
      
      memberList.value = processedMembers
      total.value = res.data.total || 0
      
      // 检查床位信息是否完整
      memberList.value.forEach(member => {
        console.log(`老人信息: ${member.name}, 床位ID: ${member.bed_id}, 床位号: ${member.bed_number}`)
      })
      
      // 获取所有老人数据用于图表统计
      const allMembersRes = await getMembers({
        limit: total.value // 获取所有数据
      })
      
      if (allMembersRes.code === 200 && allMembersRes.data && allMembersRes.data.members) {
        // 使用所有数据更新图表
        updateChartData(allMembersRes.data.members)
      }
    } else {
      ElMessage.error('获取老人列表失败')
      console.error('获取老人列表失败:', res)
    }
  } catch (error) {
    console.error('获取老人列表失败:', error)
    ElMessage.error('获取老人列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 格式化床位信息
const formatBedNumber = (member) => {
  // 严格检查是否有床位ID和床位号
  if (!member.bed_id || !member.bed_number) {
    return '未分配'
  }
  
  // 格式化床位显示
  const building = member.building || ''
  const floor = member.floor || ''
  const roomNumber = member.room_number || ''
  const bedNumber = member.bed_number || ''
  
  return `${building}-${floor}-${roomNumber}-${bedNumber}`.replace(/--+/g, '-').replace(/^-|-$/g, '')
}

// 添加老人对话框
const memberDialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const currentEditIndex = ref(-1)
const memberForm = reactive({
  name: '',
  gender: '',
  age: 60,
  id_card: '',
  phone: '',
  emergency_contact: '',
  emergency_phone: '',
  care_level: '',
  health_conditions: [],
  responsibility_worker: '',
  health_detail: ''
})

// 表单规则
const memberRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 150, message: '年龄范围为1-150岁', trigger: 'blur' }
  ],
  id_card: [
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  emergency_phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  care_level: [
    { required: true, message: '请选择护理级别', trigger: 'change' }
  ]
}

// 打开添加老人对话框
const openAddMemberDialog = () => {
  dialogType.value = 'add'
  resetMemberForm()
  memberDialogVisible.value = true
}

// 打开编辑老人对话框
const openEditMemberDialog = (row, index) => {
  dialogType.value = 'edit'
  currentEditIndex.value = index
  // 复制数据到表单
  Object.keys(memberForm).forEach(key => {
    if (key in row) {
      memberForm[key] = row[key]
    }
  })
  memberDialogVisible.value = true
}

// 重置表单
const resetMemberForm = () => {
  Object.keys(memberForm).forEach(key => {
    if (key === 'care_level') {
      memberForm[key] = '自理'
    } else if (key === 'age') {
      memberForm[key] = 60
    } else if (key === 'responsibility_worker') {
      memberForm[key] = ''
    } else if (key === 'health_detail') {
      memberForm[key] = ''
    } else {
      memberForm[key] = ''
    }
  })
}

// 提交老人表单
const memberFormRef = ref(null)
const submitMemberForm = async () => {
  if (!memberFormRef.value) return
  
  memberFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      const formData = {
        ...memberForm,
        // 确保所有必要字段都包含
        responsibility_worker: memberForm.responsibility_worker || '',
        health_detail: memberForm.health_detail || ''
      }
      
      if (dialogType.value === 'add') {
        // 创建新老人
        const res = await createMember(formData)
        if (res.code === 201) {
          ElMessage.success('添加老人成功')
          // 刷新列表
          fetchMembers()
        } else {
          ElMessage.error('添加老人失败')
        }
      } else {
        // 更新老人信息
        const id = memberList.value[currentEditIndex.value].id
        const res = await updateMember(id, formData)
        if (res.code === 200) {
          ElMessage.success('更新老人信息成功')
          // 更新列表中的数据
          Object.assign(memberList.value[currentEditIndex.value], formData)
          // 更新图表数据
          updateChartData(memberList.value)
        } else {
          ElMessage.error('更新老人信息失败')
        }
      }
      memberDialogVisible.value = false
    } catch (error) {
      console.error('保存老人信息失败:', error)
      ElMessage.error('保存失败: ' + error.message)
    }
  })
}

// 修改删除方法
const handleDeleteMember = (row) => {
	const confirmMessage = isAdmin.value 
		? '确定要删除该老人吗？此操作不可恢复。' 
		: '您没有删除老人信息的权限，请联系管理员。'
	
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
			const res = await deleteMember(row.id)
			if (res.code === 200) {
				ElMessage.success('删除成功')
				fetchMembers()
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

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchMembers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchMembers()
}

// 床位分配对话框
const assignBedDialogVisible = ref(false)
const availableBeds = ref([])
const assignForm = reactive({
  member_id: '',
  member_name: '',
  bed_id: ''
})
const assignRules = {
  bed_id: [
    { required: true, message: '请选择床位', trigger: 'change' }
  ]
}

// 打开分配床位对话框
const openAssignBedDialog = (row) => {
  assignForm.member_id = row.id
  assignForm.member_name = row.name
  assignForm.bed_id = ''
  fetchAvailableBeds()
  assignBedDialogVisible.value = true
}

// 获取可用床位
const fetchAvailableBeds = async () => {
  try {
    const params = {
      status: 'available'
    }
    const res = await getBeds(params)
    if (res.code === 200 && res.data && res.data.beds) {
      availableBeds.value = res.data.beds
    } else {
      availableBeds.value = []
      ElMessage.warning('没有可用的床位')
    }
  } catch (error) {
    console.error('获取可用床位失败:', error)
    ElMessage.error('获取可用床位失败: ' + error.message)
    availableBeds.value = []
  }
}

// 提交床位分配
const assignFormRef = ref(null)
const submitAssignBed = async () => {
  if (!assignFormRef.value) return
  
  assignFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      const res = await assignBed({
        member_id: assignForm.member_id,
        bed_id: assignForm.bed_id
      })
      
      if (res.code === 200) {
        ElMessage.success('床位分配成功')
        assignBedDialogVisible.value = false
        // 刷新列表
        fetchMembers()
      } else {
        ElMessage.error('床位分配失败')
      }
    } catch (error) {
      console.error('床位分配失败:', error)
      ElMessage.error('床位分配失败: ' + error.message)
    }
  })
}

// 取消床位分配
const handleUnassignBed = (row) => {
  if (!row.bed_id) {
    ElMessage.warning('该老人未分配床位')
    return
  }
  
  ElMessageBox.confirm('确定要取消该床位分配吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await unassignBed(row.bed_id)
      if (res.code === 200) {
        ElMessage.success('取消分配成功')
        
        // 强制更新本地列表中该老人的床位信息
        const memberIndex = memberList.value.findIndex(m => m.id === row.id)
        if (memberIndex >= 0) {
          // 清除床位相关信息
          memberList.value[memberIndex].bed_id = null
          memberList.value[memberIndex].bed_number = null
          memberList.value[memberIndex].building = null
          memberList.value[memberIndex].floor = null
          memberList.value[memberIndex].room_number = null
          
          console.log('已强制清除本地床位信息:', memberList.value[memberIndex].name)
        }
      } else {
        ElMessage.error('取消分配失败')
      }
    } catch (error) {
      console.error('取消床位分配失败:', error)
      ElMessage.error('取消分配失败: ' + error.message)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 初始化
onMounted(() => {
  fetchMembers()
})

// 向父组件暴露的方法
defineExpose({
  fetchMembers
})

// 格式化健康信息显示
const formatHealthInfo = (member) => {
  let info = '';
  
  // 显示健康状况标签
  if (member.health_conditions && member.health_conditions.length > 0) {
    info += `健康状况: ${member.health_conditions.join('、')}\n\n`;
  } else {
    info += '健康状况: 暂无记录\n\n';
  }
  
  // 显示健康详情
  if (member.health_detail) {
    info += `详细描述: ${member.health_detail}`;
  } else {
    info += '详细描述: 暂无';
  }
  
  return info;
}

// 更新图表数据
const updateChartData = (allMembers) => {
  // 更新护理级别分布图表
  const careLevels = {
    '自理': 0,
    '介助': 0,
    '介护': 0,
    '特护': 0
  };
  
  // 更新年龄分布
  const ageGroups = {
    '60-70岁': 0,
    '71-80岁': 0,
    '81-90岁': 0,
    '91-100岁': 0,
    '100岁以上': 0
  };
  
  // 使用传入的完整数据进行统计
  (allMembers || []).forEach(member => {
    // 更新护理级别统计
    if (careLevels.hasOwnProperty(member.care_level)) {
      careLevels[member.care_level]++;
    }
    
    // 更新年龄段统计
    const age = parseInt(member.age);
    if (age >= 60 && age <= 70) {
      ageGroups['60-70岁']++;
    } else if (age >= 71 && age <= 80) {
      ageGroups['71-80岁']++;
    } else if (age >= 81 && age <= 90) {
      ageGroups['81-90岁']++;
    } else if (age >= 91 && age <= 100) {
      ageGroups['91-100岁']++;
    } else if (age > 100) {
      ageGroups['100岁以上']++;
    }
  });
  
  // 更新护理级别图表数据
  careLevelOption.series[0].data[0].value = careLevels['自理'];
  careLevelOption.series[0].data[1].value = careLevels['介助'];
  careLevelOption.series[0].data[2].value = careLevels['介护'];
  careLevelOption.series[0].data[3].value = careLevels['特护'];
  
  // 更新年龄分布图表数据
  ageDistributionOption.series[0].data = [
    ageGroups['60-70岁'],
    ageGroups['71-80岁'],
    ageGroups['81-90岁'],
    ageGroups['91-100岁'],
    ageGroups['100岁以上']
  ];
};
</script>

<style scoped>
.member-management {
  width: 100%;
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.member-management::-webkit-scrollbar {
  width: 8px;
}

.member-management::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.member-management::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.member-management::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: rgba(30, 30, 30, 0.6);
  padding: 15px 20px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #7DA0CA;
}

.header h3 {
  margin: 0;
  font-size: 18px;
  color: #C1E8FF;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
}

.header h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: #C1E8FF;
  margin-right: 10px;
  border-radius: 2px;
}

.dark-table {
  --el-table-bg-color: rgba(0, 0, 0, 0.2);
  --el-table-tr-bg-color: rgba(0, 0, 0, 0.2);
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-text-color: #fff;
  --el-table-header-text-color: #c1e8ff;
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

.pagination {
  margin-top: 20px;
  text-align: center;
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
  color: #5483B3;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
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
  background: #5483B3;
  border: none;
}

:deep(.el-button--primary:hover) {
  background: #5483B3;
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
  border-color: #fac400;
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
  border-color: #fac400;
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
  color: #fac400;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #fff;
  --el-pagination-button-color: #fff;
  --el-pagination-hover-color: #fac400;
}

:deep(.el-pagination button) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-pagination button:hover) {
  color: #fac400;
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

/* 图表容器样式优化 */
.el-row {
  margin-bottom: 20px;
}

.el-col {
  margin-bottom: 20px;
}

/* 图表内部样式 */
:deep(.echarts) {
  border-radius: 4px;
  overflow: hidden;
}
</style> 