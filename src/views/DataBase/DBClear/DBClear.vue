<script setup lang="ts">
const props = defineProps<{ faces: { id: string }[] }>();
const emit = defineEmits(['clearDatabase']);
</script>

<template>
	<button
		v-if="faces.length"
		@click="$emit('clearDatabase')"
		class="database__button database__button--danger"
	>
		Удалить все из БД
	</button>
</template>

<style lang="scss" scoped>
@import '../../../styles/main.scss';

.database__button {
	padding: 8px 12px;
	background-color: #007bff;
	color: #fff;
	border: none;
	border-radius: 5px;
	cursor: pointer;

	&--danger {
		background-color: #dc3545;
		margin-top: 10px;
	}
}
</style>
