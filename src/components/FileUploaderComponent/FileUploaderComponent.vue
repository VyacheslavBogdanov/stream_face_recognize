<template>
	<div class="uploader">
		<input type="file" accept="image/*" @change="onFileChange" />
	</div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

const emit = defineEmits(['file-selected']);

const onFileChange = (event: Event) => {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (file) {
		emit('file-selected', file);
	}
};
</script>

<style lang="scss" scoped>
.uploader {
	input {
		display: block;
		margin: 20px 0;
	}
}
</style>
