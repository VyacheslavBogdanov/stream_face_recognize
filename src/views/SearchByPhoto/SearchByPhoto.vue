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
			<div class="upload__file-container">
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

			<div class="upload__result-container" v-if="foundPeople.length">
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
		<div v-if="errorMessage.message" :class="['upload__error-msg', errorMessage.class]">
			<span>{{ errorMessage.message }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { MessageType } from '../../components/mocks/db';

const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();
const errorMessage = ref<{ message: string; class: string }>({ message: '', class: '' });
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
	errorMessage.value = { message: '', class: '' };
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
				message: props.messageTypes.find((msg) => msg.class === 'search-error')?.message,
				class: 'upload__error-msg-error',
			};

			foundPeople.value = [];
			return null;
		}

		return person;
	} catch (error) {
		console.error(error);
		errorMessage.value = {
			message: 'Ошибка при загрузке данных',
			class: 'upload__error-msg',
		};
		return null;
	}
};
</script>

<style lang="scss" scoped>
@import '../../styles/main.scss';
// @import '../ComparisonOfTwoPhotos/Style/UploadStyle.scss';

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
	border: 2px solid #513d3d;
	border-radius: 10px;
	background-color: #f8f8f8;
	text-align: center;
	position: relative;
	cursor: pointer;
	overflow: hidden;
	transition: border-color 0.2s ease;
}
.upload__result-container {
	width: 500px;
	height: 500px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 2px solid #513d3d;
	border-radius: 10px;
	background-color: #f8f8f8;
	text-align: center;
	position: relative;
	cursor: pointer;
	overflow: hidden;
	transition: border-color 0.2s ease;
}

.upload__file-preview,
.upload__result-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.upload__url-container {
	position: relative;
	width: 100%;
	height: 20px;
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}

.upload__url-input {
	width: 500px;
	height: 100%;
	padding: 8px 40px 8px 12px;
	border: $border-width solid #513d3d;
	border-radius: $border-radius;
	outline: none;
	text-align: center;
	transition: border-color 0.2s ease;
	background-color: $color-bg;
	justify-content: center;

	&:focus {
		border-color: $border-color;
	}

	&::placeholder {
		color: #333;

		&:hover {
			border-color: $border-color;
		}

		&:disabled {
			background-color: #f2f2f2;
			border-color: #ccc;
			color: #aaa;
			cursor: not-allowed;
			pointer-events: none;
		}
		&:disabled::placeholder {
			color: #aaa;
		}
	}
	.upload__clear-btn {
		position: absolute;
		right: 10px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 15px;
		top: 50%;
		transform: translateY(-50%);

		&:disabled {
			pointer-events: none;
			opacity: 0.5;
		}
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

	.upload__image-group {
		display: flex;
		gap: 20px;
		align-items: center;
		justify-content: center;
		width: 1000px;
	}

	.upload {
		display: flex;
	}

	.upload__file-container {
		width: 100%;
		height: 500px;
		display: flex;
		justify-content: center;
		align-items: center;
		border: $border-width solid #513d3d;
		border-radius: $border-radius;
		background-color: $color-bg;
		text-align: center;
		position: relative;
		cursor: pointer;
		overflow: hidden;
		transition: border-color 0.2s ease;

		.upload__result-container {
			width: 100%;
			height: 500px;
			display: flex;
			justify-content: center;
			align-items: center;
			border: $border-width solid #513d3d;
			border-radius: $border-radius;
			background-color: $color-bg;
			text-align: center;
			position: relative;
			cursor: pointer;
			overflow: hidden;
			transition: border-color 0.2s ease;
		}
		.upload__file-input {
			opacity: 0;
			position: absolute;
			width: 100%;
			height: 100%;
			cursor: pointer;
			z-index: 2;
			box-sizing: border-box;
		}

		&:disabled {
			cursor: not-allowed;
			background-color: #f2f2f2;
			border-color: #ccc;
			pointer-events: none;
		}
	}

	.upload__file-placeholder {
		position: absolute;
		color: #333;
		font-size: 16px;

		&:disabled {
			color: #aaa;
		}
	}

	.upload__file-preview,
	.upload__result-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.upload__bbox {
		position: absolute;
		border: 1.5px solid red;
		box-sizing: border-box;
	}

	.upload__table {
		width: 100%;
		margin-top: 20px;
		border-collapse: collapse;
	}

	.upload__table th,
	.upload__table td {
		border: 1px solid #513d3d;
		padding: 8px;
		text-align: center;
	}

	.upload__table-head {
		background-color: #f0f0f0;
	}

	.upload__table-body tr:hover {
		background-color: #f9f9f9;
	}
}
</style>
