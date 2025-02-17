<template>
	<div class="upload-container">
		<div
			:class="[
				'upload',
				{
					'upload--active': fileName1,
					'upload--disabled': isDisabled,
					'upload--hidden': previewSrc1,
				},
			]"
			@dragover.prevent
			@drop.prevent
		>
			<input
				class="upload__input"
				type="file"
				accept="image/*"
				@change="onFileChange(1, $event)"
				:disabled="isDisabled"
			/>
			<div v-if="previewSrc1" class="upload__preview">
				<img :src="previewSrc1" alt="Предпросмотр изображения" />
			</div>
			<span v-else class="upload__text">
				{{ fileName1 || 'Загрузить изображение...' }}
			</span>
		</div>

		<div
			:class="[
				'upload',
				{
					'upload--active': fileName2,
					'upload--disabled': isDisabled,
					'upload--hidden': previewSrc2,
				},
			]"
			@dragover.prevent
			@drop.prevent
		>
			<input
				class="upload__input"
				type="file"
				accept="image/*"
				@change="onFileChange(2, $event)"
				:disabled="isDisabled"
			/>
			<div v-if="previewSrc2" class="upload__preview">
				<img :src="previewSrc2" alt="Предпросмотр изображения" />
			</div>
			<span v-else class="upload__text">
				{{ fileName2 || 'Загрузить изображение...' }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ status: string }>();
const emit = defineEmits<{
	(event: 'fileSelected', base64: string, id: number): void;
	(event: 'fileUrl', url: string, id: number): void;
}>();

const isDisabled = computed(() => props.status === 'active');
const fileName1 = ref<string | null>(null);
const fileName2 = ref<string | null>(null);
const previewSrc1 = ref<string | null>(null);
const previewSrc2 = ref<string | null>(null);

const onFileChange = (id: number, event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files[0]) {
		const fileName = input.files[0].name;
		const fileUrl = URL.createObjectURL(input.files[0]);
		const reader = new FileReader();

		reader.onload = () => {
			if (reader.result) {
				if (id === 1) {
					fileName1.value = fileName;
					previewSrc1.value = fileUrl;
					emit('fileUrl', fileUrl, 1);
					emit('fileSelected', reader.result.toString(), 1);
				} else {
					fileName2.value = fileName;
					previewSrc2.value = fileUrl;
					emit('fileUrl', fileUrl, 2);
					emit('fileSelected', reader.result.toString(), 2);
				}
			}
		};
		reader.readAsDataURL(input.files[0]);
	} else {
		if (id === 1) {
			fileName1.value = null;
			previewSrc1.value = null;
		} else {
			fileName2.value = null;
			previewSrc2.value = null;
		}
	}
};
</script>

<style scoped lang="scss">
@import '../../styles/main.scss';

.upload-container {
	display: flex;
	gap: 20px;
}

.upload {
	width: 300px;
	height: 400px;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10px;
	border: $border-width dashed #513d3d;
	border-radius: $border-radius;
	background-color: $color-bg;
	text-align: center;
	transition:
		border-color 0.3s ease,
		background-color 0.3s ease;
	position: relative;
	cursor: pointer;
	margin: 20px 10px 20px 0;
	overflow: hidden;

	&:hover {
		border-color: $border-color;
	}

	&--active {
		border-color: $border-color;
	}

	&--disabled {
		background-color: #f5f5f5;
		border-color: #ddd;

		&:hover {
			border-color: #ddd;
		}

		.upload__text {
			color: #aaa;
		}
	}

	&--hidden {
		border: none;
		background: none;
		cursor: default;
	}

	&__input {
		opacity: 0;
		position: absolute;
		width: 100%;
		height: 100%;
		cursor: pointer;
		z-index: 2;
	}

	&__preview {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: transparent;
		z-index: 1;

		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
			border-radius: $border-radius;
		}
	}
}
</style>
