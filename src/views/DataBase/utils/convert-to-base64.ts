export const base64Image = (base64String: string) =>
	base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
