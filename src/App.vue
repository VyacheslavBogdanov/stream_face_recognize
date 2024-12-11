<template>
	<h1 class="title">Детектор огня</h1>
	<div id="app">
		<CheckHealth :messageTypes="messageTypes" />
		<FireDetection :messageTypes="messageTypes" />
	</div>
</template>

<script setup lang="ts">
import CheckHealth from '@/components/CheckHealth/CheckHealth.vue';
import FireDetection from '@/components/FireDetection/FireDetection.vue';
import { ref, onMounted } from 'vue';
import { fetchData } from './components/mocks/db';
import type { MessgeType } from './components/utils/types.ts';

const messageTypes = ref<MessgeType[]>([]);

const loadMessageTypes = async () => {
	try {
		messageTypes.value = await fetchData('/message-types');
	} catch (error) {
		console.error('Ошибка загрузки:', error);
	}
};

onMounted(loadMessageTypes);
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
