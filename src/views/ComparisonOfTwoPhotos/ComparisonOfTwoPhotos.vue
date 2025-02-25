<template>
	<div class="comparison-of-photos">
		<UploadTarget
			@update:imageData="updateTargetImage"
			:status="status"
			:bboxes="targetBboxes"
		/>
		<UploadSource @update:imageData="updateSourceImage" :status="status" />
		<ButtonCompareFace :isDisabled="isDisabled" @compare="comparePhotos" />

		<div v-if="comparisonResult" class="comparison-result">
			<div v-if="comparisonResult.message" class="comparison-message">
				<p>{{ comparisonResult.message }}</p>
			</div>
			<div v-if="comparisonResult.detected_faces">
				<div
					v-for="(face, index) in comparisonResult.detected_faces"
					:key="index"
					class="face-details"
				>
					<p>Лицо {{ index + 1 }}:</p>
					<p>bbox: {{ face.bbox }}</p>
					<p>Real: {{ face.real ? 'Yes' : 'No' }}</p>
					<p>Dist: {{ face.dist }}</p>
				</div>
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

interface Face {
	bbox: string;
	real: boolean;
	dist: number;
}

interface ComparisonResponse {
	detected_faces?: Face[];
	message?: string;
}

interface ComparisonResult {
	message: string;
	detected_faces?: Face[];
}

const status = ref('active');
const isDisabled = computed(() => status.value === 'inactive');

const targetImageBase64 = ref<string | null>(null);
const sourceImageBase64 = ref<string | null>(null);

const comparisonResult = ref<ComparisonResult | null>(null);
const targetBboxes = ref<string[]>([]);

const updateTargetImage = (imageData: string) => {
	targetImageBase64.value = imageData;
};

const updateSourceImage = (imageData: string) => {
	sourceImageBase64.value = imageData;
};

const removeBase64Prefix = (base64String: string): string => {
	const regex = /^data:image\/[a-zA-Z]+;base64,/;
	return base64String.replace(regex, '');
};

const comparePhotos = async () => {
	if (!targetImageBase64.value || !sourceImageBase64.value) {
		comparisonResult.value = { message: 'Пожалуйста, загрузите оба изображения.' };
		return;
	}

	const cleanSourceImage = removeBase64Prefix(sourceImageBase64.value);
	const cleanTargetImage = removeBase64Prefix(targetImageBase64.value);

	try {
		const requestData = {
			request_id: uuidv4(),
			rec_threshold: 1,
			source_image: cleanSourceImage,
			target_image: cleanTargetImage,
		};

		const response = await fetch('http://81.94.156.176:5511/recognize_one_by_image', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			throw new Error('Ошибка на сервере');
		}

		const result: ComparisonResponse = await response.json();
		if (result.detected_faces && result.detected_faces.length > 0) {
			comparisonResult.value = processComparisonResult(result);
			targetBboxes.value = result.detected_faces.map((face: Face) => face.bbox);
		} else {
			comparisonResult.value = { message: 'На одной из фотографий лиц не обнаружено.' };
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			comparisonResult.value = {
				message: 'Произошла ошибка при отправке запроса: ' + error.message,
			};
		} else {
			comparisonResult.value = {
				message: 'Произошла неизвестная ошибка',
			};
		}
	}
};

const processComparisonResult = (result: ComparisonResponse): ComparisonResult => {
	const { detected_faces } = result;
	let message = '';

	if (detected_faces && detected_faces.length > 0) {
		const dist = detected_faces[0]?.dist || 0;
		if (dist > 0.25) {
			message = 'Скорее всего, это один и тот же человек';
		} else {
			message = 'Это разные люди';
		}

		if (detected_faces.some((face: Face) => face.real === false)) {
			message = 'Попытка обмана системы';
		}
	} else {
		message = 'На одной из фотографий лиц не обнаружено.';
	}

	return {
		detected_faces: detected_faces || [],
		message,
	};
};
</script>

<style scoped lang="scss">
.comparison-of-photos {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.comparison-result {
	margin-top: 20px;
	padding: 10px;
	border: 1px solid #ccc;
	border-radius: 8px;
}

.comparison-message {
	font-weight: bold;
}

.face-details {
	margin-top: 10px;
}
</style>
