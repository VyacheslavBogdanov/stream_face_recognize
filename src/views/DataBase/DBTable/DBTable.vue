<script setup lang="ts">
import type { FaceDB } from '../../../components/utils/types.ts';
const props = defineProps<{
	faces: FaceDB[];
	vectors: string[];
}>();
const emit = defineEmits(['deleteFace']);
</script>

<template>
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
				<td class="database__td">
					<div class="database__id">
						<span
							v-if="!vectors.includes(face.id)"
							class="database__warning"
							title="Отсутствует вектор в базе данных. Сделайте синхронизацию!"
							>ⓘ</span
						>
						<span>{{ face.id }}</span>
					</div>
				</td>
				<td class="database__td">{{ face.name }}</td>
				<td class="database__td">
					<img :src="face.photoUrl" :alt="face.name" class="database__photo" />
				</td>
				<td class="database__td">
					<button
						@click="$emit('deleteFace', face.id)"
						class="database__button database__button--delete"
					>
						Удалить
					</button>
				</td>
			</tr>
		</tbody>
	</table>
	<div v-else>В базе данных нет объектов</div>
</template>

<style lang="scss" scoped>
@import '../../../styles/main.scss';

.database__table {
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

.database__id {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 100px;
	margin-left: 25px;
}

.database__warning {
	position: absolute;
	left: 12%;
	font-size: 23px;
	opacity: 0.85;
	color: $color-warning;
	cursor: pointer;
	margin-left: 25px;
}

.database__warning:hover {
	cursor: pointer;
}

.database__photo {
	width: 50px;
	height: 50px;
	object-fit: cover;
	border-radius: 5px;
}
</style>
