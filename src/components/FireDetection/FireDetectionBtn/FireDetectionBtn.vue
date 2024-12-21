<template>
	<button
		:class="['fire-search', { 'fire-search--disabled': isDisabled }]"
		@click="emit('sendRequest')"
		:disabled="isDisabled"
	>
		<span class="fire-search__name">Обнаружить огонь</span>
	</button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHealthCheck } from '@/components/CheckHealth/useHealthCheck';

const emit = defineEmits<{
	(event: 'sendRequest'): void;
}>();

const { status } = useHealthCheck();

const isDisabled = computed(() => status.value === 'inactive');
</script>

<style lang="scss" scoped>
@import '../../../styles/main.scss';
.fire-search {
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

	&--disabled {
		border-color: #aaa;
		border-style: solid;
		cursor: not-allowed;
		color: #bbb;
		background-color: #f5f5f5;

		&:before,
		&:after {
			display: none;
		}
	}

	&:before,
	&:after {
		content: '';
		position: absolute;
		background-color: $color-bg;
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

	&__name {
		font-size: 25px;
		z-index: 3;
		position: relative;
		font-weight: 500;
	}
}
</style>
