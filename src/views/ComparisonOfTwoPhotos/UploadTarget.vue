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
				:class="{ 'upload__url--active': imageUrl && !isInvalidUrl }"
				:disabled="isDisabled"
			/>
			<button class="upload__clear" @click="clearUpload" :disabled="isDisabled">🗑</button>
		</div>
		<div
			class="upload"
			:class="{ 'upload--preview-loaded': previewSrc }"
			@dragover.prevent
			@drop.prevent
		>
			<div v-if="previewSrc" class="upload__preview">
				<img
					ref="imageElement"
					:src="previewSrc"
					@error="handleImageError"
					alt="Не удалось загрузить"
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
import { ref, computed, watch, defineEmits, defineProps } from 'vue';

const emit = defineEmits(['update:imageData']);
const props = defineProps<{
	isDisabled: boolean;
	bboxes: number[];
}>();

const localBboxes = ref<number[]>(props.bboxes);

const fileName = ref<string | null>(null);
const previewSrc = ref<string | null>(null);
const imageUrl = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageElement = ref<HTMLImageElement | null>(null);
const isInvalidUrl = ref<boolean>(false);
const imageBase64 = ref<string>('');

const bboxesArray = computed(() => {
	const result = [];
	for (let i = 0; i < localBboxes.value.length; i += 4) {
		result.push(localBboxes.value.slice(i, i + 4));
	}
	return result;
});

const scaledBboxes = computed(() => {
	if (!imageElement.value) return [];

	const img = imageElement.value;
	const scaleX = img.clientWidth / img.naturalWidth;
	const scaleY = img.clientHeight / img.naturalHeight;

	return bboxesArray.value.map(([x, y, width, height]) => ({
		left: x * scaleX,
		top: y * scaleY,
		width: width * scaleX,
		height: height * scaleY,
	}));
});

watch(
	() => props.bboxes,
	(newBboxes) => {
		localBboxes.value = [...newBboxes];
	},
	{ deep: true },
);

const clearUpload = () => {
	imageUrl.value = '';
	previewSrc.value = null;
	fileName.value = null;
	isInvalidUrl.value = false;
	imageBase64.value = '';
	localBboxes.value = [];

	if (fileInputRef.value) fileInputRef.value.value = '';

	emit('update:imageData', '');
};

const onFileChange = (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input && input.files && input.files[0]) {
		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = async () => {
			if (reader.result) {
				const base64 = reader.result.toString();
				previewSrc.value = base64;
				fileName.value = file.name;
				imageUrl.value = '';
				isInvalidUrl.value = false;
				imageBase64.value = base64;
				localBboxes.value = [];

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

		reader.onload = async () => {
			if (reader.result) {
				const base64 = reader.result.toString();
				previewSrc.value = base64;
				fileName.value = null;
				isInvalidUrl.value = false;
				imageBase64.value = base64;
				localBboxes.value = [];

				emit('update:imageData', base64);
			}
		};
		reader.readAsDataURL(blob);
	} catch {
		isInvalidUrl.value = true;
		previewSrc.value = null;
		fileName.value = null;
		localBboxes.value = [];

		emit('update:imageData', '');
	}
};

const handleImageError = () => {
	isInvalidUrl.value = true;
	previewSrc.value = null;
	fileName.value = null;
	imageBase64.value = '';
	localBboxes.value = [];

	emit('update:imageData', '');
};
</script>

<style scoped lang="scss">
@import '../../styles/main.scss';
@import './Style/UploadStyle.scss';

.upload__bbox {
	position: absolute;
	border: 2px solid red;
	box-sizing: border-box;
}
</style>
