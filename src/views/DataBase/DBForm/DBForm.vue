<script setup lang="ts">
import type { FaceDB } from '../../../components/utils/types.ts';
const props = defineProps<{ newFace: FaceDB }>();
const emit = defineEmits(['update:newFace', 'addFace']);
</script>

<template>
	<form class="database__form" @submit.prevent="$emit('addFace')">
		<input
			type="text"
			placeholder="Введите имя"
			class="database__input"
			required
			:value="newFace.name"
			@input="
				(e) =>
					emit('update:newFace', {
						...newFace,
						name: (e.target as HTMLInputElement).value,
					})
			"
		/>
		<input
			type="url"
			placeholder="Введите URL изображения"
			class="database__input"
			required
			:value="newFace.photoUrl"
			@input="
				(e) =>
					emit('update:newFace', {
						...newFace,
						photoUrl: (e.target as HTMLInputElement).value,
					})
			"
		/>
		<button type="submit" class="database__button">Добавить в БД</button>
	</form>
</template>

<style lang="scss" scoped>
@import '../../../styles/main.scss';

.database__form {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
}

.database__input {
	flex: 1;
	padding: 8px;
	border: 1px solid #ccc;
	border-radius: 5px;
}

.database__button {
	padding: 8px 12px;
	background-color: #007bff;
	color: #fff;
	border: none;
	border-radius: 5px;
	cursor: pointer;
}
</style>
