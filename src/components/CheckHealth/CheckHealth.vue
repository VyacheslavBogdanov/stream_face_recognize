<template>
	<div>
		<nav class="header">
			<router-link to="/" class="header__link">Поиск по фото</router-link>
			<router-link to="/comparison-of-two-photos" class="header__link"
				>Сравнение двух фото</router-link
			>
			<router-link to="/data-base" class="header__link">База данных</router-link>
		</nav>
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
import type { MessageType } from '../utils/types';

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();

const filteredMessageTypes = computed(() => {
	if (props.status === 'active') {
		return props.messageTypes.filter((type) => type.class === 'health--success');
	}
	return props.messageTypes.filter((type) => type.class === 'health--warning');
});
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';

.header {
	display: flex;
	gap: 1rem;

	&__link {
		color: rgb(0, 0, 0);
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		transition: background 0.3s ease;

		// &:hover {
		// 	background: rgba(255, 255, 255, 0.2);
		// }

		&.router-link-active {
			background: #1f2c5649;
		}
	}
}

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

	@media (max-width: 835px) {
		font-size: 17px;
	}

	&__icon {
		display: flex;
		position: absolute;
		transform: rotate(180deg);
		left: 10px;
		height: 30px;
	}

	&--success {
		background-color: #e0fde7;
		color: $color-success;
	}

	&--warning {
		background-color: #f9ebd8;
		color: $color-warning;
	}
}
</style>
