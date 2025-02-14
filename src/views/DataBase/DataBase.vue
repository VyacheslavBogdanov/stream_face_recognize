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

		<table class="database__table">
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
					<td><img :src="face.photoUrl" :alt="face.name" class="database__photo" /></td>
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

		<button @click="clearDatabase" class="database__button database__button--danger">
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

interface Face {
	id: number;
	name: string;
	photoUrl: string;
}

const faces = ref<Face[]>([
	{
		id: 7,
		name: 'Птица',
		photoUrl:
			'https://png.pngtree.com/thumb_back/fw800/background/20230610/pngtree-picture-of-a-blue-bird-on-a-black-background-image_2937385.jpg',
	},
	{
		id: 5,
		name: 'Природа',
		photoUrl: 'https://cs5.pikabu.ru/post_img/big/2015/06/04/11/1433446202_1725992411.jpg',
	},
	{
		id: 11,
		name: 'Цветок',
		photoUrl:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLFK4Si0QvGwxI7yaoLAfW4Hk74juMhKMFRg&s',
	},
]);
const newFace = ref<Face>({ id: 0, name: '', photoUrl: '' });
const editingFace = ref<Face | null>(null);

const fetchFaces = async () => {
	try {
		const response = await fetch('/api/get_faces');
		faces.value = await response.json();
	} catch (error) {
		console.error('Ошибка загрузки базы:', error);
	}
};

const addFace = async () => {
	// if (!newFace.value.name || !newFace.value.photoUrl) return;
	// try {
	// 	await fetch('/api/add_new_face', {
	// 		method: 'POST',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify(newFace.value),
	// 	});
	// 	fetchFaces();

	newFace.value = { id: 0, name: '', photoUrl: '' };
	// } catch (error) {
	// 	console.error('Ошибка добавления:', error);
	// }
};

const deleteFace = async (id: number) => {
	try {
		await fetch(`/api/delete_face/${id}`, { method: 'DELETE' });
		fetchFaces();
	} catch (error) {
		console.error('Ошибка удаления:', error);
	}
};

const clearDatabase = async () => {
	try {
		await fetch('/api/clear_db', { method: 'DELETE' });
		faces.value = [];
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
		await fetch(`/api/update_face/${editingFace.value.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(editingFace.value),
		});
		editingFace.value = null;
		fetchFaces();
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

	&__title {
		font-size: 24px;
		margin-bottom: 20px;
	}

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
