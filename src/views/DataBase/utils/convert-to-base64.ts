// export const urlToBase64 = async (fileInput: HTMLInputElement | string): Promise<string> => {
// 	if (typeof fileInput === 'string') {
// 		throw new Error('Ожидался HTMLInputElement, а получена строка');
// 	}

// 	return new Promise((resolve, reject) => {
// 		if (!fileInput.files || fileInput.files.length === 0) {
// 			return reject(new Error('Файл не выбран'));
// 		}

// 		const file = fileInput.files[0];
// 		const reader = new FileReader();

// 		reader.onloadend = () => resolve(reader.result as string);
// 		reader.onerror = () => reject(new Error('Ошибка чтения файла'));

// 		reader.readAsDataURL(file);
// 	});
// };

export const base64Image = (base64String: string) =>
	base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
