<template>
	<div class="upload">
		<button class="upload__clear-btn" @click="onClearClick">Очистить</button>
		<div
			class="upload__file-container"
			:class="{ 'upload__file-container--preview-loaded': previewSrc }"
		>
			<div v-if="previewSrc" class="upload__preview">
				<img :src="previewSrc" alt="Не удалось загрузить" class="upload__preview-image" />
			</div>
			<input
				ref="fileInputRef"
				class="upload__file-input"
				type="file"
				accept="image/*"
				@change="onFileChange"
				:title="fileName || 'Выберите файл для загрузки'"
			/>
			<span v-if="!previewSrc" class="upload__file-placeholder">Загрузите изображение</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { ClearUploadSource } from '../../../components/utils/useClearUpload';

const emit = defineEmits(['update:imageData', 'clear']);

const fileName = ref<string | null>(null);
const previewSrc = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageBase64 = ref<string>('');

const clearUpload = ClearUploadSource(previewSrc, fileName, imageBase64, fileInputRef, emit);

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
				imageBase64.value = base64;

				emit('update:imageData', base64);
			}
		};
		reader.readAsDataURL(file);
	} else {
		clearUpload();
	}
};
</script>

<style scoped lang="scss">
@import '../Style/UploadStyle.scss';
</style>
