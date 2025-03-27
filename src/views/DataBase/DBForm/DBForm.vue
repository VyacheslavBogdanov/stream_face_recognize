<script setup lang="ts">
import { ref } from 'vue';
import type { FaceDB } from '../../../components/utils/types.ts';
const props = defineProps<{ newFace: FaceDB }>();
const emit = defineEmits(['update:newFace', 'addFace']);

const onFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (!target.files?.[0]) return;

	const reader = new FileReader();
	reader.onload = () => {
		emit('update:newFace', {
			...props.newFace,
			photoUrl: reader.result as string,
		});
	};
	reader.readAsDataURL(target.files[0]);
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

		<input
			type="file"
			accept="image/*"
			placeholder="Введите URL изображения"
			class="form__input"
			required
			@change="onFileChange"
		/>
		<button type="submit" class="form__button">Добавить в БД</button>
	</form>
</template>

<style lang="scss" scoped>
@import '../../../styles/main.scss';

.form {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;

	th,
	&__input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ccc;
		box-shadow:
			0px 3px 8px -6px rgba(24, 39, 75, 0.05),
			0px 10px 36px -4px rgba(17, 24, 41, 0.1);
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
