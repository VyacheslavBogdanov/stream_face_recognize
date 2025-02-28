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

			<button type="submit" class="photo-search__button" :disabled="!canSearch">Поиск</button>
		</form>

		<section v-if="results.length" class="photo-search__results">
			<h2 class="photo-search__subtitle">Результаты поиска:</h2>
			<ul class="photo-search__list">
				<li v-for="result in results" :key="result.id" class="photo-search__item">
					<img :src="result.photoUrl" :alt="result.name" class="photo-search__image" />
					<div class="photo-search__info">
						<p class="photo-search__name">{{ result.name }}</p>
						<p class="photo-search__similarity">
							Похожесть: {{ result.similarity.toFixed(2) }}%
						</p>
					</div>
				</li>
			</ul>
		</section>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

interface SearchResult {
	id: string;
	name: string;
	photoUrl: string;
	similarity: number;
}

const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const imageUrl = ref<string>('');
const selectedFile = ref<File | null>(null);
const results = ref<SearchResult[]>([]);

const canSearch = computed(() => !!selectedFile.value || !!imageUrl.value);

const handleFileUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files[0]) {
		selectedFile.value = target.files[0];
		imageUrl.value = '';
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

const fetchFacesFromDB = async (): Promise<SearchResult[]> => {
	const response = await fetch(HOST);
	if (!response.ok) throw new Error('Ошибка загрузки базы данных');
	return response.json();
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

		const response = await fetch('http://81.94.156.176:5511/recognize_many', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody),
		});

		console.log('response', response);

		// if (!response.ok) throw new Error('Ошибка при поиске лиц');
		// const { matched_ids }: { matched_ids: { id: string; similarity: number }[] } =
		// 	await response.json();

		// if (!matched_ids.length) {
		// 	results.value = [];
		// 	alert('Совпадения не найдены');
		// 	return;
		// }

		// const facesDB = await fetchFacesFromDB();
		// results.value = matched_ids
		// 	.map(({ id, similarity }) => {
		// 		const face = facesDB.find((item) => item.id === id);
		// 		return face ? { ...face, similarity: similarity * 100 } : null;
		// 	})
		// 	.filter(Boolean) as SearchResult[];
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

	&__results {
		width: 100%;
		max-width: 800px;
	}

	&__subtitle {
		font-size: 1.5rem;
		margin-bottom: 15px;
		text-align: center;
	}

	&__list {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}

	&__item {
		background-color: #f9f9f9;
		padding: 15px;
		border-radius: 8px;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	&__image {
		width: 100%;
		height: auto;
		max-height: 200px;
		object-fit: cover;
		border-radius: 6px;
		margin-bottom: 10px;
	}

	&__info {
		font-size: 1rem;
	}

	&__name {
		font-weight: 600;
		margin-bottom: 5px;
	}

	&__similarity {
		color: #555;
	}
}
</style>
