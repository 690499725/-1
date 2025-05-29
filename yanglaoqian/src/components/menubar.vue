<template>
	<div class="flex title">
		<!-- 左侧菜单部分 -->
		<div class="flex_item flex left-container">
			<div class="header">乐龄慧护</div>
			<div class="menus flex_item flex">
				<div v-for="(menu, index) in menus" :key="index" class="menu_item flex"
					:class="{ 'menu_item_selected': menu.checked }" @click="menuChanged(menu)">
					{{menu.name}}
				</div>
			</div>
		</div>
		
		<!-- 右侧功能区域 -->
		<div class="right-container flex">
			<!-- 时间显示 -->
			<div class="time-box">
				<div class="time-text">{{time}}</div>
				<div class="date-text">{{date}}</div>
			</div>
			<div class="split_line_h"></div>
			
			<!-- 天气显示 -->
			<div class="weather-box">
				<div class="weather flex">
					<div class="icon">
						<el-icon>
							<component :is="weather.icon" />
						</el-icon>
					</div>
					<div class="weather-info">
						<div class="temp-text">{{weather.temp}}°C</div>
						<div class="desc-text">
							<span class="city">{{weather.city}}</span>
							<span>{{weather.desc}}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="split_line_h"></div>
			
			<!-- 功能按钮区 -->
			<div class="action-buttons flex">
				<!-- 智能助手按钮 -->
				<div class="action-btn" @click="openAssistant">
					<el-tooltip content="智能助手 (Alt+A)" placement="bottom">
						<el-icon><ChatDotRound /></el-icon>
					</el-tooltip>
				</div>
				<div class="split_line_h"></div>
				
				<!-- 全屏按钮 -->
				<div class="action-btn" @click="screen">
					<el-tooltip :content="screenText" placement="bottom">
						<el-icon><FullScreen /></el-icon>
					</el-tooltip>
				</div>
				<div class="split_line_h"></div>
				
				<!-- 设置按钮 -->
				<div class="action-btn" @click="showSettingDialog">
					<el-tooltip content="设置" placement="bottom">
						<el-icon><Setting /></el-icon>
					</el-tooltip>
				</div>
				<div class="split_line_h"></div>
				
				<!-- 用户菜单 -->
				<div class="user-menu-container">
					<div class="user-avatar" @click="toggleUserMenu">
						<el-avatar :size="30" src="image/img016.png"></el-avatar>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 设置对话框 -->
	<SettingDialog ref="settingDialogRef" />

	<!-- 用户设置对话框 -->
	<UserSettingsDialog ref="userSettingsDialogRef" />

	<!-- 将用户下拉菜单移到最外层，确保不被其他元素遮挡 -->
	<teleport to="body">
		<div v-if="showUserMenu" class="user-dropdown-menu-container" @click.stop>
			<div class="user-dropdown-menu" :style="userMenuPosition">
				<div class="dropdown-item" @click="showUserSettings">
					<el-icon><User /></el-icon>
					<span>个人设置</span>
				</div>
				<div class="dropdown-divider"></div>
				<div class="dropdown-item" @click="handleLogout">
					<el-icon><SwitchButton /></el-icon>
					<span>退出登录</span>
				</div>
			</div>
		</div>
	</teleport>
</template>

