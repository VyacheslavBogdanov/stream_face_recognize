<template>
	<div class="database">
		<form class="database__form" @submit.prevent="addFace">
			<input
				v-model="newFace.name"
				type="text"
				placeholder="Имя субъекта"
				class="database__input"
				required
			/>
			<input
				v-model="newFace.photoUrl"
				type="url"
				placeholder="Ссылка на фото"
				class="database__input"
				required
			/>
			<button type="submit" class="database__button">Добавить</button>
		</form>

		<table class="database__table" v-if="faces.length">
			<thead>
				<tr>
					<th>ID</th>
					<th>Имя</th>
					<th>Фото</th>
					<th>Действия</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="face in faces" :key="face.id">
					<td>{{ face.id }}</td>
					<td>{{ face.name }}</td>
					<td>
						<img :src="face.photoUrl" :alt="face.name" class="database__photo" />
					</td>
					<td>
						<button @click="editFace(face)" class="database__button">✏️</button>
						<button
							@click="deleteFace(face.id)"
							class="database__button database__button--delete"
						>
							🗑
						</button>
					</td>
				</tr>
			</tbody>
		</table>

		<button
			v-if="faces.length"
			@click="clearDatabase"
			class="database__button database__button--danger"
		>
			Удалить все записи
		</button>

		<div v-if="editingFace" class="database__modal">
			<div class="database__modal-content">
				<h2>Редактирование</h2>
				<input v-model="editingFace.name" type="text" class="database__input" />
				<input v-model="editingFace.photoUrl" type="url" class="database__input" />
				<button @click="updateFace" class="database__button">Сохранить</button>
				<button @click="cancelEdit" class="database__button database__button--cancel">
					Отмена
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const URL = import.meta.env.VITE_SERVER_URL;
const SERVER = 'http://localhost:3003/people';

interface Face {
	id: string;
	name: string;
	photoUrl: string;
}

const faces = ref<Face[]>([]);
const newFace = ref<Face>({ id: '', name: '', photoUrl: '' });
const editingFace = ref<Face | null>(null);

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

const fetchFaces = async () => {
	// const requestId = uuidv4();

	// const requestBody = {
	// 	request_id: requestId,
	// };

	// try {
	// 	const response = await fetch(`${URL}/get_all_keys`, {
	// 		method: 'POST',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify(requestBody),
	// 	});
	// 	if (!response.ok) throw new Error('Ошибка загрузки базы');
	// 	console.log('get_all_keys', await response.json());
	// } catch (error) {
	// 	console.error(error);
	// }

	try {
		const response = await fetch(SERVER);
		if (!response.ok) throw new Error('Ошибка загрузки базы');
		faces.value = await response.json();
	} catch (error) {
		console.error(error);
	}
};

const addFace = async () => {
	if (!newFace.value.name || !newFace.value.photoUrl) return;

	const requestId = uuidv4();
	const faceId = uuidv4();

	try {
		const base64Image = await urlToBase64(newFace.value.photoUrl);
		const imageBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

		const requestBody = {
			request_id: requestId,
			id: faceId,
			image: imageBase64,
		};

		const response = await fetch(`${URL}/add_new_face`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody),
		});

		if (response.ok) {
			// faces.value.push({
			// 	id: faceId,
			// 	name: newFace.value.name,
			// 	photoUrl: newFace.value.photoUrl,
			// });
			// newFace.value = { id: '', name: '', photoUrl: '' };
			console.log('Ответ сервера:', await response.json());
		} else {
			const errorData = await response.json();
			console.error('Ошибка добавления:', errorData);
		}

		const DB = await fetch(SERVER, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: faceId,
				name: newFace.value.name,
				photoUrl: newFace.value.photoUrl,
			}),
		});
		faces.value = await DB.json();
	} catch (error) {
		console.error('Ошибка при добавлении:', error);
	}
};

const deleteFace = async (id: string) => {
	try {
		const requestBody = {
			request_id: uuidv4(),
			items: [id],
		};

		const response = await fetch(`${URL}/delete_face`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody),
		});

		if (response.ok) {
			faces.value = faces.value.filter((face) => face.id !== id);
		} else {
			console.error('Ошибка удаления:', await response.json());
		}
	} catch (error) {
		console.error('Ошибка удаления:', error);
	}
};

const clearDatabase = async () => {
	try {
		const requestBody = { request_id: uuidv4() };

		const response = await fetch(`${URL}/clear_db`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody),
		});

		if (response.ok) {
			faces.value = [];
		} else {
			console.error('Ошибка очистки:', await response.json());
		}
	} catch (error) {
		console.error('Ошибка очистки базы:', error);
	}
};

const editFace = (face: Face) => {
	editingFace.value = { ...face };
};

const updateFace = async () => {
	if (!editingFace.value) return;

	try {
		const requestBody = {
			request_id: uuidv4(),
			id: editingFace.value.id,
			name: editingFace.value.name,
			photoUrl: editingFace.value.photoUrl,
		};

		const response = await fetch(`${URL}/update_face`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody),
		});

		if (response.ok) {
			const index = faces.value.findIndex((face) => face.id === editingFace.value!.id);
			if (index !== -1) faces.value[index] = { ...editingFace.value };
			editingFace.value = null;
		} else {
			console.error('Ошибка обновления:', await response.json());
		}
	} catch (error) {
		console.error('Ошибка обновления:', error);
	}
};

const cancelEdit = () => {
	editingFace.value = null;
};

onMounted(fetchFaces);
</script>

<style lang="scss" scoped>
.database {
	max-width: 800px;
	margin: auto;
	text-align: center;

	&__form {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
	}

	&__input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	&__button {
		padding: 8px 12px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;

		&--delete {
			background-color: #dc3545;
		}

		&--danger {
			background-color: #ff0000;
			margin-top: 10px;
		}

		&--cancel {
			background-color: #6c757d;
		}
	}

	&__table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 20px;

		th,
		td {
			border: 1px solid #ccc;
			padding: 10px;
		}

		th {
			background-color: #f4f4f4;
		}
	}

	&__photo {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 5px;
	}

	&__modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;

		&-content {
			background: white;
			padding: 20px;
			border-radius: 5px;
			text-align: center;
		}
	}
}
</style>
