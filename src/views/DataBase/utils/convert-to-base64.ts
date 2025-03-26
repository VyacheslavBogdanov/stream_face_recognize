export const urlToBase64 = async (fileInput: HTMLInputElement): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (fileInput.files.length === 0) {
			return reject(new Error('Файл не выбран'));
		}

		const file = fileInput.files[0];
		const reader = new FileReader();

		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Ошибка чтения файла'));

		reader.readAsDataURL(file);
	});
	// try {
	// 	const response = await fetch(imageUrl);
	// 	if (!response.ok)
	// 		throw new Error(`Не удалось загрузить изображение: ${response.statusText}`);
	// 	const blob = await response.blob();
	// 	return await new Promise((resolve, reject) => {
	// 		const reader = new FileReader();
	// 		reader.onloadend = () => resolve(reader.result as string);
	// 		reader.onerror = () => reject(new Error('Ошибка чтения файла'));
	// 		reader.readAsDataURL(blob);
	// 	});
	// } catch (error) {
	// 	console.error('Ошибка конвертации URL в base64:', error);
	// 	throw error;
	// }
};
