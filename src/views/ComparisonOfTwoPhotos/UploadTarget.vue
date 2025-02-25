<template>
	<div class="upload-wrapper">
		<div class="upload__error-message">
			<span v-if="isInvalidUrl">Неверный URL</span>
		</div>
		<div class="upload-url-container">
			<input
				class="upload__url"
				type="text"
				v-model="imageUrl"
				placeholder="Введите URL изображения..."
				@input="onUrlChange"
				:disabled="isDisabled"
				:class="{ 'upload__url--active': imageUrl && !isInvalidUrl }"
			/>
			<button class="upload__clear" @click="clearUpload">🗑</button>
		</div>
		<div
			class="upload"
			:class="{ 'upload--preview-loaded': previewSrc }"
			@dragover.prevent
			@drop.prevent
		>
			<div v-if="previewSrc" class="upload__preview">
				<img :src="previewSrc" @error="handleImageError" alt="Не удалось загрузить" />
			</div>
			<input
				ref="fileInputRef"
				class="upload__input"
				type="file"
				accept="image/*"
				@change="onFileChange"
				:disabled="isDisabled"
			/>
			<span v-if="!previewSrc" class="upload__input-text">Upload Target Image</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from 'vue';

const emit = defineEmits(['update:imageData']);
const props = defineProps<{
	status: string;
}>();
const isDisabled = computed(() => props.status === 'inactive');

const fileName = ref<string | null>(null);
const previewSrc = ref<string | null>(null);
const imageUrl = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const isInvalidUrl = ref<boolean>(false);
const imageBase64 = ref<string>('');

const clearUpload = () => {
	imageUrl.value = '';
	previewSrc.value = null;
	fileName.value = null;
	isInvalidUrl.value = false;
	imageBase64.value = '';
	if (fileInputRef.value) fileInputRef.value.value = '';

	emit('update:imageData', '');
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
@import '../../styles/main.scss';
@import './Style/UploadStyle.scss';
</style>
