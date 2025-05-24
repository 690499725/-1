<template>
  <div class="container" :class="curTheme">
  	<menubar ref="menubarRef" v-if="showMenu" @showSettingDialog="settingshow = true" @logout="handleLogout"></menubar>
  
  	<router-view></router-view>
  
  	<settingdialog v-if="settingshow" @saved="refreshConfig" @hideSetting="hideSetting"></settingdialog>
    
    <!-- 添加智能助手组件 -->
    <ai-assistant ref="aiAssistantRef"></ai-assistant>
  </div>
</template>

<script setup>
	import {
		ref,
		onMounted,
		onBeforeUnmount,
		computed,
		provide
	} from 'vue'
	import {
		useRouter,
		useRoute
	} from 'vue-router'
	
	import "./assets/css/dark_theme.css"
	import "./assets/css/default.css"
	
	import menubar from "./components/menubar.vue"
	import aiAssistant from "./components/AiAssistant.vue"
	// 注意：缺少settingdialog组件的导入，需要创建或导入该组件
	
	import config from './assets/js/config.js'
	import { useUserStore } from './stores/userStore'
	
	const router = useRouter()
	const route = useRoute()
	const userStore = useUserStore()
	
	// 创建menubar的ref引用
	const menubarRef = ref(null)
	
	// 创建智能助手的ref引用
	const aiAssistantRef = ref(null)
	
	// 提供menubar的ref给所有子组件
	provide('menubarRef', menubarRef)
	
	// 提供aiAssistant的ref给所有子组件
	provide('aiAssistantRef', aiAssistantRef)
	
	// 是否显示菜单栏
	const showMenu = computed(() => {
		return route.path !== '/login' && route.path !== '/register'
	})
	
	/**
	 * 配置相关信息
	 */
	let configs = config.getConfig();
	let curTheme = "dark";

	// 使用try-catch避免配置解析错误导致系统崩溃
	try {
		configs.forEach((item) => {
			//更新界面主题
			if (item.key === 'theme' && item.value) {
				curTheme = item.value;
			}
		});
	} catch (err) {
		// 配置加载失败时使用默认值
		curTheme = "dark";
	}

	const settingshow = ref(false);
	const hideSetting = () => {
		settingshow.value = false;
	}
	
	//刷新配置
	const refreshConfig = () => {
		//简单期间，直接刷新界面
		window.location.reload();
	}
	
	const handleLogout = () => {
		// 清除本地存储的用户信息
		localStorage.removeItem('token')
		localStorage.removeItem('userInfo')
		// 重置用户状态
		userStore.setUserInfo(null)
		// 跳转到登录页面
		window.location.href = '/#/login'
	}
	
	onMounted(() => {
		// 检查是否已登录
		const token = localStorage.getItem('token')
		if (!token && route.path !== '/login') {
			router.push('/login')
		}
		
		// 添加快捷键监听，按Alt+Y打开智能助手
		document.addEventListener('keydown', handleKeyDown)
	});
	onBeforeUnmount(() => {
		// 移除事件监听
		document.removeEventListener('keydown', handleKeyDown)
	});
	
	// 处理键盘快捷键
	const handleKeyDown = (event) => {
		// Alt+Y 打开/关闭智能助手
		if (event.altKey && event.key === 'y') {
			if (aiAssistantRef.value) {
				aiAssistantRef.value.toggleChat()
			}
		}
	}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow-y: auto;
  background-color: #141414;
}

.container {
	width: 100%;
	height: 100vh;
	overflow: hidden;
}
</style>
