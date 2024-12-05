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
import { ref, computed, onMounted } from 'vue';
import { useHealthCheck } from './useHealthCheck';
import { fetchData } from '../mocks/db';
const messageTypes = ref<{ class: string; message: string }[]>([]);
const loadMessageTypes = async () => {
	try {
		messageTypes.value = await fetchData('/message-types');
	} catch (error) {
		console.error('Ошибка загрузки сообщений из моков:', error);
	}
};

const { status } = useHealthCheck();

const filteredMessageTypes = computed(() => {
	if (status.value === 'active') {
		return messageTypes.value.filter((type) => type.class === 'inform--success');
	}
	return messageTypes.value.filter((type) => type.class === 'inform--warning');
});

onMounted(loadMessageTypes);
</script>
``

<style lang="scss" scoped>
@import '../utils/variables.scss';

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
	margin: 20px 0;

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
