<template>
	<button class="comparison-button" @click="emit('compare')" :disabled="isLoading">
		<span v-if="!isLoading" class="comparison-button__name">Сравнить</span>
		<div v-else class="loader"></div>
	</button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
	isLoading: boolean;
}>();

const emit = defineEmits<{
	(event: 'compare'): void;
}>();
</script>

<style scoped lang="scss">
@import '../../../styles/main.scss';

.comparison-button {
	width: 250px;
	position: relative;
	height: 50px;
	padding: 0 30px;
	color: #513d3d;
	border: $border-width solid #513d3d;
	background-color: $color-bg;
	border-radius: $border-radius;
	user-select: none;
	white-space: nowrap;
	transition: all 0.05s linear;
	font-family: inherit;
	margin: auto;
	display: flex;
	justify-content: center;
	align-items: center;

	&:hover {
		cursor: pointer;
		border-color: $border-color;
		color: $border-color;
	}

	&:active {
		transform: scale(0.97);
	}

	&__name {
		font-size: 18px;
		z-index: 3;
		position: relative;
		font-weight: 500;
	}

	.loader {
		border: 3px solid #f3f3f3;
		border-top: 3px solid $border-color;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
}
</style>
