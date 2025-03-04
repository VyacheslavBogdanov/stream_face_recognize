<template>
	<div class="comparison-of-photos">
		<div class="upload-container">
			<UploadSource @update:imageData="updateSourceImage" :isDisabled="isDisabled" />
			<UploadTarget
				@update:imageData="updateTargetImage"
				:bboxes="targetBboxes"
				:isDisabled="isDisabled"
			/>
		</div>

		<ButtonCompareFace :isDisabled="isDisabled" @compare="comparePhotos" />

		<div v-if="comparisonResult?.type" :class="['result', comparisonResult]">
			<div
				v-if="comparisonResult?.message"
				:class="['comparison-result', comparisonResult?.type]"
			>
				<div class="icon">ⓘ</div>
				<span>{{ comparisonResult.message }}</span>
			</div>

			<div v-if="comparisonResult.detected_faces">
				<div
					v-for="(face, index) in comparisonResult.detected_faces"
					:key="index"
					class="face-details"
				></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import UploadTarget from './UploadTarget.vue';
import UploadSource from './UploadSource.vue';
import ButtonCompareFace from './ButtonCompareFace.vue';
import type { MessageType } from '../../components/mocks/db';

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();

interface Face {
	bbox: number[];
	dist: number;
	real: boolean;
}

interface ComparisonResponse {
	request_id: string;
	detected_faces?: Face[];
	message?: string;
}

interface ComparisonResult {
	message: string;
	detected_faces?: Face[];
	type: string;
}

const isDisabled = computed(() => props.status === 'inactive');

const targetImageBase64 = ref<string | null>(null);
const sourceImageBase64 = ref<string | null>(null);
const comparisonResult = ref<ComparisonResult | null>(null);
const targetBboxes = ref<number[]>([]);
const updateTargetImage = (imageData: string) => {
	targetImageBase64.value = imageData;
};

const updateSourceImage = (imageData: string) => {
	sourceImageBase64.value = imageData;
};

const Base64Image = (base64String: string) =>
	base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

const comparePhotos = async () => {
	if (!targetImageBase64.value || !sourceImageBase64.value) {
		comparisonResult.value = {
			type: 'compare--info',
			message: props.messageTypes.find((type) => type.class === 'compare--info')?.message, //загрузите оба изображения
		};
		return;
	}

	const Base64ImageSource = Base64Image(sourceImageBase64.value);
	const Base64ImageTarget = Base64Image(targetImageBase64.value);

	try {
		const response = await fetch(`${import.meta.env.VITE_SERVER_HOST}/recognize_one_by_image`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				request_id: uuidv4(),
				rec_threshold: 1,
				source_image: Base64ImageSource,
				target_image: Base64ImageTarget,
			}),
		});

		if (!response.ok) {
			throw new Error('Ошибка на сервере');
		}

		const result: ComparisonResponse = await response.json();
		if (result.detected_faces && result.detected_faces.length > 0) {
			comparisonResult.value = processComparisonResult(result);

			targetBboxes.value = result.detected_faces[0]?.bbox || [];
		} else {
			comparisonResult.value = {
				message: 'На одной из фотографий лиц не обнаружено.',
				type: 'compare--error',
				detected_faces: [],
			};
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			comparisonResult.value = {
				message: 'На одной из фотографий лиц не обнаружено.',
				type: 'compare--error',
				detected_faces: [],
			};
		} else {
			comparisonResult.value = {
				message: 'На одной из фотографий лиц не обнаружено.',
				type: 'compare--error',
				detected_faces: [],
			};
		}
	}
};

const processComparisonResult = (result: ComparisonResponse): ComparisonResult => {
	const { detected_faces } = result;
	let messageType = 'compare--info';
	let message = props.messageTypes.find((type) => type.class === messageType)?.message || '';

	if (!detected_faces || detected_faces.length === 0) {
		messageType = 'compare--error';
		message =
			props.messageTypes.find((type) => type.class === messageType)?.message || 'Ошибка!';
	} else {
		if (detected_faces.some((face: Face) => !face.real)) {
			messageType = 'compare--error';
			message =
				props.messageTypes.find((type) => type.class === messageType)?.message ||
				'Попытка обмана!';
		} else {
			const dist = detected_faces[0].dist;

			if (dist > 0.25) {
				messageType = 'compare--warning'; // скорее всего это один и тот же человек
			} else {
				messageType = 'compare--success'; //это разные люди
			}
			message =
				props.messageTypes.find((type) => type.class === messageType)?.message ||
				'Результат неизвестен';
		}
	}

	return {
		detected_faces: detected_faces || [],
		message,
		type: messageType,
	};
};
</script>

<style scoped lang="scss">
@import '../../styles/main.scss';
.comparison-result {
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px 30px 10px 40px;
	border-radius: 8px;
	font-family: Arial, sans-serif;
	max-width: fit-content;
	word-wrap: break-word;
	font-size: 23px;
	font-family: sans-serif;
	height: 40px;
	margin: auto;
}

.icon {
	display: flex;
	position: absolute;
	transform: rotate(180deg);
	left: 10px;
	height: 30px;
}

.compare--info {
	background-color: #e3e3ff;
	color: $color-primary;
}
.compare--success {
	background-color: #e0fde7;
	color: #2a9b44;
}
.compare--warning {
	background-color: #f9ebd8;
	color: #d77417;
}
.compare--error {
	background-color: #f2dee0;
	color: #db1428;
}
.face-info {
	background: #f4f4f4;
	padding: 8px;
	margin-top: 5px;
	border-radius: 5px;
}
.real {
	color: green;
	font-weight: bold;
}
.fake {
	color: red;
	font-weight: bold;
}

.comparison-of-photos {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.upload-container {
	display: flex;
	gap: 20px;
}

.comparison-message {
	font-weight: bold;
}

.face-details {
	margin-top: 10px;
}
</style>
