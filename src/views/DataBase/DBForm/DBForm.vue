<script setup lang="ts">
import { ref } from 'vue';
import type { FaceDB } from '../../../components/utils/types.ts';

const props = defineProps<{ newFace: FaceDB }>();
const emit = defineEmits(['update:newFace', 'addFace']);

const fileName = ref<string>('Загрузите файл...');

const onFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (!target.files?.[0]) return;

	const file = target.files[0];
	fileName.value = file.name;

	const reader = new FileReader();
	reader.onload = () => {
		emit('update:newFace', {
			...props.newFace,
			photoUrl: reader.result as string,
		});
	};
	reader.readAsDataURL(file);
};
</script>

<template>
	<form class="form" @submit.prevent="$emit('addFace')">
		<input
			type="text"
			placeholder="Введите имя"
			class="form__input"
			required
			:value="props.newFace.name"
			@input="
				(e) =>
					emit('update:newFace', {
						...props.newFace,
						name: (e.target as HTMLInputElement).value,
					})
			"
		/>
		<div class="form__file-input">
			<label for="fileUpload" class="form__file-label">{{ fileName }}</label>
			<input
				id="fileUpload"
				type="file"
				accept="image/*"
				class="form__file-hidden"
				@change="onFileChange"
			/>
		</div>
		<button type="submit" class="form__button">Добавить в БД</button>
	</form>
</template>

<style lang="scss" scoped>
@import '../../../styles/main.scss';

.form {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;

	&__input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ccc;
		box-shadow:
			0px 3px 8px -6px rgba(24, 39, 75, 0.05),
			0px 10px 36px -4px rgba(17, 24, 41, 0.1);
	}

	&__file-input {
		position: relative;
		flex: 1;
		border: 1px solid #ccc;
		padding: 8px;
		text-align: center;
		background-color: white;
		box-shadow:
			0px 3px 8px -6px rgba(24, 39, 75, 0.05),
			0px 10px 36px -4px rgba(17, 24, 41, 0.1);
	}

	&__file-hidden {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
	}

	&__file-label {
		display: flex;
		width: 100%;
		font-size: smaller;
		opacity: 0.75;
	}

	&__button {
		padding: 8px 12px;
		background-color: $button-color;
		color: $background-color;
		border: none;
		cursor: pointer;
		box-shadow:
			0px 3px 8px -6px rgba(24, 39, 75, 0.05),
			0px 10px 36px -4px rgba(17, 24, 41, 0.1);
	}
}
</style>
