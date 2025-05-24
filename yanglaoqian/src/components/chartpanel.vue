<template>
	<div class="chart">
		<div class="chart_title" v-if="title">{{title}}</div>
		<div class="chart_content">
			<slot></slot>
		</div>
		<div class="border_line topleft1"></div>
		<div class="border_line topleft2"></div>
		<div class="border_line topright1"></div>
		<div class="border_line topright2"></div>
		<div class="border_line bottomleft1"></div>
		<div class="border_line bottomleft2"></div>
		<div class="border_line bottomright1"></div>
		<div class="border_line bottomright2"></div>
	</div>
</template>

<script setup>
	import {
		ref,
		reactive,
		defineEmits,
		defineProps
	} from 'vue'

	//外部参数
	const props = defineProps({
		title: String
	})
</script>

<style scoped>
.chart {
	position: relative;
	padding: 0.8vh;
	background: rgba(15, 23, 42, 0.85);
	backdrop-filter: blur(10px);
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	margin-bottom: 0.5vh;
	min-height: 10vh;
	display: flex;
	flex-direction: column;
}

.chart:hover {
	transform: translateY(-2px);
	background: rgba(255, 255, 255, 0.1);
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.chart_title {
	height: 2vh;
	line-height: 2vh;
	font-size: 1rem;
	font-weight: bold;
	color: #FFFFFF;
	text-align: center;
	margin-bottom: 0.5vh;
	background: linear-gradient(90deg, #4e97ff, #3fcea9);
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

.chart_content {
	flex: 1;
	width: 100%;
	position: relative;
}

.border_line {
	position: absolute;
	background: linear-gradient(90deg, #4e97ff, #3fcea9);
	z-index: 1;
}

.topleft1 {
	width: 1.5vh;
	height: 0.2vh;
	top: 0;
	left: 0;
}

.topleft2 {
	width: 0.2vh;
	height: 1.5vh;
	top: 0;
	left: 0;
}

.topright1 {
	width: 1.5vh;
	height: 0.2vh;
	top: 0;
	right: 0;
}

.topright2 {
	width: 0.2vh;
	height: 1.5vh;
	top: 0;
	right: 0;
}

.bottomleft1 {
	width: 1.5vh;
	height: 0.2vh;
	bottom: 0;
	left: 0;
}

.bottomleft2 {
	width: 0.2vh;
	height: 1.5vh;
	bottom: 0;
	left: 0;
}

.bottomright1 {
	width: 1.5vh;
	height: 0.2vh;
	bottom: 0;
	right: 0;
}

.bottomright2 {
	width: 0.2vh;
	height: 1.5vh;
	bottom: 0;
	right: 0;
}
</style>
