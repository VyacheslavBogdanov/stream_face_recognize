<template>
	<div :class="['header', statusClass]">
		<span>{{ statusMessage }}</span>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import config from '../../config/config';

const status = ref<'active' | 'inactive'>('inactive');

const checkHealth = async () => {
	try {
		const response = await fetch(`${config.host}/health`);
		status.value = response.ok ? 'active' : 'inactive';
	} catch {
		status.value = 'inactive';
	}
};

let interval: number;
onMounted(() => {
	checkHealth();
	interval = setInterval(checkHealth, 15000);
});
onUnmounted(() => {
	clearInterval(interval);
});

const statusMessage = computed(() =>
	status.value === 'active'
		? 'Сервис детектора огня работает корректно'
		: 'Модуль детектора огня отключен',
);
const statusClass = computed(() =>
	status.value === 'active' ? 'header--active' : 'header--inactive',
);
</script>

<style lang="scss" scoped>
.header {
	text-align: center;
	padding: 10px;
	font-size: 16px;

	&--active {
		background-color: #dff0d8;
		color: #3c763d;
	}

	&--inactive {
		background-color: #f2dede;
		color: #a94442;
	}
}
</style>
