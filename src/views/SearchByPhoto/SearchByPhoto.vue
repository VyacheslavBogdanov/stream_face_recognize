<template>
	<div class="upload">
		<div v-if="isInvalidUrl" class="upload__error-message">
			<span>Неверный URL</span>
		</div>

		<div class="upload__url-container">
			<input
				v-model="imageUrl"
				type="url"
				placeholder="Введите URL изображения..."
				class="upload__url-input"
				:disabled="isDisabled"
				@input="onUrlChange"
			/>
			<button class="upload__clear-btn" @click="clearUpload" :disabled="isDisabled">
				🗑
			</button>
		</div>

		<div class="upload__image-group">
			<div
				class="upload__file-container"
				:class="{ 'upload__file-container-loaded': previewImage }"
			>
				<div class="upload__file">
					<span v-if="!previewImage" class="upload__file-placeholder">
						Загрузить изображение
					</span>
					<input
						type="file"
						@change="onFileChange"
						accept="image/*"
						class="upload__file-input"
						:disabled="isDisabled"
					/>
					<img
						v-if="previewImage"
						:src="previewImage"
						class="upload__file-preview"
						@error="handleImageError"
					/>
				</div>
			</div>

			<div
				class="upload__result-container"
				v-if="foundPeople.length"
				:class="{ 'upload__result-container-loaded': previewImage }"
			>
				<div class="upload__result">
					<img
						ref="imageElement"
						:src="foundPeople[0]?.photoUrl"
						class="upload__result-image"
						@error="handleImageError"
						@load="updateBoundingBoxes"
					/>

					<div
						v-for="(bbox, index) in scaledBboxes"
						:key="index"
						class="upload__bbox"
						:style="{
							top: bbox.top + 'px',
							left: bbox.left + 'px',
							width: bbox.width + 'px',
							height: bbox.height + 'px',
						}"
					></div>
				</div>
			</div>
		</div>

		<table v-if="foundPeople.length" class="upload__table">
			<thead class="upload__table-head">
				<tr>
					<th>ID</th>
					<th>Имя</th>
				</tr>
			</thead>
			<tbody class="upload__table-body">
				<tr v-for="person in foundPeople" :key="person.id">
					<td>{{ person.id }}</td>
					<td>{{ person.name }}</td>
				</tr>
			</tbody>
		</table>

		<button type="submit" class="upload__button" :disabled="isDisabled" @click="searchFaces">
			<span class="upload__button-text">Поиск</span>
		</button>
		<div v-if="errorMessage" :class="['upload__error-msg', errorMessage.class]">
			<div class="upload__icon">ⓘ</div>
			<span>{{ errorMessage.message }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { MessageType } from '../../components/utils/types';

const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();
const errorMessage = ref<{ class: string; message: string } | null>(null);
const imageUrl = ref<string>('');
const selectedFile = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const isInvalidUrl = ref<boolean>(false);
const foundPeople = ref<{ id: string; name: string; photoUrl: string; bbox?: number[] }[]>([]);
const scaledBboxes = ref<{ left: number; top: number; width: number; height: number }[]>([]);
const imageElement = ref<HTMLImageElement | null>(null);

const isDisabled = computed(() => props.status === 'inactive');

const updateBoundingBoxes = () => {
	if (!imageElement.value || foundPeople.value.length === 0 || !foundPeople.value[0].bbox) return;

	const img = imageElement.value;
	const scaleX = img.clientWidth / img.naturalWidth;
	const scaleY = img.clientHeight / img.naturalHeight;
	const [x, y, width, height] = foundPeople.value[0].bbox;

	scaledBboxes.value = [
		{
			left: x * scaleX,
			top: y * scaleY,
			width: width * scaleX,
			height: height * scaleY,
		},
	];
};

const onFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (!target.files?.[0]) return;

	selectedFile.value = target.files[0];
	imageUrl.value = '';
	isInvalidUrl.value = false;

	const reader = new FileReader();
	reader.onload = () => {
		previewImage.value = reader.result as string;
	};
	reader.readAsDataURL(target.files[0]);
};

const onUrlChange = async () => {
	if (!imageUrl.value) return clearUpload();

	try {
		const response = await fetch(imageUrl.value);
		if (!response.ok) throw new Error();

		const blob = await response.blob();
		const reader = new FileReader();
		reader.onload = () => (previewImage.value = reader.result as string);
		reader.readAsDataURL(blob);

		isInvalidUrl.value = false;
	} catch {
		clearUpload();
		isInvalidUrl.value = true;
	}
};

const handleImageError = () => {
	isInvalidUrl.value = true;
	previewImage.value = null;
};

const clearUpload = () => {
	imageUrl.value = '';
	selectedFile.value = null;
	previewImage.value = null;
	isInvalidUrl.value = false;
	foundPeople.value = [];
	errorMessage.value = null;
};

const Base64Image = (base64String: string) =>
	base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

