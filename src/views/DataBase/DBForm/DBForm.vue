<script setup lang="ts">
import type { FaceDB } from '../../../components/utils/types.ts';
const props = defineProps<{ newFace: FaceDB }>();
const emit = defineEmits(['update:newFace', 'addFace']);
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
			type="url"
			placeholder="Введите URL изображения"
			class="form__input"
			required
			:value="props.newFace.photoUrl"
			@input="
				(e) =>
					emit('update:newFace', {
						...props.newFace,
						photoUrl: (e.target as HTMLInputElement).value,
					})
			"
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

	&__input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	&__button {
		padding: 8px 12px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
}
</style>
