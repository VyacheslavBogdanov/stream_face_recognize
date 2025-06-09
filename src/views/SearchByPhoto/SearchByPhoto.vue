<template>
	<div :class="{ upload: true, 'upload--disabled': isDisabled }">
		<div class="upload__group">
			<button class="upload__clear-btn" @click="clearUpload" :disabled="isDisabled">
				Очистить
			</button>
			<div class="comparison__slider">
				<label for="threshold">rec_threshold: {{ recThreshold.toFixed(2) }}</label>
				<input
					id="threshold"
					type="range"
					min="0"
					max="1.0"
					step="0.05"
					v-model.number="recThreshold"
				/>
			</div>
		</div>
	</div>

	<div class="upload__image-group">
		<div
			class="upload__file-container"
			:class="{ 'upload__file-container-loaded': previewImage }"
		>
			<div class="upload__file">
				<span v-if="!previewImage" class="upload__file-placeholder">
					Загрузить изображение
				</span>
				<input
					type="file"
					@change="onFileChange"
					accept="image/*"
					class="upload__file-input"
					:disabled="isDisabled"
				/>
				<img
					v-if="previewImage"
					:src="previewImage"
					class="upload__file-preview"
					ref="imagePreviewElement"
				/>

				<div
					v-for="(bbox, index) in scaledRecognizedBboxes"
					:key="index"
					class="upload__bbox"
					:style="{
						top: bbox.top + 'px',
						left: bbox.left + 'px',
						width: bbox.width + 'px',
						height: bbox.height + 'px',
					}"
				></div>
			</div>
		</div>

		<div
			class="upload__result-container"
			v-if="foundPeople.length"
			:class="{ 'upload__result-container-loaded': previewImage }"
		>
			<div class="upload__result">
				<img
					v-if="resultImageUrl"
					ref="imageElement"
					:src="resultImageUrl"
					class="upload__result-image"
					@load="updateBoundingBoxes"
				/>

				<div
					v-for="(bbox, index) in scaledBboxes"
					:key="index"
					class="upload__bbox"
					:style="{
						top: bbox.top + 'px',
						left: bbox.left + 'px',
						width: bbox.width + 'px',
						height: bbox.height + 'px',
					}"
				></div>
			</div>
		</div>
	</div>

	<table v-if="foundPeople.length" class="upload__table">
		<thead class="upload__table-head">
			<tr>
				<th>ID</th>
				<th>Имя</th>
			</tr>
		</thead>
		<tbody class="upload__table-body">
			<tr v-for="person in foundPeople" :key="person.id">
				<td>{{ person.id }}</td>
				<td>{{ person.name }}</td>
			</tr>
		</tbody>
	</table>

	<button class="upload__button" @click="searchFaces" :disabled="isLoading || isDisabled">
		<span v-if="!isLoading" class="upload__button-text">Поиск</span>
		<div v-else class="loader"></div>
	</button>
	<div v-if="errorMessage" :class="['upload__error-msg', errorMessage.class]">
		<div class="upload__icon">ⓘ</div>
		<span>{{ errorMessage.message }}</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { calculateScaledBboxes } from '../../components/utils/Bbox';
import type { MessageType } from '../../components/utils/types';
import type { DetectedFace } from '../../components/utils/types';

const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();

const errorMessage = ref<{ class: string; message: string } | null>(null);
const selectedFile = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const foundPeople = ref<{ id: string; name: string; photoUrl: string; bbox?: number[] }[]>([]);
const recognizedBboxes = ref<number[][]>([]);
const imagePreviewElement = ref<HTMLImageElement | null>(null);

const scaledBboxes = ref<{ left: number; top: number; width: number; height: number }[]>([]);
const imageElement = ref<HTMLImageElement | null>(null);
const scaledRecognizedBboxes = ref<{ left: number; top: number; width: number; height: number }[]>(
	[],
);

const isLoading = ref(false);
const recThreshold = ref(0.5);

const resultImageUrl = computed(() => {
	return foundPeople.value.length > 0 && foundPeople.value[0].photoUrl
		? foundPeople.value[0].photoUrl
		: null;
});

const isDisabled = computed(() => props.status === 'inactive');

const updateRecognizedBoundingBoxes = () => {
	if (!imagePreviewElement.value || !recognizedBboxes.value.length) return;

	scaledRecognizedBboxes.value = calculateScaledBboxes(
		imagePreviewElement.value,
		recognizedBboxes.value,
	);
};

const updateBoundingBoxes = () => {
	if (!imageElement.value || !foundPeople.value[0]?.bbox) return;

	scaledBboxes.value = calculateScaledBboxes(
		imageElement.value,
		foundPeople.value.map((p) => p.bbox!).filter(Boolean),
	);
};

const onFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (!target.files?.[0]) return;
	clearUpload();
	selectedFile.value = target.files[0];

	const reader = new FileReader();
	reader.onload = () => {
		previewImage.value = reader.result as string;
	};
	reader.readAsDataURL(target.files[0]);
};

const clearUpload = () => {
	selectedFile.value = null;
	previewImage.value = null;
	foundPeople.value = [];
	errorMessage.value = null;
	scaledRecognizedBboxes.value = [];
};

const Base64Image = (base64String: string) =>
	base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

const searchFaces = async () => {
	if (!selectedFile.value) return;

	isLoading.value = true;

	const reader = new FileReader();
	reader.onloadend = async () => {
		previewImage.value = reader.result as string;
		await sendRecognitionRequest(reader.result as string);
		isLoading.value = false;
	};
	reader.readAsDataURL(selectedFile.value);
};

