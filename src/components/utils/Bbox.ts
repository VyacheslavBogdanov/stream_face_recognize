export function calculateScaledBboxes(
	imageElement: HTMLImageElement,
	bboxes: number[][],
): { left: number; top: number; width: number; height: number }[] {
	const { naturalWidth, naturalHeight, clientWidth, clientHeight } = imageElement;

	const scale = Math.max(clientWidth / naturalWidth, clientHeight / naturalHeight);
	const cropX = (naturalWidth * scale - clientWidth) / 2;
	const cropY = (naturalHeight * scale - clientHeight) / 2;

	return bboxes.map(([x, y, width, height]) => ({
		left: x * scale - cropX,
		top: y * scale - cropY,
		width: width * scale,
		height: height * scale,
	}));
}