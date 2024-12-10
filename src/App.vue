<template>
	<h1 class="title">Детектор огня</h1>
	<div id="app">
		<CheckHealth />
		<FireDetection />
	</div>
</template>

<script setup lang="ts">
import CheckHealth from '@/components/CheckHealth/CheckHealth.vue';
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
	border: $all-border-width solid $all-border-color;
	border-radius: $all-border-radius;
}
</style>