<script setup>
	import {
		ref,
		watch,
		onMounted,
		defineExpose,
		inject,
		onBeforeUnmount,
		computed
	} from 'vue'
	import {
		useRoute,
		useRouter
	} from 'vue-router'
	import { ChatDotRound, FullScreen, Setting, User, SwitchButton } from '@element-plus/icons-vue'
	import SettingDialog from './SettingDialog.vue'
	import UserSettingsDialog from './UserSettingsDialog.vue'
	import { ElMessage } from 'element-plus'
	import { hasPermission } from '../utils/permission'
	
	import config from '../assets/js/config.js'
	
	// 接收emit
	const emits = defineEmits(['showSettingDialog', 'logout'])
	
	// 获取智能助手引用
	const aiAssistantRef = inject('aiAssistantRef')
	
	// 用户菜单状态和位置
	const showUserMenu = ref(false)
	const userAvatarRef = ref(null)
	
	// 计算用户菜单位置
	const userMenuPosition = computed(() => {
		// 默认位置，会在toggleUserMenu中更新
		return {
			top: '60px',
			right: '20px'
		}
	})
	
	// 打开智能助手
	const openAssistant = () => {
		if (aiAssistantRef.value) {
			aiAssistantRef.value.toggleChat()
		}
	}
	
	// 切换用户菜单显示状态
	const toggleUserMenu = () => {
		showUserMenu.value = !showUserMenu.value
		
		// 如果显示菜单，计算并设置菜单位置
		if (showUserMenu.value) {
			// 使用事件委托绑定点击关闭事件
			setTimeout(() => {
				document.addEventListener('click', closeUserMenuOnBlur)
			}, 100)
		}
	}
	
	// 处理用户设置点击
	const showUserSettings = () => {
		showUserMenu.value = false
		document.removeEventListener('click', closeUserMenuOnBlur)
		userSettingsDialogRef.value.open()
	}
	
	// 处理退出登录
	const handleLogout = () => {
		showUserMenu.value = false
		document.removeEventListener('click', closeUserMenuOnBlur)
		// 直接清除本地存储的令牌和用户信息
		localStorage.removeItem('token')
		localStorage.removeItem('userInfo')
		// 调用父组件的logout事件
		emits('logout')
		// 跳转到登录页面
		window.location.href = '/#/login'
	}
	
	// 关闭用户菜单（点击外部时）
	const closeUserMenuOnBlur = (event) => {
		const menuContainer = document.querySelector('.user-dropdown-menu-container')
		const avatar = document.querySelector('.user-avatar')
		
		// 如果点击的不是菜单容器或头像，则关闭菜单
		if (menuContainer && !menuContainer.contains(event.target) && 
			avatar && !avatar.contains(event.target)) {
			showUserMenu.value = false
			document.removeEventListener('click', closeUserMenuOnBlur)
		}
	}
	
	// 组件卸载时清理事件监听
	onBeforeUnmount(() => {
		document.removeEventListener('click', closeUserMenuOnBlur)
	})
	
	// 菜单项目
	const menus = ref([{
			name: '综合概览',
			path: '/index',
			checked: true,
			permission: null // 公开页面
		},
		{
			name: '床位监控',
			path: '/bed',
			checked: false,
			permission: ['bed']
		},
		{
			name: '老人管理',
			path: '/members',
			checked: false,
			permission: ['member']
		},
		{
			name: '健康监控',
			path: '/health',
			checked: false,
			permission: ['health']
		},
		{
			name: '安防监控',
			path: '/video',
			checked: false,
			permission: ['video']
		}
	])
	
	// 切换选中菜单
	const menuChanged = (item) => {
		// 检查权限
		if (item.permission && !hasPermission(item.permission)) {
			ElMessage.error('您没有访问该页面的权限')
			return
		}
		
		menus.value.forEach((menu) => {
			menu.checked = (menu.name === item.name)
		})
		router.push(item.path)
	}
	
	// 全屏功能
	const screenText = ref('全屏显示')
	const screen = () => {
		var element = document.documentElement;
		var isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
		if (isFullscreen) {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
			screenText.value = '全屏显示'
		} else {
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
			screenText.value = '退出全屏'
		}
	}
	
	// 设置对话框引用
	const settingDialogRef = ref(null)
	// 用户设置对话框引用
	const userSettingsDialogRef = ref(null)
	
	// 打开设置
	const showSettingDialog = () => {
		settingDialogRef.value.open()
	}
	
	// 设置系统时间
	let time = ref("")
	let date = ref("")
	setInterval(() => {
		let now = new Date()
		time.value = now.toTimeString().substring(0, 8)
		date.value = `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日 星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`
	}, 1000)
	
	// 天气信息
	const weather = ref({
		temp: '25',
		city: '武汉',
		desc: '晴',
		icon: 'Sunny',
	})
	
	// 更新天气方法 - 供外部组件调用
	const updateWeather = (newWeather) => {
		console.log('更新天气数据:', newWeather)
		if (newWeather) {
			weather.value = { ...weather.value, ...newWeather }
		}
	}
	
	// 获取当前路由
	const route = useRoute()
	const router = useRouter()
	
	// 根据当前路由更新选中菜单
	watch(() => route.path, (newPath) => {
		menus.value.forEach((menu) => {
			menu.checked = menu.path === newPath
		})
	}, { immediate: true })
	
	// 暴露方法给父组件使用
	defineExpose({
		updateWeather
	})
</script>

<style>
.title {
	width: 100%;
	height: 60px;
	background-color: #072157;
	overflow: hidden;
	justify-content: space-between;
}

