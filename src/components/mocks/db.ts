// const messageTypes = [
// 	{ class: 'inform--success', message: 'Модуль детектора огня работает корректно' },
// 	{ class: 'inform--warning', message: 'Модуль детектора огня отключен' },
// ];

// const mockAPI = (endpoint: string) => {
// 	return new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			if (endpoint === '/message-types') {
// 				resolve(messageTypes);
// 			} else {
// 				reject({ error: 'Not Found', status: 404 });
// 			}
// 		}, 500);
// 	});
// };

// export const fetchData = async (endpoint: string): Promise<any> => {
// 	try {
// 		return await mockAPI(endpoint);
// 	} catch (error) {
// 		console.error(`Error fetching data from ${endpoint}:`, error);
// 		throw error;
// 	}
// };

// Определяем тип для одного сообщения
export interface MessageType {
	class: string;
	message: string;
}

// Тип массива сообщений
const messageTypes: MessageType[] = [
	{ class: 'inform--success', message: 'Модуль детектора огня работает корректно' },
	{ class: 'inform--warning', message: 'Модуль детектора огня отключен' },
];

// Тип для результата вызова API
interface MockAPIResponse {
	error?: string;
	status?: number;
	data?: MessageType[];
}

// Мок-имитация API
const mockAPI = (endpoint: string): Promise<MockAPIResponse> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (endpoint === '/message-types') {
				resolve({ data: messageTypes });
			} else {
				reject({ error: 'Not Found', status: 404 });
			}
		}, 500);
	});
};

// Функция для получения данных
export const fetchData = async (endpoint: string): Promise<MessageType[]> => {
	try {
		const response = await mockAPI(endpoint);
		if (response.data) {
			return response.data;
		} else {
			throw new Error(`Ошибка: ${response.error || 'Неизвестная ошибка'}`);
		}
	} catch (error) {
		console.error(`Error fetching data from ${endpoint}:`, error);
		throw error;
	}
};
