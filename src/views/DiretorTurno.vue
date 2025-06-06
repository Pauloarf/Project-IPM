<template>
	<div class="page-container">
		<SideBar :isExpanded="is_expanded" @toggle="toggleSidebar" />

		<div :class="['page-content', { 'content-expanded': is_expanded }]">
			<div class="page-header">
				<h1>TURNO</h1>
				<button class="page-icon-button">
					<span class="material-icons" @click="openInfoModal">info</span>
				</button>
			</div>

			<div class="content">
				<div class="meta">
					<BreadCrumb
						:path="[
							{ name: 'diretor', link: '/diretor' },
							{ name: 'turnos', link: '/diretor/turnos' },
							{ name: `${props.course}`, link: `/diretor/turnos?filters=${props.course}` },
							{ name: `${props.shift}`, link: `/diretor/turnos/IPM/${props.shift}` },
						]"
					></BreadCrumb>
					<BaseCard
						:title="`${props.course.toUpperCase()} - ${props.shift.toUpperCase()}`"
						id="shiftCard"
					>
						<div class="cardBody">
							<CircleProgress
								:value="shiftData.studentAllocated"
								:max="shiftData.totalStudents"
								color="var(--color-red)"
								:show-text="true"
							></CircleProgress>
							<!-- color="#ef4444" -->
							<div class="propertyList">
								<h3>{{ shiftData!.duration }}</h3>
								<h3>{{ shiftData!.location }}</h3>
								<h3 class="secondary">{{ shiftData!.teacher }}</h3>
							</div>
							<div class="shiftMetaControls">
								<button class="commonBtn" id="changeRoomBtn" @click="goToChangeRoom">
									Alterar Sala
								</button>
							</div>
						</div>
					</BaseCard>
				</div>
				<div class="dash-content">
					<BaseCard title="Alunos" id="alunosCard">
						<template #header-right>
							<div class="search-bar">
								<span class="material-icons">search</span>
								<input v-model="search" placeholder="Pesquise por um aluno" type="text" />
							</div>
						</template>
						<div class="alunosListContainer">
							<div class="alunosList">
								<InfoBaseCard
									v-for="(entry, index) in filteredAlunos"
									:key="index"
									:title="`${entry.numMec}`"
									:subtext="`${entry.name}`"
								/>
							</div>
						</div>
					</BaseCard>
				</div>
			</div>
		</div>
	</div>
	<ModalBase ref="infoModal">
		<InformationCard
			title="Informações"
			description="Esta página foi concebida para apresentar as informações de um turno, desde a sua ocupação, disponibilidade, horário, lista de alunos e mais informações pertinentes."
			:topics="['Nesta página é disponibilizada uma opção que permite realizar a troca de sala de um turno em específico.']"
		></InformationCard>
	</ModalBase>
</template>

