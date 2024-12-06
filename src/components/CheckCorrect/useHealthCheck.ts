import { ref, onMounted, onUnmounted } from 'vue';
import config from './config';

export function useHealthCheck() {
	const status = ref<'active' | 'inactive'>('inactive');
	let interval: number;

	const checkHealth = async () => {
		try {
			const response = await fetch(`${config.host}/health`);
			// if (response.status === 200) {
			const data = await response.json();
			console.log('DATA', data);

			if (data.status === 'active' || data.status === 'inactive') {
				status.value = data.status;
			} else {
				status.value = 'inactive';
			}
			// }
		} catch (error) {
			console.error('Ошибка подключения:', error);
			status.value = 'inactive';
		}
	};

	const startHealthCheck = () => {
		checkHealth();
		interval = setInterval(checkHealth, 15000);
	};

	const stopHealthCheck = () => {
		clearInterval(interval);
	};

	onMounted(startHealthCheck);
	onUnmounted(stopHealthCheck);

	return { status };
}
