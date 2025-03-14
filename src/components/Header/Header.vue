<template>
	<header class="header">
		<div
			v-for="(type, index) in filteredMessageTypes"
			:key="index"
			:class="['health', type.class]"
		>
			<div class="health__icon">ⓘ</div>
			<span>{{ type.message }}</span>
		</div>
		<nav :class="['header__nav', { 'header__nav--disabled': props.status === 'inactive' }]">
			<router-link to="/" class="header__link">Поиск по фото</router-link>
			<router-link to="/comparison-of-two-photos" class="header__link"
				>Сравнение двух фото</router-link
			>
			<router-link to="/data-base" class="header__link">База данных</router-link>
		</nav>
	</header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { MessageType } from '../utils/types';
import { useRouter } from 'vue-router';

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

const router = useRouter();

onMounted(() => {
	if (props.status === 'inactive') {
		router.push('/data-base');
	}
});
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';

.header {
	width: 100%;
	height: 100px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 10px;
	border-radius: 5px;
	background: #ffffff;
	box-shadow:
		0px 3px 8px -6px rgba(24, 39, 75, 0.05),
		0px 10px 36px -4px rgba(17, 24, 41, 0.1);

	&__nav {
		display: flex;
		flex-direction: row-reverse;
		font-size: 25px;
		position: relative;

		&--disabled {
			pointer-events: none;
			opacity: 0.5;
		}

		@media (max-width: 1800px) {
			font-size: 20px;
		}
	}

	&__link {
		color: rgb(0, 0, 0);
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		transition: background 0.3s ease;

		&.router-link-active {
			background: #e1e4ee;
		}
	}

	.health {
		position: absolute;
		left: 20%;
		display: flex;
		align-items: center;
		padding: 10px 20px 10px 40px;
		border-radius: $border-radius;
		max-width: fit-content;
		word-wrap: break-word;
		font-size: 23px;
		height: 40px;
		opacity: 0.85;
		margin: 0 70px;

		&__icon {
			display: flex;
			position: absolute;
			align-items: center;
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

		@media (max-width: 2440px) {
			left: 0;
		}

		@media (max-width: 1800px) {
			font-size: 17px;
			padding: 5px 20px 5px 40px;
		}
	}
}
</style>
