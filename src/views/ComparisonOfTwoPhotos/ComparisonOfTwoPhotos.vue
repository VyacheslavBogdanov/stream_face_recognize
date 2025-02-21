<template>
	<div class="upload-container">
		<div v-for="id in [1, 2]" :key="id" class="upload-wrapper">
			<div class="upload__error-message">
				<span v-if="isInvalidUrl[id]">Неверный URL</span>
			</div>
			<div class="upload-url-container">
				<input
					class="upload__url"
					type="text"
					v-model="imageUrls[id]"
					placeholder="Введите URL изображения..."
					@input="onUrlChange(id)"
					:disabled="isDisabled"
					:class="{ 'upload__url--active': imageUrls[id] && !isInvalidUrl[id] }"
				/>
				<button class="upload__clear" @click="clearUpload(id)">🗑</button>
			</div>
			<div
				class="upload"
				:class="{ 'upload--preview-loaded': previewSrcs[id] }"
				@dragover.prevent
				@drop.prevent
			>
				<div v-if="previewSrcs[id]" class="upload__preview">
					<img
						:src="previewSrcs[id]"
						@error="handleImageError(id)"
						alt="Не удалось загрузить"
					/>
				</div>

				<input
					ref="fileInputRefs"
					class="upload__input"
					type="file"
					accept="image/*"
					@change="onFileChange(id, $event)"
					:disabled="isDisabled"
				/>

				<span v-if="!previewSrcs[id]" class="upload__text">
					{{ fileNames[id] || 'Загрузить изображение...' }}
				</span>
			</div>
		</div>

		<ButtonCompareFace :imagesBase64="imagesBase64" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ButtonCompareFace from './ButtonCompareFace.vue';

const props = defineProps<{ status: string }>();
const isDisabled = computed(() => props.status === 'inactive');

const fileNames = ref<Record<number, string | null>>({ 1: null, 2: null });
const previewSrcs = ref<Record<number, string | null>>({ 1: null, 2: null });
const imageUrls = ref<Record<number, string>>({ 1: '', 2: '' });
const fileInputRefs = ref<Record<number, HTMLInputElement | null>>({ 1: null, 2: null });
const isInvalidUrl = ref<Record<number, boolean>>({ 1: false, 2: false });
const imagesBase64 = ref<Record<number, string>>({ 1: '', 2: '' });

const clearUpload = (id: number) => {
	imageUrls.value[id] = '';
	previewSrcs.value[id] = null;
	fileNames.value[id] = null;
	isInvalidUrl.value[id] = false;
	imagesBase64.value[id] = '';
	if (fileInputRefs.value[id]) {
		fileInputRefs.value[id]!.value = '';
	}
};

const onFileChange = (id: number, event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files?.[0]) {
		const file = input.files[0];
		const reader = new FileReader();
		console.log('reader', reader);
		reader.onload = () => {
			if (reader.result) {
				const base64 = reader.result.toString();
				previewSrcs.value[id] = base64;
				fileNames.value[id] = file.name;
				imageUrls.value[id] = '';
				isInvalidUrl.value[id] = false;
				imagesBase64.value[id] = base64;
			}
		};
		reader.readAsDataURL(file);
	} else {
		clearUpload(id);
	}
};

const onUrlChange = async (id: number) => {
	const url = imageUrls.value[id];
	if (!url) {
		clearUpload(id);
		return;
	}

	try {
		const response = await fetch(url);
		const blob = await response.blob();
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result) {
				const base64 = reader.result.toString();
				previewSrcs.value[id] = base64;
				fileNames.value[id] = null;
				isInvalidUrl.value[id] = false;
				imagesBase64.value[id] = base64;
			}
		};
		reader.readAsDataURL(blob);
	} catch {
		isInvalidUrl.value[id] = true;
		previewSrcs.value[id] = null;
		fileNames.value[id] = null;
	}
};

const handleImageError = (id: number) => {
	isInvalidUrl.value[id] = true;
	previewSrcs.value[id] = null;
	fileNames.value[id] = null;
	imagesBase64.value[id] = '';
};
</script>

<style scoped lang="scss">
@import '../../styles/main.scss';

.upload-container {
	display: flex;
	gap: 40px;
}
.upload__clear {
	background: none;
	border: none;
	cursor: pointer;
	font-size: 20px;
	position: absolute;
}

.upload-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}
.upload-url-container {
	position: relative;
	width: 400px;
	height: 30px;
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}
.upload__clear {
	position: absolute;
	right: 10px;
	background: none;
	border: none;
	cursor: pointer;
	font-size: 15px;

	top: 50%;
	transform: translateY(-50%);
}

.upload__url,
.upload {
	width: 400px;
	box-sizing: border-box;
}

.upload__url {
	padding: 8px;
	border: $border-width dashed #513d3d;
	border-radius: $border-radius;
	padding: 8px 40px 8px 12px;
	outline: none;
	text-align: center;
	transition: border-color 0.1s ease;
	background-color: $color-bg;
	width: 100%;
	height: 100%;
	&::placeholder {
		color: #333;
	}

	&:hover {
		border-color: $border-color;
	}
}
.upload__url--active {
	border-color: $border-color;
}

.upload__error-message {
	color: red;
	font-size: 16px;
	text-align: center;
	height: 20px;
	visibility: hidden;
}

.upload__error-message span {
	visibility: visible;
}

.upload {
	height: 400px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: $border-width dashed #513d3d;
	border-radius: $border-radius;
	background-color: $color-bg;
	text-align: center;
	position: relative;
	cursor: pointer;
	overflow: hidden;
	transition: border 0.1s ease;

	&:hover {
		border-color: $border-color;
	}
}

.upload--preview-loaded {
	border: none;
}

.upload__input {
	opacity: 0;
	position: absolute;
	width: 100%;
	height: 100%;
	cursor: pointer;
	z-index: 2;
}

.upload__text {
	position: absolute;
	color: #333;
	font-size: 16px;
}

.upload__preview {
	width: 100%;
	height: 100%;
	border-radius: $border-radius;
	overflow: hidden;
}

.upload__preview img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: $border-radius;
}
</style>
