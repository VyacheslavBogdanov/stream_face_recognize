<template>
	<div :class="['upload', { 'upload--active': fileName }]" @dragover.prevent @drop.prevent>
		<input class="upload__input" type="file" accept="image/*" @change="onFileChange" />
		<span class="upload__text">
			{{ fileName || 'Загрузить изображение...' }}
		</span>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const fileName = ref<string | null>(null);

const onFileChange = (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files[0]) {
		fileName.value = input.files[0].name;
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
	border: 1.5px dashed #ccc;
	border-radius: 5px;
	background-color: #fdfdfd;
	text-align: center;
	transition:
		border-color 0.3s ease,
		background-color 0.3s ease;
	position: relative;
	cursor: pointer;
	margin: 20px 10px 20px 0;

	&:hover {
		border-color: $all-border-color;
	}

	&--active {
		border-color: $all-border-color;
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
