import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import SearchByPhoto from '@/views/SearchByPhoto/SearchByPhoto.vue';
import ComparisonOfTwoPhotos from '@/views/ComparisonOfTwoPhotos/ComparisonOfTwoPhotos.vue';
import DataBase from '@/views/DataBase/DataBase.vue';

const routes: RouteRecordRaw[] = [
	{ path: '/', component: SearchByPhoto },
	{ path: '/comparison-of-two-photos', component: ComparisonOfTwoPhotos },
	{ path: '/data-base', component: DataBase },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
