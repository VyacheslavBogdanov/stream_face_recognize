<template>
	<div class="upload">
		<button class="upload__clear-btn" @click="onClearClick">Очистить</button>
		<div
			class="upload__file-container"
			:class="{ 'upload__file-container--preview-loaded': previewSrc }"
		>
			<div v-if="previewSrc" class="upload__preview">
				<img
					ref="imageElement"
					:src="previewSrc"
					alt="Не удалось загрузить"
					class="upload__preview-image"
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
				class="upload__file-input"
				type="file"
				accept="image/*"
				@change="onFileChange"
				:title="fileName || 'Выберите файл для загрузки'"
			/>
			<span v-if="!previewSrc" class="upload__file-placeholder"> Загрузите изображение </span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineEmits, defineProps } from 'vue';
import { ClearUploadTarget } from '../../../components/utils/useClearUpload';
import { calculateScaledBboxes } from '../../../components/utils/Bbox';

const emit = defineEmits(['update:imageData', 'clear']);
const props = defineProps<{ bboxes: number[] }>();

const localBboxes = ref<number[]>(props.bboxes);
const fileName = ref<string | null>(null);
const previewSrc = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageElement = ref<HTMLImageElement | null>(null);
const imageBase64 = ref<string>('');

const onClearClick = () => {
	clearUpload();
	emit('clear');
};

const bboxesArray = computed(() => {
	const result = [];
	for (let i = 0; i < localBboxes.value.length; i += 4) {
		result.push(localBboxes.value.slice(i, i + 4));
	}
	return result;
});

const scaledBboxes = computed(() => {
	if (!imageElement.value) return [];
	return calculateScaledBboxes(imageElement.value, bboxesArray.value);
});

watch(
	() => props.bboxes,
	(newBboxes) => {
		localBboxes.value = [...newBboxes];
	},
	{ deep: true },
);

const clearUpload = ClearUploadTarget(
	previewSrc,
	fileName,
	imageBase64,
	fileInputRef,
	localBboxes,
	emit,
);

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
</script>

<style scoped lang="scss">
@import '../Style/UploadStyle.scss';

.upload__bbox {
	position: absolute;
	border: 1.5px solid red;
	box-sizing: border-box;
}
</style>
