<template>
	<div
		:class="['upload', { 'upload--active': fileName, 'upload--disabled': isDisabled }]"
		@dragover.prevent
		@drop.prevent
	>
		<input
			class="upload__input"
			type="file"
			accept="image/*"
			@change="onFileChange"
			:disabled="isDisabled"
		/>
		<span class="upload__text">
			{{ fileName || 'Загрузить изображение...' }}
		</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHealthCheck } from '@/components/CheckHealth/useHealthCheck';

const emit = defineEmits<{
	(event: 'fileSelected', base64: string): void;
	(event: 'fileUrl', url: string): void;
}>();

const { status } = useHealthCheck();

const isDisabled = computed(() => status.value === 'inactive');

const fileName = ref<string | null>(null);

const onFileChange = (event: Event) => {
	console.log('input', event);
	const input = event.target as HTMLInputElement;
	if (input.files && input.files[0]) {
		fileName.value = input.files[0].name;

		const fileUrl = URL.createObjectURL(input.files[0]);
		emit('fileUrl', fileUrl);

		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result) {
				emit('fileSelected', reader.result.toString());
			}
		};
		reader.readAsDataURL(input.files[0]);
	} else {
		fileName.value = null;
	}
};
</script>

<style scoped lang="scss">
@import '../../../styles/main.scss';

.upload {
	width: 200px;
	height: 32px;
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

	&__input {
		opacity: 0;
		position: absolute;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	&__text {
		font-size: 14px;
		font-weight: 500;
		color: #888;
		pointer-events: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 90%;
	}
}
</style>
