<template>
	<div>
		<button @click="sendRequest">Проверить огонь</button>
		<div class="result" :class="resultClass">
			{{ message }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const result = ref<{ type: string } | null>(null);

const message = computed(() =>
	result.value?.type === 'fire' ? 'Огонь обнаружен' : 'Огонь не обнаружен',
);

const resultClass = computed(() =>
	result.value?.type === 'fire' ? 'result--fire' : 'result--no-fire',
);

const sendRequest = async () => {
	try {
		const response = await fetch('http://localhost:4000/predict', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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
				requestId: '',
				image: '',
			}),
		});

		if (!response.ok) {
			throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Ответ от сервера:', data);
		if (data.objects && data.objects.length > 0) {
			result.value = { type: data.objects[0].type };
		} else {
			throw new Error('Некорректный формат ответа');
		}
	} catch (error) {
		console.error('Ошибка при запросе:', error);
		result.value = { type: 'no_fire' };
	}
};
</script>

<style scoped>
.result {
	font-size: 1.5em;
	margin-top: 20px;
}

.result--fire {
	color: red;
}

.result--no-fire {
	color: green;
}
</style>

<style scoped>
.result {
	font-size: 1.5em;
	margin-top: 20px;
}

.result--fire {
	color: red;
}

.result--no-fire {
	color: green;
}
</style>
