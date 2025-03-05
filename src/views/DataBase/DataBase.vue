<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { Face } from '../../components/utils/types.ts';

const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const faces = ref<Face[]>([]);
const newFace = ref<Face>({ id: '', name: '', photoUrl: '' });
const vectors = ref<string[]>([]);

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
	try {
		const response = await fetch(`${HOST}/get_all_keys`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				request_id: uuidv4(),
			}),
		});
		if (!response.ok) throw new Error('Ошибка получения ключей');
		const allKeys = await response.json();
		console.log('allKeys', allKeys);

		vectors.value = allKeys.result;
		console.log('vectors.value', vectors.value);

		const db = await fetch(DB);
		if (!db.ok) throw new Error('Ошибка загрузки базы данных');
		faces.value = await db.json();
		console.log('faces.value', faces.value);
	} catch (error) {
		console.error(error);
	}
};

const addFace = async () => {
	if (!newFace.value.name || !newFace.value.photoUrl) return;
	const id = uuidv4();
	try {
		const base64Image = await urlToBase64(newFace.value.photoUrl);
		const imageBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

		const response = await fetch(`${HOST}/add_new_face`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				request_id: uuidv4(),
				id: id,
				image: imageBase64,
			}),
		});
		if (!response.ok) throw new Error('Ошибка добавления вектора');

		const db = await fetch(DB, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: id,
				name: newFace.value.name,
				photoUrl: newFace.value.photoUrl,
			}),
		});
		if (!db.ok) throw new Error('Ошибка добавления объекта в базу данных');
		faces.value = await db.json();
		newFace.value = { id: '', name: '', photoUrl: '' };
		fetchFaces();
	} catch (error) {
		console.error(error);
	}
};

const deleteFace = async (id: string) => {
	try {
		const response = await fetch(`${HOST}/delete_face`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ request_id: uuidv4(), items: [id] }),
		});
		if (!response.ok) throw new Error('Ошибка удаления вектора');

		const db = await fetch(`${DB}/${id}`, {
			method: 'DELETE',
		});
		if (!db.ok) throw new Error('Ошибка удаления объекта из базы данных');
		faces.value = faces.value.filter((face) => face.id !== id);
		fetchFaces();
	} catch (error) {
		console.error(error);
	}
};

const clearDatabase = async () => {
	try {
		const response = await fetch(`${HOST}/clear_db`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ request_id: uuidv4() }),
		});
		if (!response.ok) throw new Error('Ошибка очистки базы векторов');

		await Promise.all(
			faces.value.map((face) =>
				fetch(`${DB}/${face.id}`, {
					method: 'DELETE',
				}),
			),
		);
		faces.value = [];
		fetchFaces();
	} catch (error) {
		console.error(error);
	}
};

const syncDB = async () => {
	if (vectors.value.length === faces.value.length) return;
	const faceIds = faces.value.map((face) => face.id);
	const vectorIds = new Set(vectors.value);

	if (vectors.value.length < faces.value.length) {
		try {
			await Promise.all(
				faces.value
					.filter((face) => !vectorIds.has(face.id))
					.map(async (face) => {
						const base64Image = await urlToBase64(face.photoUrl);
						const imageBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

						return fetch(`${HOST}/add_new_face`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								request_id: uuidv4(),
								id: face.id,
								image: imageBase64,
							}),
						});
					}),
			);
		} catch (error) {
			console.error(error);
		}
	} else {
		const extraVectors = vectors.value.filter((id) => !faceIds.includes(id));
		try {
			await Promise.all(
				extraVectors.map(async (id) => {
					return fetch(`${HOST}/delete_face`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							request_id: uuidv4(),
							items: [id],
						}),
					});
				}),
			);
		} catch (error) {
			console.error(error);
		}
	}
	fetchFaces();
};

onMounted(fetchFaces);
</script>

<template>
	<div class="database">
		<div class="menu">
			<div class="menu__item">Векторов в БД: {{ vectors.length }}</div>
			<div class="menu__item">Объектов в локальной БД: {{ faces.length }}</div>
			<div class="menu__sync" @click="syncDB">Синхронизация локальной БД и БД</div>
		</div>
		<form class="database__form" @submit.prevent="addFace">
			<input
				v-model="newFace.name"
				type="text"
				placeholder="Введите имя"
				class="database__input"
				required
			/>
			<input
				v-model="newFace.photoUrl"
				type="url"
				placeholder="Введите URL изображения"
				class="database__input"
				required
			/>
			<button type="submit" class="database__button">Добавить в БД</button>
		</form>
		<table class="database__table" v-if="faces.length">
			<thead class="database__thead">
				<tr>
					<th class="dtabase__th">ID</th>
					<th class="dtabase__th">Имя</th>
					<th class="dtabase__th">Фото</th>
					<th class="dtabase__th">Действия</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="face in faces" :key="face.id">
					<td class="dtabase__td">{{ face.id }}</td>
					<td class="dtabase__td">{{ face.name }}</td>
					<td class="dtabase__td">
						<img :src="face.photoUrl" :alt="face.name" class="database__photo" />
					</td>
					<td class="dtabase__td">
						<button
							@click="deleteFace(face.id)"
							class="database__button database__button--delete"
						>
							Удалить
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<div v-else>В базе данных нет объектов</div>
		<button
			v-if="faces.length"
			@click="clearDatabase"
			class="database__button database__button--danger"
		>
			Удалить все из БД
		</button>
	</div>
</template>

<style lang="scss" scoped>
.menu {
	display: flex;
	margin: 10px;
	padding: 10px;
	border: 1px solid #030000;
	justify-content: space-between;
	flex-direction: row;
	align-items: center;

	&__item {
		border: 1px solid #060887;
		padding: 10px;
	}

	&__sync {
		border: 1px solid #060887;
		padding: 10px;
		cursor: pointer;
	}
}
.database {
	width: 70%;
	margin: 55px;
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
	}

	&__table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 20px;
		background: #ffffff;
		box-shadow:
			0px 3px 8px -6px rgba(24, 39, 75, 0.05),
			0px 10px 36px -4px rgba(17, 24, 41, 0.1);

		th,
		td {
			border: 1px solid #ccc;
			padding: 5px;
		}

		th {
			background: #ffffff;
			box-shadow:
				0px 3px 8px -30px rgba(24, 39, 75, 0.05),
				0px 10px 70px -4px rgba(17, 24, 41, 0.1);
			padding: 25px;
		}
	}

	&__photo {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 5px;
	}
}
</style>
