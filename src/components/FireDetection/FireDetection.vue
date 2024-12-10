<template>
	<div class="middle-elements">
		<FileUpload @fileSelected="updateImage" />
		<FireDetectionBtn @sendRequest="sendRequest" />
	</div>
	<div :class="['result', resultClass]">
		<div class="result__icon">ⓘ</div>
		<span>{{ message }}</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import FireDetectionBtn from './FireDetectionBtn/FireDetectionBtn.vue';
import FileUpload from './FileUpload/FileUpload.vue';

const result = ref<{ type: string } | null>(null);
const imageBase64 = ref<string | null>(null);

const message = computed(() =>
	result.value?.type === 'fire' ? 'Огонь обнаружен' : 'Огонь не обнаружен',
);

const resultClass = computed(() =>
	result.value?.type === 'fire' ? 'result--fire' : 'result--no-fire',
);

const updateImage = (base64: string) => {
	imageBase64.value = base64;
};

const sendRequest = async () => {
	if (!imageBase64.value) {
		console.error('Изображение не выбрано');
		return;
	}

	const base64Image = imageBase64.value.replace(/^data:image\/[a-z]+;base64,/, '');

	const requestId = uuidv4();

	console.log('requestId:', requestId);
	console.log('base64Image:', base64Image);

	try {
		const response = await fetch('/api/predict', {
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
						type: 'person',
					},
					{
						move_confidence: 0.2,
						move_velocity: 0.3,
						static_confidence: 0.7,
						type: 'vehicle',
					},
				],
				sabotage_threshold: 22,
				requestId: requestId,
				image: base64Image,
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
			result.value = { type: 'no_fire' };
		}
	} catch (error) {
		console.error('Ошибка при запросе:', error);
		result.value = { type: 'no_fire' };
	}
};
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';

.middle-elements {
	height: 50px;
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 40px 0 40px 0;
}
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
