<template>
	<div class="upload">
		<div v-if="isInvalidUrl" class="upload__error-message">
			<span>Неверный URL</span>
		</div>

		<div class="upload__url-container">
			<input
				class="upload__url-input"
				type="url"
				v-model="imageUrl"
				placeholder="Введите URL изображения..."
				@input="onUrlChange"
				:disabled="isDisabled"
			/>
			<button class="upload__clear-btn" @click="onClearClick" :disabled="isDisabled">
				🗑
			</button>
		</div>

		<div
			class="upload__file-container"
			:class="{ 'upload__file-container--preview-loaded': previewSrc }"
			@dragover.prevent
			@drop.prevent
		>
			<div v-if="previewSrc" class="upload__preview">
				<img
					:src="previewSrc"
					@error="handleImageError"
					alt="Не удалось загрузить"
					class="upload__preview-image"
				/>
			</div>
			<input
				ref="fileInputRef"
				class="upload__file-input"
				type="file"
				accept="image/*"
				@change="onFileChange"
				:disabled="isDisabled"
			/>
			<span v-if="!previewSrc" class="upload__file-placeholder">Upload Source Image</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';
import { ClearUploadSource } from '../ComparisonOfTwoPhotos/utils/useClearUpload';

const emit = defineEmits(['update:imageData', 'clear']);
defineProps<{ isDisabled: boolean }>();

const fileName = ref<string | null>(null);
const previewSrc = ref<string | null>(null);
const imageUrl = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const isInvalidUrl = ref<boolean>(false);
const imageBase64 = ref<string>('');

const clearUpload = ClearUploadSource(
	imageUrl,
	previewSrc,
	fileName,
	isInvalidUrl,
	imageBase64,
	fileInputRef,
	emit,
);
const onClearClick = () => {
	clearUpload();
	emit('clear');
};

const onFileChange = (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input && input.files && input.files[0]) {
		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = () => {
			if (reader.result) {
				const base64 = reader.result.toString();
				previewSrc.value = base64;
				fileName.value = file.name;
				imageUrl.value = '';
				isInvalidUrl.value = false;
				imageBase64.value = base64;

				emit('update:imageData', base64);
			}
		};
		reader.readAsDataURL(file);
	} else {
		clearUpload();
	}
};

const onUrlChange = async () => {
	if (!imageUrl.value) {
		clearUpload();
		return;
	}

	try {
		const response = await fetch(imageUrl.value);
		const blob = await response.blob();
		const reader = new FileReader();

		reader.onload = () => {
			if (reader.result) {
				const base64 = reader.result.toString();
				previewSrc.value = base64;
				fileName.value = null;
				isInvalidUrl.value = false;
				imageBase64.value = base64;

				emit('update:imageData', base64);
			}
		};
		reader.readAsDataURL(blob);
	} catch {
		isInvalidUrl.value = true;
		previewSrc.value = null;
		fileName.value = null;

		emit('update:imageData', '');
	}
};

const handleImageError = () => {
	isInvalidUrl.value = true;
	previewSrc.value = null;
	fileName.value = null;
	imageBase64.value = '';

	emit('update:imageData', '');
};
</script>

<style scoped lang="scss">
@import './Style/UploadStyle.scss';
</style>
