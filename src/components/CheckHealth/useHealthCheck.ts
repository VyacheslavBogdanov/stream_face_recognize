// import { ref, onMounted, onUnmounted } from 'vue';

// export function useHealthCheck() {
// 	const status = ref<'active' | 'inactive'>('inactive');
// 	let interval: number;

// 	const checkHealth = async () => {
// 		try {
// 			const response = await fetch('http://81.94.156.176:5011/health');

// 			if (response.ok) {
// 				const data = await response.json();
// 				console.log(data);

// 				if (data.result === 1) {
// 					status.value = 'active';
// 				} else {
// 					status.value = 'inactive';
// 				}
// 			} else {
// 				console.error('Ошибка ответа от сервера:', response.status);
// 				status.value = 'inactive';
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
	let intervalId: number | undefined;

	const checkHealth = async () => {
		try {
			const response = await fetch('http://81.94.156.176:5011/health');

			if (response.ok) {
				// const data = await response.json();
				const data = { result: 0 };
				console.log(data);

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
		intervalId = window.setInterval(checkHealth, 15000);
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
