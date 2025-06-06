import { defineStore } from "pinia";

function filterStoreFactory(id: string) {
	return defineStore(id, {
		state: () => ({
			activeFilters: new Set<string>()
		}),
		actions: {
			getAll(): string[] {
				return Array.from(this.activeFilters);
			},
			has(filter: string): boolean {
				return this.activeFilters.has(filter);
			},
			enable(filter: string) {
				this.activeFilters.add(filter);
			},
			disable(filter: string) {
				this.activeFilters.delete(filter);
			},
			toggle(filter: string) {
				if (!this.activeFilters.has(filter)) this.activeFilters.add(filter);
				else this.activeFilters.delete(filter);
			},
			set(filter: string, value: boolean) {
				if (value) this.activeFilters.add(filter);
				else this.activeFilters.delete(filter);
			}
		}
	});
}

export const useDiretorTurnoFiltersStore = filterStoreFactory("diretorTurnoFilters");
export const useDiretorAlunoFiltersStore = filterStoreFactory("diretorAlunoFilters");
