<template>
	<button class="compare-button" @click="emit('compare')" :disabled="isDisabled">
		<span class="compare-button__name">Сравнить</span>
	</button>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{ isDisabled: boolean }>();

const emit = defineEmits<{
	(event: 'compare'): void;
}>();
</script>

<style scoped lang="scss">
@import '../../styles/main.scss';

.compare-button {
	width: 250px;
	position: relative;
	height: 50px;
	padding: 0 30px;
	color: #513d3d;
	border: 1px solid #513d3d;
	background-color: $color-bg;
	border-radius: $border-radius;
	user-select: none;
	white-space: nowrap;
	transition: all 0.05s linear;
	font-family: inherit;
	margin: auto;
	display: block;

	&:hover {
		cursor: pointer;
		border-color: $border-color;
		color: $border-color;

		&:before {
			height: calc(100% - 32px);
			top: 16px;
		}

		&:after {
			width: calc(100% - 32px);
			left: 16px;
		}
	}

	&:active {
		transform: scale(0.97);
	}

	&:disabled {
		cursor: not-allowed;
		background-color: $color-bg;
		border-color: #bfbfbf;
		color: #a0a0a0;
		opacity: 0.7;
		transition: none;
	}

	&__name {
		font-size: 18px;
		z-index: 3;
		position: relative;
		font-weight: 500;
	}
}
</style>
