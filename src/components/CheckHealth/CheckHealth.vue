<template>
	<div>
		<div
			v-for="(type, index) in filteredMessageTypes"
			:key="index"
			:class="['health', type.class]"
		>
			<div class="health__icon">ⓘ</div>
			<span>{{ type.message }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHealthCheck } from './useHealthCheck';

const props = defineProps<{
	messageTypes: { class: string; message: string }[];
}>();

const { status } = useHealthCheck();

const filteredMessageTypes = computed(() => {
	if (status.value === 'active') {
		return props.messageTypes.filter((type) => type.class === 'health--success');
	}
	return props.messageTypes.filter((type) => type.class === 'health--warning');
});
</script>

<style lang="scss" scoped>
@import '../utils/variables.scss';

.health {
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
	margin: 20px 0;

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
}
</style>
