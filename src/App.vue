<template>
	<h1 class="title">FIRE-DETECTOR</h1>
	<div id="app">
		<Info />
		<FireDetection />
	</div>
</template>

<script setup lang="ts">
import Info from '@/components/CheckCorrect/Info.vue';
import FireDetection from '@/components/FireDetection/FireDetection.vue';
</script>

<style lang="scss" scoped>
@import './styles/main.scss';
.title {
	margin: 1%;
	color: rgba(100, 95, 95, 0.711);
}

#app {
	width: 40%;
	height: 500px;
	display: flex;
	align-items: center;
	flex-direction: column;
	font-family: sans-serif;
	background-color: #fdfdfd;
	margin: 1%;
	padding: 20px;
	border: 2px solid rgba(100, 95, 95, 0.711);
	border-radius: 3px;
}
</style>
