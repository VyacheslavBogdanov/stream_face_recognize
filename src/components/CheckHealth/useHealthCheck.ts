import { ref, onMounted, onUnmounted } from 'vue';

export function useHealthCheck() {
	const status = ref<'active' | 'inactive'>('inactive');
	let interval: number;

	const checkHealth = async () => {
		try {
			const response = await fetch('/api/health');

			if (response.ok) {
				const data = await response.json();

				if (data.result === 1) {
					status.value = 'active';
				} else {
					status.value = 'inactive';
				}
			} else {
				console.error('Ошибка ответа от сервера:', response.status);
				status.value = 'inactive';
			}
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
