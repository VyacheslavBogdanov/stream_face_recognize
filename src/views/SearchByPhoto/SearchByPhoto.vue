<!-- <template>
	<div class="middle-elements">
		<FileUpload @fileSelected="updateImage" @fileUrl="updateImageSrc" :status="props.status" />
		<FireDetectionBtn
			v-if="imageSrc"
			@sendRequest="sendRequest"
			@clearPreview="clearPreview"
			:status="props.status"
			:fireRects="fireRects"
		/>
	</div>
	<div v-if="imageSrc" class="preview">
		<img ref="imageElement" class="preview__img" :src="imageSrc" alt="Изображение" />
		<div
			v-for="(rect, index) in fireRects"
			:key="index"
			class="preview__rect"
			:style="{
				top: rect.top + 'px',
				left: rect.left + 'px',
				width: rect.width + 'px',
				height: rect.height + 'px',
			}"
		>
			<div
				v-if="rect.confidence !== null"
				class="preview__confidence"
				:style="{
					top: '-3px',
					left: '0',
				}"
			>
				{{ rect.confidence }}%
			</div>
		</div>
	</div>
	<div v-if="result?.type" :class="['result', resultClass]">
		<div class="result__icon">ⓘ</div>
		<span>{{ message }}</span>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import FileUpload from './FileUpload/FileUpload.vue';
import FireDetectionBtn from './FireDetectionBtn/FireDetectionBtn.vue';
import type { MessageType } from '../utils/types';

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();

const imageSrc = ref<string | null>(null);
const result = ref<{ type: string } | null>(null);
const fireRects = ref<
	{ top: number; left: number; width: number; height: number; confidence: number | null }[]
>([]);
const imageBase64 = ref<string | null>(null);
const imageElement = ref<HTMLImageElement | null>(null);

const message = computed(() => {
	if (result.value?.type === 'fire') {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--fire');
		return newArr.length > 0 ? newArr[0].message : 'Статус огня не определен';
	} else {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--no-fire');
		return newArr.length > 0 ? newArr[0].message : 'Статус огня не определен';
	}
});

const resultClass = computed(() => {
	if (result.value?.type === 'fire') {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--fire');
		return newArr.length > 0 ? newArr[0].class : 'result--info';
	} else {
		const newArr = props.messageTypes.filter((type) => type.class === 'result--no-fire');
		return newArr.length > 0 ? newArr[0].class : 'result--info';
	}
});

const updateImage = (base64: string) => {
	imageBase64.value = base64;
};

const updateImageSrc = (url: string) => {
	imageSrc.value = url;
};

const clearPreview = () => {
	fireRects.value = [];
	result.value = null;
};

const sendRequest = async () => {
	if (!imageBase64.value) {
		console.error('Изображение не выбрано');
		return;
	}

	const base64Image = imageBase64.value.replace(/^data:image\/[a-z]+;base64,/, '');

	const requestId = uuidv4();
	const Url = import.meta.env.VITE_SERVER_URL;

	try {
		const response = await fetch(`${Url}/predict`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				thresholds: [
					{
						move_confidence: 0.2,
						move_velocity: 0.3,
						static_confidence: 0.7,
						type: 'person',
					},
					{
						move_confidence: 0.2,
						move_velocity: 0.3,
						static_confidence: 0.7,
						type: 'vehicle',
					},
				],
				sabotage_threshold: 22,
				requestId: requestId,
				image: base64Image,
			}),
		});

		if (!response.ok) {
			throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Ответ от сервера:', data);

		const fireObjects = data.objects.filter((obj: any) => obj.type === 'fire');

		if (fireObjects.length > 0) {
			result.value = { type: 'fire' };
			const img = imageElement.value;

			if (img) {
				const scaleX = img.clientWidth / img.naturalWidth;
				const scaleY = img.clientHeight / img.naturalHeight;

				fireRects.value = fireObjects.map((fireObject: any) => {
					const [x, y, w, h] = fireObject.rect;
					return {
						left: x * scaleX,
						top: y * scaleY,
						width: w * scaleX,
						height: h * scaleY,
						confidence: Math.round(fireObject.confidence * 100),
					};
				});
			}
		} else {
			result.value = { type: 'no_fire' };
			fireRects.value = [];
		}
	} catch (error) {
		console.error('Ошибка при запросе:', error);
		result.value = { type: 'no_fire' };
		fireRects.value = [];
	}
};

watch(imageSrc, () => {
	clearPreview();
});
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';

.middle-elements {
	height: 50px;
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 40px 0 40px 0;

	@media (max-width: 1250px) {
		flex-direction: column;
		height: 110px;
	}
}

.preview {
	max-width: 740px;
	height: 400px;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	overflow: hidden;
	border: 1px solid #ddd;
	border-radius: $border-radius;

	&__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	&__rect {
		position: absolute;
		border: 2px solid red;
		box-sizing: border-box;
	}

	&__confidence {
		position: absolute;
		text-align: center;
		font-size: 12px;
		background: rgba(255, 255, 255, 0.8);
		color: red;
		padding: 2px 4px;
		border-radius: 4px;
		transform: translateY(-100%);
	}
}

.result {
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px 30px 10px 40px;
	border-radius: $border-radius;
	max-width: fit-content;
	word-wrap: break-word;
	font-size: 23px;
	height: 40px;
	opacity: 0.85;
	margin: 20px 0;

	@media (max-width: 835px) {
		font-size: 17px;
	}

	&__icon {
		display: flex;
		position: absolute;
		transform: rotate(180deg);
		left: 10px;
		height: 30px;
	}

	&--fire {
		background-color: #e0fde7;
		color: $color-success;
	}

	&--no-fire {
		background-color: #f2dee0;
		color: $color-error;
	}

	&--info {
		background-color: #e3e3ff;
		color: $color-primary;
	}
}
</style> -->

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
						placeholder="https://example.com/photo.jpg"
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

const API_URL = import.meta.env.VITE_SERVER_URL;
const DB_URL = 'http://localhost:3003/people';

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

const urlToBase64 = async (url: string): Promise<string> => {
	const response = await fetch(url);
	if (!response.ok) throw new Error('Не удалось загрузить изображение по URL');
	const blob = await response.blob();
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Ошибка чтения файла'));
		reader.readAsDataURL(blob);
	});
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
	const response = await fetch(DB_URL);
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

		if (!response.ok) throw new Error('Ошибка при поиске лиц');
		const { matched_ids }: { matched_ids: { id: string; similarity: number }[] } =
			await response.json();

		if (!matched_ids.length) {
			results.value = [];
			alert('Совпадения не найдены');
			return;
		}

		const facesDB = await fetchFacesFromDB();
		results.value = matched_ids
			.map(({ id, similarity }) => {
				const face = facesDB.find((item) => item.id === id);
				return face ? { ...face, similarity: similarity * 100 } : null;
			})
			.filter(Boolean) as SearchResult[];
	} catch (error) {
		console.error('Ошибка при поиске:', error);
		alert('Произошла ошибка при поиске. Пожалуйста, попробуйте снова.');
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
