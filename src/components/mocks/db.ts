import type { MessageType, MockAPIResponse } from '../utils/types';

export const messageTypes: MessageType[] = [
	{ class: 'health--success', message: 'Детектор работает корректно' },
	{ class: 'health--warning', message: 'Обнаружен сбой детектора' },
	{ class: 'error-server', message: 'Ошибка при запросе' },
	{ class: 'compare--photo', message: 'Загрузите оба изображения' },
	{ class: 'compare--info', message: 'Загрузите оба изображения' },
	{ class: 'compare--error', message: 'На одной из фотографий лиц не обнаружено' },
	{ class: 'compare--fake-face', message: 'Попытка обмана системы' },
	{ class: 'compare--success', message: 'Скорее всего, это один и тот же человек' },
	{ class: 'compare--warning', message: 'Это разные люди' },
	{ class: 'compare--validation-error', message: 'Ошибка валидации, 422'},
	{ class: 'search-error', message:'Данного человека в базе нет'}
];

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
