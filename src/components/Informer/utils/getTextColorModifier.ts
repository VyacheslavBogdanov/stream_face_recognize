export const getTextColorModifier = (theme: string, modifier: string): string | undefined => {
	if (theme === 'informer--dark' && modifier === 'inform--default') {
		return 'inform--dark-theme-text';
	}
	return undefined;
};
