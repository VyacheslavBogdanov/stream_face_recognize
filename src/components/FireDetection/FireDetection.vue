<!-- <template>
	<div class="middle-elements">
		<FileUpload @fileSelected="updateImage" @fileUrl="updateImageSrc" :status="props.status" />
		<FireDetectionBtn v-if="imageSrc" @sendRequest="sendRequest" :status="props.status" />
	</div>
	<div v-if="imageSrc" class="preview">
		<img class="preview__img" :src="imageSrc" alt="Загруженное изображение" />
	</div>
	<div v-if="result?.type" :class="['result', resultClass]">
		<div class="result__icon">ⓘ</div>
		<span>{{ message }}</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import FileUpload from './FileUpload/FileUpload.vue';
import FireDetectionBtn from './FireDetectionBtn/FireDetectionBtn.vue';
import type { MessageType } from '../utils/types';

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();

const imageSrc = ref<string | null>(null);
const result = ref<{ type: string } | null>(null);
const imageBase64 = ref<string | null>(null);

const message = computed(() => {
	if (result.value?.type === 'fire') {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--fire');
		return newArr.length > 0 ? newArr[0].message : 'Статус огня не определен';
	} else {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--no-fire');
		return newArr.length > 0 ? newArr[0].message : 'Статус огня не определен';
	}
});

const resultClass = computed(() => {
	if (result.value?.type === 'fire') {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--fire');
		return newArr.length > 0 ? newArr[0].class : 'result--info';
	} else {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--no-fire');
		return newArr.length > 0 ? newArr[0].class : 'result--info';
	}
});

const updateImage = (base64: string) => {
	imageBase64.value = base64;
};

const updateImageSrc = (url: string) => {
	imageSrc.value = url;
};

const sendRequest = async () => {
	if (!imageBase64.value) {
		console.error('Изображение не выбрано');
		return;
	}

	const base64Image = imageBase64.value.replace(/^data:image\/[a-z]+;base64,/, '');

	const requestId = uuidv4();

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

	@media (max-width: 1250px) {
		flex-direction: column;
		height: 110px;
	}
}

.preview {
	width: auto;
	height: 400px;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	border: 1px solid #ddd;
	border-radius: $border-radius;

	&__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
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

	@media (max-width: 835px) {
		font-size: 17px;
	}

	&__icon {
		display: flex;
		position: absolute;
		transform: rotate(180deg);
		left: 10px;
		height: 30px;
	}

	&--fire {
		background-color: #e0fde7;
		color: $color-success;
	}

	&--no-fire {
		background-color: #f2dee0;
		color: $color-error;
	}

	&--info {
		background-color: #e3e3ff;
		color: $color-primary;
	}
}
</style> -->

<template>
	<div class="middle-elements">
		<FileUpload @fileSelected="updateImage" @fileUrl="updateImageSrc" :status="props.status" />
		<FireDetectionBtn v-if="imageSrc" @sendRequest="sendRequest" :status="props.status" />
	</div>
	<div v-if="imageSrc" class="preview">
		<img class="preview__img" :src="imageSrc" alt="Загруженное изображение" />
		<div
			v-if="fireRect"
			class="preview__rect"
			:style="{
				top: fireRect.top + '%',
				left: fireRect.left + '%',
				width: fireRect.width + '%',
				height: fireRect.height + '%',
			}"
		></div>
	</div>
	<div v-if="result?.type" :class="['result', resultClass]">
		<div class="result__icon">ⓘ</div>
		<span>{{ message }}</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import FileUpload from './FileUpload/FileUpload.vue';
import FireDetectionBtn from './FireDetectionBtn/FireDetectionBtn.vue';
import type { MessageType } from '../utils/types';

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();

const imageSrc = ref<string | null>(null);
const result = ref<{ type: string } | null>(null);
const fireRect = ref<{ top: number; left: number; width: number; height: number } | null>(null);
const imageBase64 = ref<string | null>(null);

const message = computed(() => {
	if (result.value?.type === 'fire') {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--fire');
		return newArr.length > 0 ? newArr[0].message : 'Статус огня не определен';
	} else {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--no-fire');
		return newArr.length > 0 ? newArr[0].message : 'Статус огня не определен';
	}
});

const resultClass = computed(() => {
	if (result.value?.type === 'fire') {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--fire');
		return newArr.length > 0 ? newArr[0].class : 'result--info';
	} else {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--no-fire');
		return newArr.length > 0 ? newArr[0].class : 'result--info';
	}
});

const updateImage = (base64: string) => {
	imageBase64.value = base64;
};

const updateImageSrc = (url: string) => {
	imageSrc.value = url;
};

const sendRequest = async () => {
	if (!imageBase64.value) {
		console.error('Изображение не выбрано');
		return;
	}

	const base64Image = imageBase64.value.replace(/^data:image\/[a-z]+;base64,/, '');

	const requestId = uuidv4();

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

		// Установка результата
		if (data.objects && data.objects.length > 0) {
			const fireObject = data.objects[0];
			result.value = { type: fireObject.type };

			// Обновляем fireRect
			const [x, y, width, height] = fireObject.rect;
			fireRect.value = {
				top: (y / 100) * 100, // Пропорция для контейнера
				left: (x / 100) * 100,
				width: (width / 100) * 100,
				height: (height / 100) * 100,
			};
		} else {
			result.value = { type: 'no_fire' };
			fireRect.value = null;
		}
	} catch (error) {
		console.error('Ошибка при запросе:', error);
		result.value = { type: 'no_fire' };
		fireRect.value = null;
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

	@media (max-width: 1250px) {
		flex-direction: column;
		height: 110px;
	}
}

.preview {
	width: auto;
	height: 400px;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative; /* Для позиционирования рамки */
	overflow: hidden;
	border: 1px solid #ddd;
	border-radius: $border-radius;

	&__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	&__rect {
		position: absolute;
		border: 2px solid red;
		box-sizing: border-box;
	}
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

	@media (max-width: 835px) {
		font-size: 17px;
	}

	&__icon {
		display: flex;
		position: absolute;
		transform: rotate(180deg);
		left: 10px;
		height: 30px;
	}

	&--fire {
		background-color: #e0fde7;
		color: $color-success;
	}

	&--no-fire {
		background-color: #f2dee0;
		color: $color-error;
	}

	&--info {
		background-color: #e3e3ff;
		color: $color-primary;
	}
}
</style>
