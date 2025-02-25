<template>
	<button class="compare-button" @click="$emit('compare')" :disabled="isDisabled">
		Сравнить
	</button>
</template>

<script setup lang="ts">
defineProps<{ isDisabled: boolean }>();
defineEmits(['compare']);
</script>

<style scoped lang="scss">
.compare-button {
	padding: 10px 20px;
	background-color: #ffffff;
	color: rgb(0, 0, 0);
	border: none;
	border-radius: 5px;
	cursor: pointer;
	font-size: 16px;
	transition: background 0.3s;

	&:hover {
		background-color: #cad5e1;
	}

	&:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}
}
</style>
