<template>
	<div class="compare-container">
		<button @click="compareFaces" :disabled="isLoading || !imagesBase64[1] || !imagesBase64[2]">
			{{ isLoading ? 'Сравнение...' : 'Сравнить' }}
		</button>
		<div v-if="result" class="result-container">
			<p v-if="result.error" class="error">{{ result.error }}</p>
			<div v-else>
				<p v-if="result.message">{{ result.message }}</p>
				<div
					v-for="(face, index) in result.detected_faces"
					:key="index"
					class="face-result"
				></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{ imagesBase64: Record<number, string> }>();
const isLoading = ref(false);
const result = ref<{ detected_faces?: any[]; message?: string; error?: string } | null>(null);

const images = computed(() => props.imagesBase64);

watch(images, (newValue) => {
	console.log('Изображения обновлены:', newValue);
});

const compareFaces = async () => {
	if (!images.value[1] || !images.value[2]) {
		result.value = { error: 'Необходимо загрузить оба изображения' };
		return;
	}

	isLoading.value = true;
	result.value = null;

	try {
		const requestId = uuidv4();
		const base64Source = images.value[1].split(',')[1];
		const base64Target = images.value[2].split(',')[1];

		const response = await fetch('http://81.94.156.176:5511/recognize_one_by_image', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				request_id: requestId,
				rec_threshold: 1,
				source_image: base64Source,
				target_image: base64Target,
			}),
		});

		const responseText = await response.text();

		if (!response.ok) {
			result.value = { error: `Ошибка сервера: ${response.status} ${responseText}` };
			return;
		}

		const data = JSON.parse(responseText);
		processResponse(data);
	} catch (error) {
		result.value = { error: 'Ошибка при сравнении изображений' };
	} finally {
		isLoading.value = false;
	}
};

const processResponse = (data: any) => {
	if (!data.detected_faces || data.detected_faces.length === 0) {
		result.value = { error: 'На одной из фотографий лиц не обнаружено' };
		return;
	}

	let realFaceDetected = false;
	let dist = 1;
	data.detected_faces.forEach((face: any) => {
		if (!face.real) realFaceDetected = true;
		dist = face.dist;
	});

	if (realFaceDetected) {
		result.value = { message: 'Попытка обмана системы' };
		return;
	}

	result.value = {
		detected_faces: data.detected_faces,
		message: dist > 0.25 ? 'Скорее всего, это один и тот же человек' : 'Это разные люди',
	};
};
</script>

<style scoped>
.compare-container {
	display: flex;
	flex-direction: column;
	align-items: center;
}
button {
	padding: 10px 20px;
	font-size: 16px;
	cursor: pointer;
	margin-bottom: 20px;
}
.result-container {
	text-align: center;
}
.error {
	color: red;
}
.face-result {
	border: 1px solid #ccc;
	padding: 10px;
	margin-top: 10px;
}
</style>
