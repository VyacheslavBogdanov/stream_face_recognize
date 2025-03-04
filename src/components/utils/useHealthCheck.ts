import { ref, onMounted, onUnmounted } from 'vue';

export function useHealthCheck() {
	const status = ref<'active' | 'inactive'>('inactive');
	let intervalId: number | undefined;

	const checkHealth = async () => {
const Url = import.meta.env.VITE_SERVER_HOST;
		try {
			const response = await fetch(`${Url}/health`);

			if (response.ok) {
				const data = await response.json();

				// Для тестирования
				// const data = { result: 0 };

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
		intervalId = window.setInterval(checkHealth, 30000);
	};

	const stopHealthCheck = () => {
		if (intervalId !== undefined) {
			clearInterval(intervalId);
		}
	};

	onMounted(startHealthCheck);
	onUnmounted(stopHealthCheck);

	return { status };
}
