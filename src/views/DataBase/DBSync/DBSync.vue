<script setup lang="ts">
import { computed } from 'vue';
import type { FaceDB } from '../../../components/utils/types.ts';
const syncRequired = computed(() => props.faces.length !== props.vectors.length);
const props = defineProps<{
	vectors: string[];
	faces: FaceDB[];
}>();
const emit = defineEmits(['syncDB']);
</script>

<template>
	<div class="sync">
		<div :class="{ sync__item: true, 'sync__item--syncRequired': syncRequired }">
			Векторов в БД: {{ props.vectors.length }}
		</div>
		<div :class="{ sync__item: true, 'sync__item--syncRequired': syncRequired }">
			Объектов в локальной БД: {{ props.faces.length }}
		</div>
		<div class="sync__sync">
			<button
				:class="{
					sync__syncBtn: true,
					'sync__syncBtn--syncRequired': syncRequired,
					'sync__syncBtn--isSync': true,
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

.sync {
	display: flex;
	margin: 10px;
	padding: 10px;
	justify-content: space-between;
	flex-direction: row-reverse;
	align-items: center;

	&__item {
		font-weight: bold;
		padding: 10px;

		&--syncRequired {
			color: #dc3545;
		}
	}

	&__sync {
		padding: 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	&__syncBtn {
		padding: 8px 12px;
		background-color: #007bff;
		color: #fff;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;

		&--syncRequired {
			background-color: #dc3545;
		}
	}

	&__syncBtn::before {
		content: '\21BB';
		font-size: 24px;
		display: inline-block;
		transform-origin: center;
		margin-right: 7px;
	}

	// &__syncBtn:hover::before {
	// 	animation: rotate 2s linear infinite;
	// }

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
}
</style>