const searchFaces = async () => {
	if (previewImage.value) {
		await sendRecognitionRequest(previewImage.value);
		return;
	}

	if (selectedFile.value) {
		const reader = new FileReader();
		reader.onloadend = async () => {
			previewImage.value = reader.result as string;
			await sendRecognitionRequest(reader.result as string);
		};
		reader.readAsDataURL(selectedFile.value);
	}
};
const sendRecognitionRequest = async (base64Image: string) => {
	const imageBase64 = Base64Image(base64Image);

	const response = await fetch(`${HOST}/recognize_many`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			request_id: uuidv4(),
			rec_threshold: 1,
			image: imageBase64,
		}),
	});

	if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);
	const data = await response.json();

	foundPeople.value = [];

	if (data.detected_faces?.length > 0) {
		for (const face of data.detected_faces) {
			const person = await getPersonById(face.id);
			if (person) {
				foundPeople.value.push({ ...person, bbox: face.bbox });
			}
		}
	}
};

const getPersonById = async (id: string) => {
	try {
		const response = await fetch(DB);
		if (!response.ok) throw new Error(`Ошибка загрузки данных для ID: ${id}`);

		const dbData: { id: string; name: string; photoUrl: string }[] = await response.json();
		const person = dbData.find((p) => p.id === id);

		if (!person) {
			errorMessage.value = {
				message: props.messageTypes.find((msg) => msg.class === 'search-error')
					?.message as string,
				class: 'upload__error-msg--error',
			};
			foundPeople.value = [];
			return null;
		}
		return person;
	} catch (error) {
		console.error(error);
		errorMessage.value = {
			message: 'Ошибка при загрузке данных',
			class: 'upload__error-msg--error',
		};
		return null;
	}
};
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';

.upload {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 30px;
}
.upload__error-message {
	position: absolute;
	top: 10px;
	left: 50%;
	transform: translateX(-50%);
	width: 100%;
	text-align: center;
	color: $color-error;
}

.upload__url-input {
	width: 500px;
	height: 20px;
	padding: 8px 40px 8px 12px;
	border: $border-width solid #513d3d;
	border-radius: 8px;
	outline: none;
	text-align: center;
	transition: border-color 0.2s ease;
	background-color: #f8f8f8;

	&:focus {
		border-color: $border-color;
	}

	&::placeholder {
		color: #333;
	}

	&:hover {
		border-color: $border-color;
	}
}
.upload__url-container {
	width: 500px;
	display: flex;
	justify-content: center;
	margin-bottom: 10px;
	position: relative;
}

.upload__clear-btn {
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	cursor: pointer;
	font-size: 15px;
	color: #513d3d;
}

.upload__error-msg {
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px 30px 10px 40px;
	border-radius: $border-radius;
	font-size: 23px;
	height: 40px;
	max-width: fit-content;
	margin: auto;
	bottom: 7.5px;

	&--error {
		background: #f2dee0;
		color: $color-error;
	}
	.upload__icon {
		position: absolute;
		left: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
	}
}

.upload__image-group {
	display: flex;
	gap: 20px;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.upload__file-container {
	width: 500px;
	height: 500px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: $border-width solid #513d3d;
	border-radius: 8px;
	background-color: #f8f8f8;
	text-align: center;
	position: relative;
	overflow: hidden;
	cursor: pointer;
	transition: border-color 0.2s ease;

	&:hover {
		border-color: $border-color;
	}
	&.upload__file-container-loaded {
		border: none;
	}
}

.upload__file-input {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	cursor: pointer;
	z-index: 2;
}
.upload__result-container {
	width: 500px;
	height: 500px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: $border-width solid #513d3d;
	border-radius: 10px;
	background-color: #f8f8f8;
	text-align: center;
	position: relative;
	overflow: hidden;

	&.upload__result-container-loaded {
		border: none;
	}
}

.upload__file-preview,
.upload__result-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	position: absolute;
	top: 0;
	left: 0;
}

//BBOX

.upload__bbox {
	position: absolute;
	border: $border-width solid red;
	box-sizing: border-box;
}

//Кнопка Поиска

.upload__button {
	width: 250px;
	position: relative;
	height: 50px;
	padding: 0 30px;
	color: #513d3d;
	border: $border-width solid #513d3d;
	background-color: $color-bg;
	border-radius: $border-radius;
	user-select: none;
	white-space: nowrap;
	transition: all 0.05s linear;
	font-family: inherit;
	margin: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
	margin-bottom: 20px;

	&:hover {
		cursor: pointer;
		border-color: $border-color;
		color: $border-color;

		&:before {
			height: calc(100% - 32px);
			top: 16px;
		}

		&:after {
			width: calc(100% - 32px);
			left: 16px;
		}
	}

	&:active {
		transform: scale(0.97);
	}

	&:disabled {
		cursor: not-allowed;
		background-color: #ededed;
		border-color: #929191;
		color: #a0a0a0;

		transition: none;
	}

	.upload__button-text {
		font-size: 18px;
		z-index: 3;
		position: relative;
		font-weight: 500;
	}
}
//Таблица
.upload__table {
	width: 500px;
	border-collapse: collapse;
	margin-top: 20px;
	background: #ffffff;
	box-shadow:
		0px 3px 8px -6px rgba(24, 39, 75, 0.05),
		0px 10px 36px -4px rgba(17, 24, 41, 0.1);
}

.upload__table th,
.upload__table td {
	height: 30px;
	border: 1px solid #ccc;
	padding: 5px;
	text-align: center;
	vertical-align: middle;
}

.upload__table-head {
	background-color: #f0f0f0;
	font-size: 15px;
}

.upload__table-body tr:hover {
	background-color: #f9f9f9;
}
</style>
