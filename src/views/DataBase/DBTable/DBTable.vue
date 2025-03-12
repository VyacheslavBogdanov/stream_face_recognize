<script setup lang="ts">
import type { FaceDB } from '../../../components/utils/types.ts';
const props = defineProps<{
	faces: FaceDB[];
	vectors: string[];
}>();
const emit = defineEmits(['deleteFace']);
</script>

<template>
	<table class="table" v-if="faces.length">
		<thead class="table__thead">
			<tr>
				<th>ID</th>
				<th>Имя</th>
				<th>Фото</th>
				<th>Действия</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="face in faces" :key="face.id">
				<td class="table__td">
					<div class="table__id">
						<span
							v-if="!vectors.includes(face.id)"
							class="table__warning"
							title="Отсутствует вектор в базе данных. Сделайте синхронизацию!"
							>ⓘ</span
						>
						<span>{{ face.id }}</span>
					</div>
				</td>
				<td class="table__td">{{ face.name }}</td>
				<td class="table__td">
					<img :src="face.photoUrl" :alt="face.name" class="table__photo" />
				</td>
				<td class="table__td">
					<button
						@click="$emit('deleteFace', face.id)"
						class="table__button table__button--delete"
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

.table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 20px;
	background: #ffffff;
	box-shadow:
		0px 3px 8px -6px rgba(24, 39, 75, 0.05),
		0px 10px 36px -4px rgba(17, 24, 41, 0.1);

	th,
	td {
		height: 55px;
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

	&__id {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 100px;
		margin-left: 25px;
	}

	&__warning {
		position: absolute;
		left: 12%;
		font-size: 23px;
		opacity: 0.85;
		color: $color-warning;
		cursor: pointer;
		margin-left: 25px;
	}

	&__warning:hover {
		cursor: pointer;
	}

	&__photo {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 5px;
	}

	&__button {
		padding: 8px 12px;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		background-color: #dc3545;
	}
}
</style>
