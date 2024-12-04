<template>
	<div class="result" :class="resultClass">
		{{ message }}
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ result: null | { type: string } }>();

const message = computed(() =>
	props.result?.type === 'fire' ? 'Огонь обнаружен' : 'Огонь не обнаружен',
);
const resultClass = computed(() =>
	props.result?.type === 'fire' ? 'result--fire' : 'result--no-fire',
);
</script>

<style lang="scss" scoped>
.result {
	font-size: 24px;
	font-weight: bold;

	&--fire {
		color: green;
	}

	&--no-fire {
		color: red;
	}
}
</style>
