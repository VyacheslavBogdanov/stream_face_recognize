<template>
	<div>
		<div
			v-for="(type, index) in filteredMessageTypes"
			:key="index"
			:class="['inform', type.class]"
		>
			<div class="inform__icon">ⓘ</div>
			<span>{{ type.message }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { fetchData, type MessageType } from '../mocks/db';
import config from '../../config/config';

const messageTypes = ref<MessageType[]>([]);
const status = ref<'active' | 'inactive'>('inactive');

const checkHealth = async () => {
	try {
		const response = await fetch(`${config.host}`);
		if (!response.ok) {
			console.error('Ошибка ответа сервера:', response.status);
			status.value = 'inactive';
			return;
		}
		status.value = 'active';
	} catch (error) {
		console.error('Ошибка подключения:', error);
		status.value = 'inactive';
	}
};

const filteredMessageTypes = computed(() => {
	return status.value === 'active'
		? [{ class: 'inform--success', message: 'Модуль детектора огня работает корректно' }]
		: [{ class: 'inform--warning', message: 'Модуль детектора огня отключен' }];
});

let interval: number;
onMounted(async () => {
	messageTypes.value = await fetchData('/message-types');
	checkHealth();
	interval = setInterval(checkHealth, 5000);
});
onUnmounted(() => {
	clearInterval(interval);
});
</script>

<style lang="scss" scoped>
@import '../Informer/utils/variables.scss';

.inform {
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px 30px 10px 40px;
	border-radius: $border-radius;
	max-width: fit-content;
	word-wrap: break-word;
	font-size: 23px;
	height: 40px;
	opacity: 0.85;

	&__icon {
		display: flex;
		position: absolute;
		transform: rotate(180deg);
		left: 10px;
		height: 30px;
	}

	&--success {
		background-color: #e0fde7;
		color: #2a9b44;
	}

	&--warning {
		background-color: #f9ebd8;
		color: #d77417;
	}
}
</style>