/* 左侧容器 */
.left-container {
	display: flex;
	align-items: center;
	width: 60%; /* 减小左侧容器宽度 */
}

.header {
	padding: 0 20px;
	height: 60px;
	line-height: 60px;
	color: #fff;
	font-size: 20px;
	font-weight: bold;
	min-width: 150px; /* 确保标题有足够宽度 */
}

.menus {
	height: 100%;
	margin-left: 30px; /* 导航菜单向右移 */
}

.menus_div {
	height: 100%;
}

.menu_item {
	height: 60px;
	line-height: 60px;
	color: #fff;
	padding: 0 12px; /* 减小菜单项内边距 */
	cursor: pointer;
	transition: all 0.3s;
	position: relative;
	justify-content: center;
}

.menu_item:hover {
	background-color: rgba(255, 255, 255, 0.1);
	color: #4ecdc4;
}

.menu_item_selected {
	color: #4ecdc4;
	font-weight: bold;
}

.menu_item_selected::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 20%;
	width: 60%;
	height: 3px;
	background-color: #4ecdc4;
	border-radius: 2px;
}

/* 右侧容器 */
.right-container {
	display: flex;
	align-items: center;
	height: 100%;
}

/* 时间显示区 */
.time-box {
	min-width: 140px;
	padding: 0 10px;
	text-align: center;
}

.time-text {
	font-size: 18px;
	color: #fff;
	line-height: 30px;
}

.date-text {
	font-size: 12px;
	color: #ccc;
	line-height: 16px;
}

/* 天气显示区 */
.weather-box {
	min-width: 120px;
	padding: 0 10px;
}

.weather {
	display: flex;
	align-items: center;
}

.weather .icon {
	margin-right: 10px;
	font-size: 24px;
	color: #fff;
}

.weather-info {
	display: flex;
	flex-direction: column;
}

.temp-text {
	font-size: 18px;
	color: #fff;
	line-height: 24px;
}

.desc-text {
	font-size: 12px;
	color: #ccc;
	display: flex;
	gap: 5px;
}

.desc-text .city {
	color: #4ECDC4;
	font-weight: bold;
}

/* 分隔线 */
.split_line_h {
	width: 1px;
	height: 30px;
	background: rgba(255, 255, 255, 0.2);
	margin: 0 5px;
}

/* 功能按钮区 */
.action-buttons {
	display: flex;
	align-items: center;
	height: 100%;
}

.action-btn {
	padding: 0 15px;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: #fff;
	transition: all 0.3s;
}

.action-btn:hover {
	background-color: rgba(255, 255, 255, 0.1);
	color: #4ecdc4;
}

.action-btn i, .action-btn .el-icon {
	font-size: 20px;
}

/* 用户菜单 */
.user-menu-container {
	position: relative;
	height: 100%;
	padding: 0 15px;
	display: flex;
	align-items: center;
}

.user-avatar {
	cursor: pointer;
	transition: all 0.3s;
}

.user-avatar:hover {
	transform: scale(1.05);
}

.user-dropdown-menu {
	position: absolute;
	top: 60px;
	right: 5px;
	width: 160px;
	background: #fff;
	border-radius: 4px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	z-index: 2000; /* 增加z-index确保在其他元素上方 */
	overflow: hidden;
}

.dropdown-item {
	padding: 10px 15px;
	display: flex;
	align-items: center;
	font-size: 14px;
	color: #333;
	cursor: pointer;
	transition: all 0.3s;
}

.dropdown-item:hover {
	background-color: #f5f7fa;
	color: #4ecdc4;
}

.dropdown-item .el-icon {
	margin-right: 8px;
	font-size: 16px;
}

.dropdown-divider {
	height: 1px;
	background-color: #ebeef5;
	margin: 0;
}

/* 菜单过渡动画 */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

/* 用户菜单容器 - 全局定位 */
.user-dropdown-menu-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2000; /* 确保在最顶层 */
	pointer-events: none; /* 允许点击穿透背景 */
}

.user-dropdown-menu {
	position: absolute;
	top: 60px;
	right: 20px;
	width: 160px;
	background: #fff;
	border-radius: 4px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	z-index: 2001;
	overflow: hidden;
	pointer-events: auto; /* 恢复菜单的点击事件 */
	animation: dropDown 0.2s ease;
}

@keyframes dropDown {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
