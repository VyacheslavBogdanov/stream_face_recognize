<template>
	<h1>Informer</h1>
	<div :class="['informer', theme]">
		<button
			class="informer__theme-toggle"
			@click="theme = theme === 'informer--light' ? 'informer--dark' : 'informer--light'"
		>
			{{ theme === 'informer--dark' ? 'Light' : 'Dark' }}
		</button>
		<Inform :messageTypes="messageTypes" :theme="theme" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchData } from '../mocks/db.js';
import { MessageTypes } from './utils/types.js';
import Inform from './Inform/Inform.vue';

const theme = ref<string>('informer--light');
const messageTypes = ref<MessageTypes[]>([]);

const loadData = async () => {
	try {
		messageTypes.value = await fetchData('/message-types');
	} catch (error) {
		console.error(error);
	}
};

onMounted(() => {
	loadData();
});
</script>

<style lang="scss">
@import './utils/variables.scss';

.informer {
	font-family: sans-serif;
	padding: 16px;
	display: flex;
	border-radius: $border-radius;
	flex-direction: column;
	gap: 30px;
	transition:
		background-color 0.5s,
		color 0.5s;
	width: 400px;

	&__theme-toggle {
		width: 50px;
		background-color: transparent;
		border: 1.5px solid #9f979773;
		color: inherit;
		border-radius: $border-radius;
		padding: 4px 8px;
		cursor: pointer;
		text-decoration: none;
	}

	&--light {
		background-color: $color-white;
		color: $color-dark-gray;
	}

	&--dark {
		background-color: $color-dark-gray;
		color: $color-white;
	}
}
</style>
