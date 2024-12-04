<template>
	<div id="app">
		<Info />
		<div class="app__main">
			<!-- <FileUploaderComponent @file-selected="onFileSelected" />
			<DetectionResultComponent :result="result" /> -->
		</div>
		<ButtonFireDetected />
		<!-- <Informer /> -->
	</div>
</template>

<script setup lang="ts">
import Info from '@/components/CheckCorrect/Info.vue';
// import FileUploaderComponent from '@/components/FileUploaderComponent/FileUploaderComponent.vue';
// import DetectionResultComponent from '@/components/DetectionResultComponent/DetectionResultComponent.vue';
// import Informer from '@/components/Informer/Informer.vue';
import ButtonFireDetected from './components/FireDetection/ButtonFireDetected.vue';
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
	font-family: sans-serif;

	&__main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
	}
}
</style>
