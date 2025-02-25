<template>
	<div id="app">
		<div class="app">
			<CheckHealth :messageTypes="messageTypes" :status="status" />
			<router-view :messageTypes="messageTypes" :status="status" />
		</div>
	</div>
</template>

<script setup lang="ts">
import CheckHealth from '@/components/CheckHealth/CheckHealth.vue';
import { ref, onMounted } from 'vue';
import { fetchData } from './components/mocks/db';
import { useHealthCheck } from './components/utils/useHealthCheck';
import type { MessageType } from './components/utils/types.ts';

const { status } = useHealthCheck();
const messageTypes = ref<MessageType[]>([]);

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

.app {
	width: 100%;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	background: #f4f6fb;
}
</style>
