<script setup lang="ts">
const props = defineProps<{
	vectors: string[];
	faces: { id: string }[];
	syncRequired: boolean;
}>();
const emit = defineEmits(['syncDB']);
</script>

<template>
	<div class="menu">
		<div :class="{ menu__item: true, 'menu__item--syncRequired': syncRequired }">
			Векторов в БД: {{ vectors.length }}
		</div>
		<div :class="{ menu__item: true, 'menu__item--syncRequired': syncRequired }">
			Объектов в локальной БД: {{ faces.length }}
		</div>
		<div class="menu__sync">
			<button
				:class="{
					menu__syncBtn: true,
					'menu__syncBtn--syncRequired': syncRequired,
					'menu__syncBtn--isSync': true,
				}"
				@click="$emit('syncDB')"
			>
				Синхронизация
			</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import '../../../styles/main.scss';

.menu {
	display: flex;
	margin: 10px;
	padding: 10px;
	justify-content: space-between;
	flex-direction: row-reverse;
	align-items: center;
}

.menu__item {
	font-weight: bold;
	padding: 10px;

	&--syncRequired {
		color: #dc3545;
	}
}

.menu__sync {
	padding: 10px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

.menu__syncBtn {
	padding: 8px 12px;
	background-color: #007bff;
	color: #fff;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;

	&--syncRequired {
		background-color: #dc3545;
	}
}

.menu__syncBtn::before {
	content: '\21BB';
	font-size: 24px;
	display: inline-block;
	transform-origin: center;
	margin-right: 7px;
}

.menu__syncBtn:hover::before {
	animation: rotate 2s linear infinite;
}

@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
