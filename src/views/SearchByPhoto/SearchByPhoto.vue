<template>
	<div class="photo-search">
		<h1 class="photo-search__title">Поиск по фото</h1>

		<form class="photo-search__form" @submit.prevent="searchFaces">
			<div class="photo-search__input-group">
				<label class="photo-search__label">
					Загрузите файл:
					<input
						type="file"
						@change="handleFileUpload"
						accept="image/*"
						class="photo-search__input"
					/>
				</label>

				<label class="photo-search__label">
					Или укажите URL:
					<input
						v-model="imageUrl"
						type="url"
						placeholder="Введите URL"
						class="photo-search__input"
					/>
				</label>
			</div>

			<div v-if="previewImage" class="photo-search__preview">
				<p>Предпросмотр:</p>
				<img
					:src="previewImage"
					alt="Загруженное изображение"
					class="photo-search__preview-image"
				/>
			</div>

			<button type="submit" class="photo-search__button" :disabled="!canSearch">Поиск</button>
		</form>

		<section v-if="foundImageUrl" class="photo-search__results">
			<h2 class="photo-search__subtitle">Результаты поиска:</h2>
			<div class="photo-search__found">
				<img :src="foundImageUrl" alt="Найденное изображение" class="photo-search__image" />
				<p>Найденное изображение</p>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const imageUrl = ref<string>('');
const selectedFile = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const foundImageUrl = ref<string | null>(null);

const canSearch = computed(() => !!selectedFile.value || !!imageUrl.value);

const handleFileUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files[0]) {
		const file = target.files[0];
		selectedFile.value = file;
		imageUrl.value = '';

		const reader = new FileReader();
		reader.onload = () => {
			previewImage.value = reader.result as string;
		};
		reader.readAsDataURL(file);
	}
};

const urlToBase64 = async (imageUrl: string): Promise<string> => {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok)
			throw new Error(`Не удалось загрузить изображение: ${response.statusText}`);
		const blob = await response.blob();

		return await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error('Ошибка чтения файла'));
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error('Ошибка конвертации URL в base64:', error);
		throw error;
	}
};

const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Ошибка чтения файла'));
		reader.readAsDataURL(file);
	});
};

const searchFaces = async () => {
	try {
		if (!canSearch.value) return;

		let base64Image = '';
		if (selectedFile.value) {
			base64Image = await fileToBase64(selectedFile.value);
		} else if (imageUrl.value) {
			base64Image = await urlToBase64(imageUrl.value);
		}

		const imageBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

		const requestBody = {
			request_id: uuidv4(),
			rec_threshold: 1,
			image: imageBase64,
		};

		const response = await fetch(`${HOST}/recognize_many`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody),
		});

		const data = await response.json();

		if (data.detected_faces && data.detected_faces.length > 0) {
			const foundId = data.detected_faces[0].id;
			foundImageUrl.value = `${DB}/${foundId}.jpg`;
		} else {
			foundImageUrl.value = null;
		}
	} catch (error) {
		console.error('Ошибка при поиске:', error);
	}
};
</script>

<style lang="scss" scoped>
.photo-search {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;

	&__title {
		font-size: 2rem;
		margin-bottom: 20px;
	}

	&__form {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		max-width: 500px;
		margin-bottom: 30px;
	}

	&__input-group {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-bottom: 15px;
	}

	&__label {
		font-weight: 600;
		margin-bottom: 10px;
	}

	&__input {
		width: 100%;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
	}

	&__button {
		padding: 10px 20px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.3s;

		&:hover:not(:disabled) {
			background-color: #0056b3;
		}

		&:disabled {
			background-color: #a0a0a0;
			cursor: not-allowed;
		}
	}

	&__preview {
		margin-bottom: 15px;
		text-align: center;

		&-image {
			max-width: 100%;
			max-height: 200px;
			border-radius: 6px;
			margin-top: 10px;
		}
	}

	&__results {
		width: 100%;
		max-width: 500px;
		text-align: center;
	}

	&__subtitle {
		font-size: 1.5rem;
		margin-bottom: 15px;
	}

	&__found {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	&__image {
		width: 100%;
		max-width: 300px;
		height: auto;
		object-fit: cover;
		border-radius: 6px;
		margin-top: 10px;
	}
}
</style>
