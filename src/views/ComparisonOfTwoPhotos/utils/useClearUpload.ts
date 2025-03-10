import type { Ref } from 'vue';

export function ClearUploadSource(
	imageUrl: Ref<string>,
	previewSrc: Ref<string | null>,
	fileName: Ref<string | null>,
	isInvalidUrl: Ref<boolean>,
	imageBase64: Ref<string>,
	fileInputRef: Ref<HTMLInputElement | null>,
	emit: (event: 'update:imageData', value: string) => void
) {
	const clear = () => {
		imageUrl.value = '';
		previewSrc.value = null;
		fileName.value = null;
		isInvalidUrl.value = false;
		imageBase64.value = '';
		if (fileInputRef.value) fileInputRef.value.value = '';

		emit('update:imageData', '');
	};

	return clear;
}



export function ClearUploadTarget(
	imageUrl: Ref<string>,
	previewSrc: Ref<string | null>,
	fileName: Ref<string | null>,
	isInvalidUrl: Ref<boolean>,
	imageBase64: Ref<string>,
	fileInputRef: Ref<HTMLInputElement | null>,
	localBboxes: Ref<number[]>,
	emit: (event: 'update:imageData', value: string) => void
) {
	const clear = () => {
		imageUrl.value = '';
		previewSrc.value = null;
		fileName.value = null;
		isInvalidUrl.value = false;
		imageBase64.value = '';
		localBboxes.value = [];

		if (fileInputRef.value) fileInputRef.value.value = '';

		emit('update:imageData', '');
	};

	return clear;
}


