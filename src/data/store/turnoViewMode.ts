import { defineStore } from "pinia";

export const useDiretorTurnosViewModeStore = defineStore("diretorTurnosViewMode", {
	state: () => ({
		viewMode: false
	}),
	actions: {
		get() {
			return this.viewMode;
		},
		set(mode: boolean) {
			this.viewMode = mode;
		}
	}
});
