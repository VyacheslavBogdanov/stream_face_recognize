<template>
	<div class="comparison">
		<div class="comparison__upload">
			<UploadSource
				@update:imageData="updateSourceImage"
				:isDisabled="isDisabled"
				@clear="clearMessages"
			/>
			<UploadTarget
				@update:imageData="updateTargetImage"
				:bboxes="targetBboxes"
				:isDisabled="isDisabled"
				@clear="clearMessages"
			/>
		</div>

		<div class="comparison__group">
			<ButtonCompareFace :isDisabled="isDisabled" @compare="comparePhotos" />
			<div v-if="infoCompare" class="comparison__info">
				<span>{{ infoCompare }}</span>
			</div>
		</div>

		<div v-if="comparisonResult?.class" :class="['comparison__result', comparisonResult.class]">
			<div
				v-if="comparisonResult?.message"
				:class="['comparison__message', comparisonResult.class]"
			>
				<div class="comparison__icon">ⓘ</div>
				<span>{{ comparisonResult.message }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import UploadTarget from './UploadTarget.vue';
import UploadSource from './UploadSource.vue';
import ButtonCompareFace from './ButtonCompareFace.vue';
import { MessageType } from '../../components/mocks/db';
import type { Face } from '../../components/utils/types';

const props = defineProps<{
	messageTypes: MessageType[];
	status: string;
}>();

const isDisabled = computed(() => props.status === 'inactive');
const targetImageBase64 = ref<string | null>(null);
const sourceImageBase64 = ref<string | null>(null);
const comparisonResult = ref<{ class: string; message: string } | null>(null);
const targetBboxes = ref<number[]>([]);
const infoCompare = ref<string | null>(null);

const updateTargetImage = (imageData: string) => {
	targetImageBase64.value = imageData;
};

const updateSourceImage = (imageData: string) => {
	sourceImageBase64.value = imageData;
};

const Base64Image = (base64String: string) =>
	base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

const comparePhotos = async () => {
	if (!targetImageBase64.value || !sourceImageBase64.value) {
		comparisonResult.value = {
			class: 'comparison__message--photo',
			message: props.messageTypes.find((msg) => msg.class === 'compare--photo')?.message,
		};
		infoCompare.value = null;
		return;
	}

	const Base64ImageSource = Base64Image(sourceImageBase64.value);
	const Base64ImageTarget = Base64Image(targetImageBase64.value);

	try {
		const response = await fetch(`${import.meta.env.VITE_SERVER_HOST}/recognize_one_by_image`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				request_id: uuidv4(),
				rec_threshold: 1,
				source_image: Base64ImageSource,
				target_image: Base64ImageTarget,
			}),
		});

		if (!response.ok) throw new Error();

		const result = await response.json();
		comparisonResult.value = processComparisonResult(result.detected_faces || []);
		targetBboxes.value = result.detected_faces?.[0]?.bbox || [];
	} catch {
		comparisonResult.value = {
			class: 'comparison__message--error',
			message: props.messageTypes.find((msg) => msg.class === 'error-server')?.message,
		};
		infoCompare.value = null;
	}
};

const processComparisonResult = (detected_faces: Face[]) => {
	if (detected_faces.length === 0) {
		return {
			class: 'comparison__message--error',
			message: props.messageTypes.find((msg) => msg.class === 'compare--error')?.message,
		};
	}

	const face = detected_faces[0];
	const dist = face.dist;
	const isReal = face.real ? 'Real' : 'Fake';
	infoCompare.value = `${isReal} | Dist: ${dist !== null ? dist.toFixed(2) : 'null'}`;

	if (!face.real) {
		return {
			class: 'comparison__message--error',
			message: props.messageTypes.find((msg) => msg.class === 'compare--error')?.message,
		};
	}

	return dist !== null && dist > 0.25
		? {
				class: 'comparison__message--warning',
				message: props.messageTypes.find((msg) => msg.class === 'compare--warning')
					?.message,
			}
		: {
				class: 'comparison__message--success',
				message: props.messageTypes.find((msg) => msg.class === 'compare--success')
					?.message,
			};
};

const clearMessages = () => {
	comparisonResult.value = {
		class: 'comparison__message--photo',
		message: props.messageTypes.find((msg) => msg.class === 'compare--photo')?.message,
	};
	infoCompare.value = null;
};
</script>

<style scoped lang="scss">
@import '../../styles/main.scss';

.comparison {
	display: flex;
	flex-direction: column;
	gap: 20px;

	&__upload {
		display: flex;
		gap: 20px;
	}

	&__group {
		display: flex;
		align-items: center;
		gap: 20px;
		position: relative;
	}

	&__info {
		position: absolute;
		top: 0;
		right: 0;
		height: 50px;
		padding: 0 30px;
		border: 3px solid #513d3d;
		border-radius: $border-radius;
		background: $color-bg;
		color: #333;
		font-size: 18px;
		text-align: center;
		width: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	&__result {
		position: relative;
		display: flex;
		align-items: center;
		padding: 10px 30px 10px 40px;
		border-radius: 8px;
		font-size: 23px;
		max-width: fit-content;
		margin: auto;
	}

	&__icon {
		position: absolute;
		left: 10px;
		height: 30px;
	}

	&__message {
		display: flex;
		align-items: center;
		padding: 10px;
		border-radius: 5px;

		&--info {
			background: #e3e3ff;
			color: $color-primary;
		}

		&--success {
			background: #e0fde7;
			color: #2a9b44;
		}

		&--warning {
			background: #f9ebd8;
			color: #d77417;
		}

		&--error {
			background: #f2dee0;
			color: #db1428;
		}

		&--photo {
			background: #b0aeae;
			color: #333;
		}
	}
}
</style>
