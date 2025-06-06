<template>
	<div class="page-container">
		<SideBar :isExpanded="is_expanded" @toggle="toggleSidebar" />

		<div :class="['page-content', { 'content-expanded': is_expanded }]">
			<div class="page-header">
				<h1>ALUNOS</h1>
				<button class="page-icon-button">
					<span class="material-icons" @click="openInfoModal">info</span>
				</button>
			</div>

			<div class="content">
				<div class="upper">
					<BaseCard title="Alunos">
						<div class="cardBody">
							<CircleProgress :value="filteredAlunos.length" :max="_alunos.length" color="#A1A1AA" />
							<div class="search-bar">
								<span class="material-icons">search</span>
								<input
									v-model="search"
									placeholder="Pesquise por um aluno"
									type="text"
									aria-label="search"
								/>
							</div>
						</div>
					</BaseCard>
					<FiltersBox
						title="Filtros"
						:filterGroups="filterGroups"
						:multiSelect="true"
						@filter-change="onFilterChange"
						@filter-change-diff="onFilterChangeDiff"
						ref="filters"
					></FiltersBox>
				</div>
				<BaseCard title="Alunos" id="alunosCard">
					<div class="alunosListContainer">
						<template v-if="filteredAlunos.length === 0">
							<p>
								Não foi possível encontrar um aluno com o nome <b>{{ search.valueOf() }}</b
								>.
							</p>
							<p>
								Experimente <b>reescrever o nome</b>, alterar os <b>filtros</b> e procure novamente!
							</p>
						</template>
						<template v-else>
							<div class="alunosList">
								<InfoBaseAccordion
									v-for="(item, index) in filteredItems"
									:key="index"
									:item="item"
									@child-button-click="studentBtnClick"
								></InfoBaseAccordion>
							</div>
						</template>
					</div>
				</BaseCard>
			</div>
		</div>
	</div>
	<!-- Modal is always mounted -->
	<ShiftExchangeModal
		ref="shiftModal"
		:from="selectedRequest.from"
		:to="selectedRequest.to"
		:availableShifts="selectedRequest.availableShifts"
		:shifts="selectedRequest!.shifts"
		@approve="handleApprove"
		@close="handleClose"
	/>

	<ModalBase ref="infoModal">
		<InformationCard
			title="Informações"
			description="Esta página foi concebida para fornecer uma visão geral dos alunos e ferramentas para a sua gestão. Incluí também ferramentas de filtragem dos alunos, por categoria e por nome."
			:topics="['Para alocar manualmente um aluno, clique no botão “Alocar” presente no mesmo e selecione o turno a alocar no popup.', 'Para trocar o turno de um aluno, clique no botão “Trocar” presente no mesmo e selecione o turno para o qual trocar no popup.']"
		></InformationCard>
	</ModalBase>
</template>

