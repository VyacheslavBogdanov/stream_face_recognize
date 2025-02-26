<template>
	<button class="compare-button" @click="emit('compare')" :disabled="isDisabled">Сравнить</button>
</template>

<script setup lang="ts">
defineProps<{ isDisabled: boolean }>();
const emit = defineEmits<{
	(event: 'compare'): void;
}>();
</script>

<style scoped lang="scss">
@import '../../styles/main.scss';
.compare-button {
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
	margin: 20px 0 20px 10px;

	&:before,
	&:after {
		content: '';
		position: absolute;

		transition: all 0.2s linear;
	}

	&:before {
		width: calc(100% + 6px);
		height: calc(100% - 16px);
		top: 8px;
		left: -3px;
	}

	&:after {
		width: calc(100% - 16px);
		height: calc(100% + 6px);
		top: -3px;
		left: 8px;
	}

	&:hover {
		cursor: pointer;
		border-color: rgb(3, 2, 2);
		color: rgb(11, 11, 11);

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
	&__name {
		font-size: 25px;
		z-index: 0;
		position: relative;
		font-weight: 500;
	}
}
</style>
