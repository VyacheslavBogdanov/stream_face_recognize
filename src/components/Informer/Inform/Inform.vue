<template>
	<div v-for="(type, index) in props.messageTypes" :key="index" :class="['inform', type.class]">
		<div :class="getTextColorModifier(props.theme, type.class)">
			<div class="inform__icon">ⓘ</div>
			{{ type.message }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { MessageTypes } from '../utils/types.js';
import { getTextColorModifier } from '../utils/getTextColorModifier.js';

const props = defineProps<{
	theme: string;
	messageTypes: MessageTypes[];
}>();
</script>

<style lang="scss" scoped>
@import '../utils/variables.scss';

.inform {
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px 30px 10px 40px;
	border-radius: $border-radius;
	max-width: fit-content;
	word-wrap: break-word;
	font-size: 23px;
	height: 40px;
	opacity: 0.85;

	&__icon {
		display: flex;
		position: absolute;
		transform: rotate(180deg);
		left: 10px;
		height: 30px;
	}

	&--success {
		background-color: #e0fde7;
		color: #2a9b44;
	}

	&--warning {
		background-color: #f9ebd8;
		color: #d77417;
	}

	&--error {
		background-color: #f2dee0;
		color: #db1428;
	}

	&--info {
		background-color: #e3e3ff;
		color: #1052ec;
	}

	&--default {
		background-color: #cecece;
		color: #000;
	}

	&--dark-theme-text {
		color: $color-white;
	}
}
</style>
