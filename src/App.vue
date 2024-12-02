<template>
	<div id="app">
		<h1>FIRE-DETECTOR APP INTERFACE</h1>
		<Info />
		<div class="app__main">
			<FileUploaderComponent @file-selected="onFileSelected" />
			<DetectionResultComponent :result="result" />
		</div>
		<button>Обнаружить огонь</button>
		<Informer />
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Info from '@/components/HeaderComponent/Info.vue';
import FileUploaderComponent from '@/components/FileUploaderComponent/FileUploaderComponent.vue';
import DetectionResultComponent from '@/components/DetectionResultComponent/DetectionResultComponent.vue';
import Informer from '@/components/Informer/Informer.vue';

const result = ref<null | { type: string }>(null);

const onFileSelected = async (file: File) => {
	const imageBase64 = await toBase64(file);
	const response = await fetch('/predict', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			thresholds: [
				{
					move_confidence: 0.2,
					move_velocity: 0.3,
					static_confidence: 0.7,
					type: 'fire',
				},
			],
			sabotage_threshold: 22,
			requestId: generateRequestId(),
			image: imageBase64,
		}),
	});

	const data = await response.json();
	result.value = data.objects.find((obj: any) => obj.type === 'fire')
		? { type: 'fire' }
		: { type: 'no-fire' };
};

const generateRequestId = () => Math.random().toString(36).substring(2);
const toBase64 = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
		reader.readAsDataURL(file);
	});
</script>

<style lang="scss" scoped>
@import './styles/main.scss';

h1 {
	text-align: center;
	padding-top: 2%;
	padding-bottom: 1.5%;
	color: rgba(100, 71, 14, 0.768);
}

#app {
	display: flex;
	align-items: center;
	flex-direction: column;

	&__main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
	}
}
</style>