const sendRecognitionRequest = async (base64Image: string) => {
	const imageBase64 = Base64Image(base64Image);

	try {
		const response = await fetch(`${HOST}/recognize_many`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				request_id: uuidv4(),
				rec_threshold: recThreshold.value,
				image: imageBase64,
			}),
		});

		if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);
		const data = await response.json();

		foundPeople.value = [];

		if (data.detected_faces?.length > 0) {
			const detectedFaces = data.detected_faces as DetectedFace[];
			recognizedBboxes.value = detectedFaces
				.filter((face) => face.bbox)
				.map((face) => face.bbox!);
			for (const face of data.detected_faces) {
				const person = await getPersonById(face.id);
				if (person) {
					foundPeople.value.push({ ...person });
				}
			}
		}

		updateRecognizedBoundingBoxes();
	} catch (error) {
		console.error(error);
		errorMessage.value = {
			message: 'Ошибка при обработке изображения',
			class: 'upload__error-msg--error',
		};
	} finally {
		isLoading.value = false;
	}
};

const getPersonById = async (id: string) => {
	try {
		const response = await fetch(DB);
		if (!response.ok) throw new Error(`Ошибка загрузки данных для ID: ${id}`);

		const dbData: { id: string; name: string; photoUrl: string; bbox: number[] }[] =
			await response.json();
		const person = dbData.find((p) => p.id === id);

		if (!person) {
			errorMessage.value = {
				message: props.messageTypes.find((msg) => msg.class === 'search-error')
					?.message as string,
				class: 'upload__error-msg--error',
			};
			foundPeople.value = [];
			return null;
		}
		return {
			...person,
		};
	} catch (error) {
		console.error(error);
		errorMessage.value = {
			message: 'Ошибка при загрузке данных',
			class: 'upload__error-msg--error',
		};
		return null;
	}
};
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';

.upload {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;

	&--disabled {
		pointer-events: none;
		opacity: 0.5;
	}
}

.upload__clear-btn {
	margin: 0 auto 10px;
	padding: 8px 12px;
	background-color: $button-color-red;
	margin-top: 10px;
	color: $background-color;
	border: none;
	cursor: pointer;
}
.upload__group {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	max-width: 500px;
	margin-bottom: 10px;
	gap: 50px;
}
.upload__error-msg {
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px 30px 10px 40px;
	border-radius: $border-radius;
	font-size: 23px;
	height: 40px;
	max-width: fit-content;
	margin: auto;
	bottom: 7.5px;

	&--error {
		background: #f2dee0;
		color: $color-error;
	}
	.upload__icon {
		position: absolute;
		left: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
	}
}

.upload__image-group {
	display: flex;
	gap: 20px;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.upload__file-container {
	width: 500px;
	height: 500px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: $border-width solid #513d3d;
	border-radius: 8px;
	background-color: #f8f8f8;
	text-align: center;
	position: relative;
	overflow: hidden;
	cursor: pointer;
	transition: border-color 0.2s ease;

	&:hover {
		border-color: $border-color;
	}
	&.upload__file-container-loaded {
		border: none;
	}
}

.upload__file-input {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	cursor: pointer;
	z-index: 2;
}
.upload__result-container {
	width: 500px;
	height: 500px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: $border-width solid #513d3d;
	border-radius: 10px;
	background-color: #f8f8f8;
	text-align: center;
	position: relative;
	overflow: hidden;

	&.upload__result-container-loaded {
		border: none;
	}
}

.upload__file-preview,
.upload__result-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	position: absolute;
	top: 0;
	left: 0;
}

//BBOX

.upload__bbox {
	position: absolute;
	border: $border-width solid red;
	box-sizing: border-box;
}

//Кнопка Поиска

.upload__button {
	width: 250px;
	position: relative;
	height: 50px;
	padding: 0 30px;
	color: #513d3d;
	border: $border-width solid #513d3d;
	background-color: $color-bg;
	border-radius: $border-radius;
	user-select: none;
	white-space: nowrap;
	transition: all 0.05s linear;
	font-family: inherit;
	margin: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
	margin-bottom: 20px;

	&:hover {
		cursor: pointer;
		border-color: $border-color;
		color: $border-color;

		&:before {
			height: calc(100% - 32px);
			top: 16px;
		}

		&:after {
			width: calc(100% - 32px);
			left: 16px;
		}
	}

	&:active {
		transform: scale(0.97);
	}

	.upload__button-text {
		font-size: 18px;
		z-index: 3;
		position: relative;
		font-weight: 500;
	}
	.loader {
		border: 3px solid #f3f3f3;
		border-top: 3px solid $border-color;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
}
//Таблица
.upload__table {
	width: 500px;
	border-collapse: collapse;
	margin-top: 20px;
	background: #ffffff;
	box-shadow:
		0px 3px 8px -6px rgba(24, 39, 75, 0.05),
		0px 10px 36px -4px rgba(17, 24, 41, 0.1);
}

.upload__table th,
.upload__table td {
	height: 30px;
	border: 1px solid #ccc;
	padding: 5px;
	text-align: center;
	vertical-align: middle;
}

.upload__table-head {
	background-color: #f0f0f0;
	font-size: 15px;
}

.upload__table-body tr:hover {
	background-color: #f9f9f9;
}
</style>
