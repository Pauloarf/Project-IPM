import { useAuthStore } from '@/data/store/auth';
import type { APILogin } from '@/lib/api';
import { assertAuthentication, deauthenticate } from '@/lib/api/auth';
import { createRouter, createWebHistory, type RouteLocationNormalizedGeneric } from 'vue-router'

const AUTH_OVERRIDE_BECAUSE_PA11Y_IS_A_FUCKING_PIECE_OF_SHIT_AND_I_HOPE_ITS_DEVS_BURN_IN_HELL = true;
const AUTH_OVERRIDE_METADATA_DID_I_EVER_TELL_YOU_PA11Y_IS_FUCKING_HORRIBLE = true;

async function assertRouterAuthentication(to: RouteLocationNormalizedGeneric, kind: APILogin["kind"]) {
	if (AUTH_OVERRIDE_BECAUSE_PA11Y_IS_A_FUCKING_PIECE_OF_SHIT_AND_I_HOPE_ITS_DEVS_BURN_IN_HELL) return true;

	const auth = await assertAuthentication(true);
	if (auth) {
		const authStore = useAuthStore();
		authStore.login(auth.id, auth.kind);

		if (auth.kind === kind) return true;
		else {
			switch (auth.kind) {
				case "directors": {
					return { path: "/diretor" };
				}
				case "students": {
					return { path: "/alunos" };
				}
				case "teachers": {
					return { path: "/404" };
				}
			}
		}
	} else return {
		path: `/login`,
		query: { redirect_uri: `${encodeURIComponent(to.fullPath)}` }
	};
}

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		//#region -------------- DIRETOR --------------
		{
			path: '/diretor',
			name: 'diretorDashboard',
			component: () => import('../views/DiretorDashboard.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "directors");
			}
		},
		{
			path: '/diretor/turnos',
			name: 'diretorTurnos',
			props: true,
			component: () => import('../views/DiretorTurnos.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "directors");
			}
		},
		{
			path: '/diretor/pedidos',
			name: 'diretorPedidos',
			props: true,
			component: () => import('../views/DiretorPedidos.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "directors");
			}
		},
		{
			path: '/diretor/alunos',
			name: 'diretorAlunos',
			props: true,
			component: () => import('../views/DiretorAlunos.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "directors");
			}
		},
		{
			path: '/diretor/turnos/:course/:shift',
			name: 'diretorTurno',
			props: true,
			component: () => import('../views/DiretorTurno.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "directors");
			}
		},
		{
			path: '/diretor/turnos/:course/:shift/salas',
			name: 'diretorSala',
			props: true,
			component: () => import('../views/DiretorSala.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "directors");
			}
		},
		//#endregion -------------- DIRETOR --------------
		//#region -------------- ALUNOS --------------
		{
			path: '/alunos',
			name: 'alunosDashboard',
			props: true,
			component: () => import('../views/AlunosDashboard.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "students");
			}
		},
		{
			path: '/alunos/pedidos',
			name: 'alunosPedidos',
			props: true,
			component: () => import('../views/AlunosPedidos.vue'),
			async beforeEnter(to) {
				return await assertRouterAuthentication(to, "students");
			}
		},
		//#endregion -------------- ALUNOS --------------
		//#region -------------- COMMON --------------
		{
			path: '/login',
			name: 'login',
			component: () => import('../views/ComumLogin.vue'),
			async beforeEnter(to) {
				// console.log("ROUTER LOGIN:", to)
				const auth = AUTH_OVERRIDE_BECAUSE_PA11Y_IS_A_FUCKING_PIECE_OF_SHIT_AND_I_HOPE_ITS_DEVS_BURN_IN_HELL
					? AUTH_OVERRIDE_METADATA_DID_I_EVER_TELL_YOU_PA11Y_IS_FUCKING_HORRIBLE
					: await assertAuthentication();
				if (auth) {
					if (to.redirectedFrom && to.redirectedFrom.name !== "goback") {
						return { path: to.redirectedFrom.fullPath };
					} else {
						//@ts-expect-error THIS ERROR ONLY EXISTS BECAUSE THE EXISTENCE OF PA11Y'S DEVS IS AN
						// ERROR UPON THIS GOD FORSAKEN EARTH
						switch (auth.kind) {
							case "directors": {
								return { path: "/diretor" };
							}
							case "students": {
								return { path: "/alunos" };
							}
							case "teachers": {
								return { path: "/404" };
							}
						}
					}
				} else if (to.redirectedFrom?.path === "/login") return true;
				else return true;
			}
		},
		{
			path: "/logout",
			name: "logout",
			redirect() {
				deauthenticate();
				return "/login";
			}
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'backrooms',
			props: true,
			component: () => import('../views/TheBackrooms.vue')
		},
		{
			path: "/goback",
			name: "goback",
			redirect() {
				return "/login";
			}
		},
		{
			path: "/die",
			name: "die",
			redirect() {
				deauthenticate();
				return "/fuck";
			}
		},
		//#endregion -------------- COMMON --------------
	],
})

export default router;
