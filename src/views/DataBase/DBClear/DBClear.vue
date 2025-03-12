<script setup lang="ts">
import type { FaceDB } from '../../../components/utils/types.ts';
const props = defineProps<{ faces: FaceDB[] }>();
const emit = defineEmits(['clearDatabase']);
</script>

<template>
	<button v-if="props.faces.length" @click="$emit('clearDatabase')" class="clearButton">
		Удалить все из БД
	</button>
</template>

<style lang="scss" scoped>
@import '../../../styles/main.scss';

.clearButton {
	padding: 8px 12px;
	background-color: #dc3545;
	margin-top: 10px;
	color: #fff;
	border: none;
	cursor: pointer;
}
</style>
