import { ref, onMounted, onUnmounted } from 'vue';
import config from '../../config/config';

export function useHealthCheck() {
	const status = ref<'active' | 'inactive'>('inactive');
	let interval: number;

	const checkHealth = async () => {
		console.log('Отправка запроса на:', config.host);
		try {
			const response = await fetch(`${config.host}`);
			if (response.ok) {
				const data = await response.json();
				console.log('Данные сервера:', data);
				status.value = data.status; // Прямое обновление статуса
			} else {
				status.value = 'inactive';
			}
		} catch (error) {
			console.error('Ошибка подключения:', error);
			status.value = 'inactive';
		}
	};

	onMounted(() => {
		checkHealth();
		interval = setInterval(checkHealth, 15000);
	});

	onUnmounted(() => {
		clearInterval(interval);
	});

	return { status };
}