<script setup lang="ts">
	import "@/assets/css/director.css";

	import { computed, ref } from "vue";

	import SideBar from "../components/SideBar.vue";
	import BaseCard from "@/components/BaseCard.vue";
	import CircleProgress from "@/components/CircleProgress.vue";
	import FiltersBox from "@/components/FiltersBox.vue";
	import InfoBaseAccordion, { type AccordionItem } from "@/components/InfoBaseAccordion.vue";
	import ShiftExchangeModal from "@/components/ShiftExchangeModal.vue";
	import type { Shift } from "@/components/ShiftCalendar.vue";
	import { useDiretorAlunoFiltersStore } from "@/data/store/filters";
	import { APIWrapper, type APICourse, type APIShift, type APIStudent } from "@/lib/api";
	import { formatTime, type Time } from "@/data/time";
	import ModalBase from "@/components/ModalBase.vue";
	import InformationCard from "@/components/InformationCard.vue";

	//#region -------------- Data --------------

	const studentsAPI = APIWrapper.local<APIStudent[]>(3000, "students");
	const shiftAPI = APIWrapper.local<APIShift[]>(3000, "shifts");
	const courseAPI = APIWrapper.local<APICourse[]>(3000, "courses");
	const _alunos = (await studentsAPI.fetch()) ?? [];
	const _shifts = (await shiftAPI.fetch()) ?? [];
	const _courses = (await courseAPI.fetch()) ?? [];
	const alunos = ref(_alunos);

	const filteredItems = computed(() => {
    const searchTerm = search.value.toLowerCase();
    const statusFilters = selectedFilters.value.status;
    
    return items.filter(item => {
        // Busca no título (alphanum) e no subtítulo (nome + status)
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) || 
                             (item.subtext?.toLowerCase().includes(searchTerm) ?? false);
        
        // Verifica os filtros de status
        const matchesStatus = statusFilters.length === 0 || 
                            statusFilters.some(filter => {
                                // Filtro por Estatuto (verifica no subtext do item principal)
                                if (filter === "Estatuto") return item.subtext?.includes("estatuto");
                                
                                // Filtro por Ano (verifica nos children)
                                if (filter.includes("Ano")) {
                                    return item.children?.some(child => 
										child.subtext?.toLowerCase().includes(filter.toLowerCase())
                                    );
                                }
                                
                                // Filtro por Alocação
                                if (filter === "Não Alocado") {
                                    return item.children?.some(child => 
                                        child.subtext?.includes("Não Alocado")
                                    );
                                }
                                if (filter === "Alocado") {
                                    return item.children?.some(child => 
                                        !child.subtext?.includes("Não Alocado")
                                    );
                                }
                                
                                // Filtro por Primeira Inscrição (se aplicável)
                                if (filter === "Primeira Inscrição") {
                                    // Implemente sua lógica específica aqui
                                    return false;
                                }
                                
                                return false;
                            });
        
        return matchesSearch && matchesStatus;
    });

});

	const infoModal = ref<InstanceType<typeof ModalBase>>();
	function openInfoModal() {
		infoModal.value?.open();
	}

	const items: AccordionItem[] = [];
	if (_alunos.length > 0) {
		for (const aluno of _alunos) {
			items.push({
				title: aluno.alphanum,
				subtext: `${aluno.name} ${aluno.specialStatus === true ? '(Aluno com estatuto)' : ''}`,
				buttonType: "dropdown",
				children: aluno.enrolled.map((e, i) => {
					const shift = _shifts.find((s) => s.id === e);
					const course = _courses.find((c) => c.id === shift?.courseId);

					return {
						title: `${course?.abbreviation} - ${shift?.name}`,
						subtext: i % 2 === 0 ? `${shift?.day} ${formatTime(shift?.from as Time)}-${formatTime(shift?.to as Time)} \n Disciplina de ${course?.year}º Ano` : "Não Alocado",
						buttonType: i % 2 === 0 ? "trocar" : "alocar",
					};
				}),
			});
		}
	}
	//#endregion -------------- Data --------------

	//#region -------------- Functions --------------
	const is_expanded = ref(false);
	const search = ref("");
	const filterStore = useDiretorAlunoFiltersStore();
	const filters = ref<InstanceType<typeof FiltersBox>>();

	const filterGroups = ref({
		status: [
			{ value: "1º Ano", label: "1º Ano" },
			{ value: "2º Ano", label: "2º Ano" },
			{ value: "3º Ano", label: "3º Ano" },
			{ value: "Alocado", label: "Alocado" },
			{ value: "Não Alocado", label: "Não Alocado" },
			{ value: "Primeira Inscrição", label: "Primeira Inscrição" },
			{ value: "Estatuto", label: "Estatuto" },
		],
	});

	const selectedFilters = ref<{ status: string[] }>({
		status: [],
	});

	function onFilterChange(newFilters: { status: string[] }) {
		selectedFilters.value = newFilters;
	}

	function onFilterChangeDiff(groupName: string, value: string, added: boolean) {
		filterStore.set(value, added);
	}

	setTimeout(() => {
		filters.value!.setActiveFilters({ status: filterStore.getAll() });
	}, 0);

	const filteredAlunos = computed(() => {
		let filtered = alunos.value;

		if (search.value) {
			filtered = filtered.filter((aluno) =>
				aluno.name.toLowerCase().includes(search.value.toLowerCase()),
			);
		}

		if (selectedFilters.value.status.length > 0) {
			filtered = filtered.filter((aluno) =>
				selectedFilters.value.status.includes(`${aluno.specialStatus}`),
			);
		}

		return filtered;
	});

	const toggleSidebar = () => {
		is_expanded.value = !is_expanded.value;
	};

	// Modal logic
	const shiftModal = ref<InstanceType<typeof ShiftExchangeModal>>();

	const selectedRequest = ref({
		from: { text: "TP1 - 08:00", barColor: "#2E8B57" },
		to: { barColor: "#ADD8E6" },
		shifts: <Shift[]>[
			{
				day: "Terça-Feira",
				from: 14,
				to: 17,
				course: "RC",
				name: "TP2",
				classroom: "E1.02",
			},
		],
		availableShifts: [
			{ title: "TP2", subtext: "14:00 - 17:00" },
			{ title: "TP3", subtext: "17:00 - 20:00" },
		],
	});

	function studentBtnClick(btnType: "trocar" | "alocar" | "dropdown", e: Event) {
		(() => e)();
		if (btnType === "trocar") {
			// TODO: Change selectedRequest before opening modal
			// Parameter 'e' has the original click button event. Use it to fetch data, ig.
			openModal();
		}
	}

	function openModal() {
		shiftModal.value?.open();
	}

	function handleApprove(shift: unknown) {
		console.log("Approved shift:", shift);
	}

	function handleClose() {
		console.log("Modal closed");
	}
	//#endregion -------------- Functions --------------
</script>

<style scoped>
	.content {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.content .upper {
		display: grid;
		grid-template-columns: 40% 60%;
		gap: 15px;
		padding-bottom: 15px;
		padding-right: 15px;
	}

	.cardBody {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: end;
		width: 100%;
		overflow: hidden;
	}

	:global(.body) {
		height: 95% !important;
	}

	#alunosCard {
		overflow-y: hidden !important;
	}

	.content .alunosListContainer {
		height: 100%;
		overflow-y: auto;
	}

	.alunosListContainer p {
		text-align: center;
		font-size: 18px;
	}

	.alunosListContainer b {
		font-weight: 600;
		color: white;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background-color: #303446;
		border-radius: 8px;
		padding: 6px 10px;
		gap: 8px;
		max-width: 70%;
		margin-left: 30%;
		border: 1px solid #ccc;
	}

	.search-bar .material-icons {
		color: #ccc;
		font-size: 20px;
	}

	.search-bar input {
		border: none;
		outline: none;
		font-size: 14px;
		width: 100%;
		color: #ccc;
		background: transparent;
	}

	.search-bar input::placeholder {
		color: #ccc;
	}

	.custom-button {
		display: flex;
		background-color: #5e779b;
		border: 1px solid #0af;
		border-radius: 5px;
		color: white;
		font-size: 18px;
		font-weight: 600;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 5px 50px;
		cursor: pointer;
	}
</style>
