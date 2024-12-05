<template>
	<FileUpload />
	<FireSearchBtn @sendRequest="sendRequest" />
	<div :class="['result', resultClass]">
		<div class="result__icon">ⓘ</div>
		<span>{{ message }}</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import FireSearchBtn from './FireSearchBtn/FireSearchBtn.vue';
import FileUpload from './FileUpload/FileUpload.vue';

const result = ref<{ type: string } | null>(null);

const message = computed(() =>
	result.value?.type === 'fire' ? 'Огонь обнаружен' : 'Огонь не обнаружен',
);

const resultClass = computed(() =>
	result.value?.type === 'fire' ? 'result--fire' : 'result--no-fire',
);

const sendRequest = async () => {
	try {
		const response = await fetch('http://localhost:4000/predict', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				thresholds: [
					{
						move_confidence: 0.2,
						move_velocity: 0.3,
						static_confidence: 0.7,
						type: 'fire',
					},
				],
				sabotage_threshold: 22,
				requestId: '',
				image: '',
			}),
		});

		if (!response.ok) {
			throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Ответ от сервера:', data);
		if (data.objects && data.objects.length > 0) {
			result.value = { type: data.objects[0].type };
		} else {
			throw new Error('Некорректный формат ответа');
		}
	} catch (error) {
		console.error('Ошибка при запросе:', error);
		result.value = { type: 'no_fire' };
	}
};
</script>

<style lang="scss" scoped>
@import '../utils/variables.scss';

.result {
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

	&--fire {
		background-color: #e0fde7;
		color: #2a9b44;
	}

	&--no-fire {
		background-color: #f2dee0;
		color: #db1428;
	}
}
</style>
