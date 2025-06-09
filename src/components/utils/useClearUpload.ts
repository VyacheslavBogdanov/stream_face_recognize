import type { Ref } from 'vue';

export function ClearUploadSource(
	previewSrc: Ref<string | null>,
	fileName: Ref<string | null>,
	imageBase64: Ref<string>,
	fileInputRef: Ref<HTMLInputElement | null>,
	emit: (event: 'update:imageData', value: string) => void
) {
	const clear = () => {
		previewSrc.value = null;
		fileName.value = null;
		imageBase64.value = '';
		if (fileInputRef.value) fileInputRef.value.value = '';
		emit('update:imageData', '');
	};

	return clear;
}



export function ClearUploadTarget(
	previewSrc: Ref<string | null>,
	fileName: Ref<string | null>,
	imageBase64: Ref<string>,
	fileInputRef: Ref<HTMLInputElement | null>,
	localBboxes: Ref<number[]>,
	emit: (event: 'update:imageData', value: string) => void
) {
	const clear = () => {
		previewSrc.value = null;
		fileName.value = null;
		imageBase64.value = '';
		localBboxes.value = [];
		if (fileInputRef.value) fileInputRef.value.value = '';
		emit('update:imageData', '');
	};

	return clear;
}