<script setup lang="ts">
	import "@/assets/css/director.css";

	import { ref, computed } from "vue";
	import { useRouter } from "vue-router";

	import SideBar from "../components/SideBar.vue";
	import BaseCard from "@/components/BaseCard.vue";
	import BreadCrumb from "@/components/BreadCrumb.vue";
	import CircleProgress from "@/components/CircleProgress.vue";
	import InfoBaseCard from "@/components/InfoBaseCard.vue";
	import { type APIShift, APIWrapper, type APICourse, type APITeacher, type APIAllocation, type APIBuilding, type APIClassroom, type APIStudent } from "@/lib/api";
	import { formatTime, type Time } from "@/data/time";
	import ModalBase from "@/components/ModalBase.vue";
	import InformationCard from "@/components/InformationCard.vue";

	//#region -------------- Props --------------
	const props = defineProps({
		course: { type: String, required: true },
		shift: { type: String, required: true },
	});
	//#endregion -------------- Props --------------

	//#region -------------- Data --------------

	type studentData = {
		numMec: string,
		name: string
	}

	type shiftData = {
		duration: string,
		location: string,
		teacher: string,
		studentAllocated: number,
		totalStudents: number,
		students: studentData[]
	};

	const shiftData = ref<shiftData>({
		duration: '',
		location: '',
		teacher: '',
		studentAllocated: 0,
		totalStudents: 0,
		students: []
	});



	const coursesAPI = APIWrapper.local<APICourse[]>(3000, "courses");
	const course = await coursesAPI.fetch({filter: {abbreviation: props.course.toUpperCase()}});
	if (course !== undefined && course.length > 0) {
		const shiftsAPI = APIWrapper.local<APIShift[]>(3000, "shifts");
		const shifts = await shiftsAPI.fetch({filter: {courseId: course[0].id, name: props.shift.toUpperCase()}});
		if (shifts !== undefined && shifts.length > 0) {
			const teachersAPI = APIWrapper.local<APITeacher[]>(3000, "teachers");
			const teachers = await teachersAPI.fetch({filter: {id: shifts[0].teacherId}});
			const allocationsAPI = APIWrapper.local<APIAllocation[]>(3000, "allocations");
			const allocations = await allocationsAPI.fetch({filter: {shiftId: shifts[0].id}});
			const classroomsAPI = APIWrapper.local<APIClassroom[]>(3000, "classrooms");
			const classrooms = await classroomsAPI.fetch({filter: {id: shifts[0].classroomId}});
			const studentsAPI = APIWrapper.local<APIStudent[]>(3000, "students");
			if (classrooms !== undefined && classrooms.length > 0) {
				const buildingsAPI = APIWrapper.local<APIBuilding[]>(3000, "buildings");
				const buildings = await buildingsAPI.fetch({filter: {id: classrooms[0].buildingId }});
				if (
					(teachers !== undefined && teachers.length > 0) && 
					(allocations !== undefined && allocations.length > 0) &&
					(buildings !== undefined && buildings.length > 0)
				) {
					shiftData.value.duration = `${shifts[0].day}: ${formatTime(shifts[0].from as Time)} - ${formatTime(shifts[0].to as Time)}`
					shiftData.value.location = `${buildings[0].name} - ${classrooms[0].name}`
					shiftData.value.teacher  = `${teachers[0].name}`
					shiftData.value.studentAllocated = allocations.length
					shiftData.value.totalStudents = shifts[0].totalStudentsRegistered

					for(const allocation of allocations) {
						const students = await studentsAPI.fetch({filter: {id: allocation.studentId}})
						if (students !== undefined && students.length > 0)  {
							shiftData.value.students.push({numMec: students[0].alphanum.toUpperCase(), name: students[0].name})
						}
					}
				}
			}
		}
	}

	//#endregion -------------- Data --------------

	//#region -------------- Functions --------------
	const is_expanded = ref(false);
	const search = ref("");
	const router = useRouter();

	const toggleSidebar = () => {
		is_expanded.value = !is_expanded.value;
	};
	const infoModal = ref<InstanceType<typeof ModalBase>>();
	
	function openInfoModal() {
		infoModal.value?.open();
	}

	const filteredAlunos = computed(() =>
		shiftData.value.students.filter(
			(a) =>
				a.name.toLowerCase().includes(search.value.toLowerCase()) ||
				a.numMec.includes(search.value),
		),
	);
	console.log(filteredAlunos.value)

	const goToChangeRoom = () => {
		router.push(`/diretor/turnos/${props.course}/${props.shift}/salas`);
	};
	//#endregion -------------- Functions --------------
</script>

<style scoped>
	.content {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
		gap: 10px;
	}

	.commonBtn {
		width: 300px;
		height: 39px;
		font-size: 16px;
		font-weight: 400;
		color: var(--color-text-primary);
		background-color: #5e779b;
		border: 2px solid #00aaff;
		border-radius: 6px;
		cursor: pointer;

		&:hover {
			background-color: #485c77;
		}

		&.success {
			background-color: #1da91d;

			&:hover {
				background-color: #146b14;
			}

			&:disabled {
				background-color: #5c5c5c;
			}
		}
	}

	.propertyList {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		height: 100%;

		h3:not(.secondary) {
			color: white;
		}
	}

	/*#region -------------- Meta -------------- */
	.meta #shiftCard {
		border-top-left-radius: 0;
	}

	.meta #shiftCard .cardBody {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 15px;
		width: 100%;
	}

	.meta #shiftCard .cardBody .shiftMetaControls {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10px;
		width: 100%;
		height: 100%;
	}
	/*#endregion -------------- Meta -------------- */

	/*#region -------------- Content -------------- */
	.dash-content {
		display: flex;
		height: 100%;
	}

	.dash-content #alunosCard {
		width: 100%;
		height: 100%;
		overflow: hidden;
		overflow-y: auto;
	}

	:global(.body) {
		height: 95% !important;
	}

	#alunosCard {
		overflow-y: hidden !important;
	}

	.dash-content .alunosListContainer {
		height: 100%;
		overflow-y: auto;
	}

	.dash-content .alunosList {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background-color: #303446;
		border-radius: 8px;
		padding: 6px 10px;
		gap: 8px;
		border: 1px solid #ccc;
		margin-left: 15px;
	}

	.search-bar .material-icons {
		color: #ccc;
		font-size: 20px;
	}

	.search-bar input {
		border: none;
		outline: none;
		font-size: 14px;
		width: 200px;
		color: #ccc;
		background: transparent;
	}

	.search-bar input::placeholder {
		color: #ccc;
	}
	/*#endregion -------------- Content -------------- */
</style>
