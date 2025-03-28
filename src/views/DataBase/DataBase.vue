<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { base64Image } from './utils/convert-to-base64';
import type { FaceDB } from '../../components/utils/types';
import DBSync from './DBSync/DBSync.vue';
import DBForm from './DBForm/DBForm.vue';
import DBTable from './DBTable/DBTable.vue';
import DBClear from './DBClear/DBClear.vue';

const HOST = import.meta.env.VITE_SERVER_HOST;
const DB = import.meta.env.VITE_SERVER_DB;

const faces = ref<FaceDB[]>([]);
const newFace = ref<FaceDB>({ id: '', name: '', photoUrl: '' });
const vectors = ref<string[]>([]);
const isSync = ref<boolean>(false);

const fetchFaces = async () => {
	try {
		const uuid = uuidv4();
		console.log('uuid', uuid);

		const response = await fetch(`${HOST}/get_all_keys`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ request_id: uuid }),
		});
		if (!response.ok) throw new Error('Ошибка получения ключей');
		const allKeys = await response.json();
		console.log('allKeys', allKeys);
		vectors.value = allKeys.result;
		console.log('vectors.value', vectors.value);

		const db = await fetch(DB);
		if (!db.ok) throw new Error('Ошибка загрузки базы данных');
		const data = await db.json();
		faces.value = Array.isArray(data) ? data : [data];
		console.log('faces.value', faces.value);
	} catch (error) {
		console.error(error);
	}
};

const addFace = async () => {
	if (!newFace.value.name || !newFace.value.photoUrl) return;
	const id = uuidv4();
	try {
		// const imageBase64 = base64Image(newFace.value.photoUrl);

		// const response = await fetch(`${HOST}/add_new_face`, {
		// 	method: 'POST',
		// 	headers: { 'Content-Type': 'application/json' },
		// 	body: JSON.stringify({
		// 		request_id: uuidv4(),
		// 		id: id,
		// 		image: imageBase64,
		// 	}),
		// });
		// if (!response.ok) throw new Error('Ошибка добавления вектора');

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
		const data = await db.json();
		faces.value = Array.isArray(data) ? data : [data];
		newFace.value = { id: '', name: '', photoUrl: '' };
		fetchFaces();
	} catch (error) {
		console.error(error);
	}
};

const deleteFace = async (id: string) => {
	try {
		// const response = await fetch(`${HOST}/delete_face`, {
		// 	method: 'POST',
		// 	headers: { 'Content-Type': 'application/json' },
		// 	body: JSON.stringify({ request_id: uuidv4(), items: [id] }),
		// });
		// if (!response.ok) throw new Error('Ошибка удаления вектора');

		const db = await fetch(`${DB}/${id}`, { method: 'DELETE' });
		if (!db.ok) throw new Error('Ошибка удаления объекта из базы данных');
		faces.value = faces.value.filter((face) => face.id !== id);
		fetchFaces();
	} catch (error) {
		console.error(error);
	}
};

const clearDatabase = async () => {
	try {
		// const response = await fetch(`${HOST}/clear_db`, {
		// 	method: 'POST',
		// 	headers: { 'Content-Type': 'application/json' },
		// 	body: JSON.stringify({ request_id: uuidv4() }),
		// });
		// if (!response.ok) throw new Error('Ошибка очистки базы векторов');

		await Promise.all(
			faces.value.map((face) => fetch(`${DB}/${face.id}`, { method: 'DELETE' })),
		);
		faces.value = [];
		fetchFaces();
	} catch (error) {
		console.error(error);
	}
};

const syncDB = async () => {
	if (vectors.value.length === faces.value.length || isSync.value) return;
	isSync.value = true;
	const faceIds = faces.value.map((face) => face.id);
	const vectorIds = new Set(vectors.value);
	if (vectors.value.length < faces.value.length) {
		try {
			await Promise.all(
				faces.value
					.filter((face) => !vectorIds.has(face.id))
					.map(async (face) => {
						const imageBase64 = base64Image(face.photoUrl);
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
			console.error('Ошибка', error);
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
	isSync.value = false;
};

const updateNewFace = (val: FaceDB) => {
	newFace.value = val;
	console.log('newFace.value', newFace.value);
};

onMounted(fetchFaces);
</script>

<template>
	<div class="database">
		<DBSync :vectors="vectors" :faces="faces" @syncDB="syncDB" :isSync="isSync" />
		<DBForm :newFace="newFace" @update:newFace="updateNewFace" @addFace="addFace" />
		<DBTable :faces="faces" :vectors="vectors" @deleteFace="deleteFace" />
		<DBClear :faces="faces" @clearDatabase="clearDatabase" />
	</div>
</template>

<style lang="scss" scoped>
@import '../../styles/main.scss';
.database {
	width: 70%;
	margin: 55px;
	text-align: center;
}
</style>
