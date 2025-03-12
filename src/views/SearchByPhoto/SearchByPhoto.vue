<template>
	<div class="upload">
		<div class="upload__inputs">
			<div class="upload__input-wrapper">
				<span class="upload__placeholder">Загрузить изображение</span>
				<input
					type="file"
					@change="handleFileUpload"
					accept="image/*"
					class="upload__input"
					:disabled="isDisabled"
				/>
			</div>

			<div class="upload__url">
				<input
					v-model="imageUrl"
					type="url"
					placeholder="Введите URL"
					class="upload__url-input"
					:disabled="isDisabled"
					@input="handleUrlUpload"
				/>
			</div>
		</div>

		<div v-if="previewImage" class="upload__preview">
			<img :src="previewImage" alt="Загруженное изображение" class="upload__preview-image" />
		</div>

		<button type="submit" class="upload__button" :disabled="!canSearch" @click="searchFaces">
			<span class="upload__button-name">Поиск</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
	status: string;
}>();
const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const imageUrl = ref<string>('');
const selectedFile = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const foundImageUrl = ref<string | null>(null);

const isDisabled = computed(() => props.status === 'inactive');
const canSearch = computed(() => !!selectedFile.value || !!imageUrl.value);

const handleFileUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files[0]) {
		const file = target.files[0];
		selectedFile.value = file;
		imageUrl.value = '';

		const reader = new FileReader();
		reader.onload = () => {
			previewImage.value = reader.result as string;
		};
		reader.readAsDataURL(file);
	}
};

const handleUrlUpload = async () => {
	if (imageUrl.value) {
		try {
			const image = new Image();
			image.src = imageUrl.value;
			image.onload = () => {
				previewImage.value = imageUrl.value;
			};
			image.onerror = () => {
				console.error('Ошибка загрузки изображения по URL');
				previewImage.value = null; // Очистить превью, если URL невалиден
			};
		} catch (error) {
			console.error('Ошибка при обработке URL:', error);
			previewImage.value = null;
		}
	}
};

const urlToBase64 = async (imageUrl: string): Promise<string> => {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok)
			throw new Error(`Не удалось загрузить изображение: ${response.statusText}`);
		const blob = await response.blob();

		return await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error('Ошибка чтения файла'));
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error('Ошибка конвертации URL в base64:', error);
		throw error;
	}
};

const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Ошибка чтения файла'));
		reader.readAsDataURL(file);
	});
};

const searchFaces = async () => {
	try {
		if (!canSearch.value) return;

		let base64Image = '';
		if (selectedFile.value) {
			base64Image = await fileToBase64(selectedFile.value);
		} else if (imageUrl.value) {
			base64Image = await urlToBase64(imageUrl.value);
		}

		const imageBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

		const response = await fetch(`${HOST}/recognize_many`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				request_id: uuidv4(),
				rec_threshold: 1,
				image: imageBase64,
			}),
		});

		const data = await response.json();

		if (data.detected_faces && data.detected_faces.length > 0) {
			const foundId = data.detected_faces[0].id;
			foundImageUrl.value = `${DB}/${foundId}.jpg`;
		} else {
			foundImageUrl.value = null;
		}
	} catch (error) {
		console.error('Ошибка при поиске:', error);
	}
};
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';

.upload {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	width: 100%;
	max-width: 1000px;
	margin: 0 auto;
	padding-top: 30px;
}

.upload__inputs {
	display: flex;
	gap: 15px;
	justify-content: center;
	width: 100%;
	max-width: 600px;
}

.upload__input-wrapper {
	width: 100%;
	max-width: 350px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px dashed #513d3d;
	border-radius: 8px;
	background-color: #f9f9f9;
	cursor: pointer;
	position: relative;
	transition: border 0.1s ease;
}

.upload__input {
	width: 100%;
	height: 100%;
	position: absolute;
	opacity: 0;
	cursor: pointer;
}

.upload__placeholder {
	color: #513d3d;
	font-size: 14px;
	text-align: center;
}

.upload__url {
	width: 100%;
	max-width: 350px;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px dashed #513d3d;
	border-radius: 8px;
	background-color: #f9f9f9;
}

.upload__url-input {
	width: 100%;
	padding: 8px;
	border: none;
	background-color: transparent;
	text-align: center;
	outline: none;
}

.upload__url-input:disabled {
	background-color: $color-bg;
}

.upload__preview {
	width: 100%;
	max-width: 450px;
	height: 450px;
	margin-top: 20px;
	border-radius: 8px;
	overflow: hidden;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f0f0f0;
}

.upload__preview-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.upload__button {
	width: 250px;
	height: 50px;
	padding: 0 30px;
	color: #513d3d;
	border: 1px solid #513d3d;
	background-color: $color-bg;
	border-radius: $border-radius;
	user-select: none;
	white-space: nowrap;
	transition: all 0.05s linear;
	font-family: inherit;
	display: flex;
	justify-content: center;
	align-items: center;

	&:hover {
		cursor: pointer;
		border-color: $border-color;
		color: $border-color;
	}

	&:active {
		transform: scale(0.97);
	}

	&:disabled {
		cursor: not-allowed;
		background-color: $color-bg;
		border-color: #bfbfbf;
		color: #a0a0a0;
		opacity: 0.7;
		transition: none;
	}
}

.upload__button-name {
	font-size: 16px;
	font-weight: 500;
}
</style>
