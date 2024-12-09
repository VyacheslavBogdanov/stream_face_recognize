// import { ref, onMounted, onUnmounted } from 'vue';
// import config from './config';

// export function useHealthCheck() {
// 	const status = ref<'active' | 'inactive'>('inactive');
// 	let interval: number;

// 	const checkHealth = async () => {
// 		try {
// 			const response = await fetch(`${config.host}/health`);
// 			console.log('RESPONSE', response);

// 			if (response.status === 200) {
// 				const data = await response.json();
// 				console.log('DATA', data);

// 				if (data.status === 'active' || data.status === 'inactive') {
// 					status.value = data.status;
// 				} else {
// 					status.value = 'inactive';
// 				}
// 			}
// 		} catch (error) {
// 			console.error('Ошибка подключения:', error);
// 			status.value = 'inactive';
// 		}
// 	};

// 	const startHealthCheck = () => {
// 		checkHealth();
// 		interval = setInterval(checkHealth, 15000);
// 	};

// 	const stopHealthCheck = () => {
// 		clearInterval(interval);
// 	};

// 	onMounted(startHealthCheck);
// 	onUnmounted(stopHealthCheck);

// 	return { status };
// }

import { ref, onMounted, onUnmounted } from 'vue';

export function useHealthCheck() {
	const status = ref<'active' | 'inactive'>('inactive');
	let interval: number;

	const checkHealth = async () => {
		try {
			// Используем относительный путь к API
			const response = await fetch('/api/health');

			if (response.ok) {
				const data = await response.json();
				console.log('DATA:', data);

				if (data.status === 'active' || data.status === 'inactive') {
					status.value = data.status;
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
		interval = setInterval(checkHealth, 5000);
	};

	const stopHealthCheck = () => {
		clearInterval(interval);
	};

	onMounted(startHealthCheck);
	onUnmounted(stopHealthCheck);

	return { status };
}
