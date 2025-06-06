<template>
	<div class="page-container">
		<SideBar :isExpanded="is_expanded" @toggle="toggleSidebar" />

		<div :class="['page-content', { 'content-expanded': is_expanded }]">
			<div class="page-header">
				<h1>Turnos</h1>
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
								color="#b14d57"
								:show-text="true"
							></CircleProgress>
							<div class="propertyList">
								<h3>{{ shiftData.duration }}</h3>
								<h3>{{ shiftData.location }}</h3>
								<h3 class="secondary">{{ shiftData.teacher }}</h3>
							</div>
							<div class="shiftMetaControls">
								<button class="commonBtn no-bg" id="changeRoomBtn">Alterar Sala</button>
							</div>
						</div>
					</BaseCard>
				</div>
				<div class="dash-content">
					<BaseCard title="Lista de Salas" id="roomsCard">
						<div class="roomListContainer">
							<div class="left">
								<InfoBaseCard
									v-for="(entry, index) in roomData"
									:key="index"
									:title="`${entry.building} - ${entry.classroom}`"
									:subtext="`Ocupação: ${entry.occupation}`"
									:barColor="entry.availability ? '#4ade80' : '#f87171'"
									@click="setActiveRoom(index)"
									:selected="activeRoomId === index"
									style="cursor: pointer"
								></InfoBaseCard>
							</div>
						</div>
					</BaseCard>
					<BaseCard title="Informações Adicionais" class="right">
						<div class="info">
							<div class="propertyList">
								<h3>Horário: {{ activeRoomEntry.duration }}</h3>
								<h3>Edifício: {{ activeRoomEntry.building }}</h3>
								<h3>Sala: {{ activeRoomEntry.classroom }}</h3>
								<h3>Ocupação: {{ activeRoomEntry.occupation }}</h3>
								<h3 class="available-status" :class="{ negative: !activeRoomEntry.availability }">
									Disponível: <span>{{ activeRoomEntry.availability ? "Sim" : "Não" }}</span>
								</h3>
								<h3 v-if="!activeRoomEntry.availability" class="available-status-note">
									Razão:
									<span>{{ activeRoomEntry.reason }}</span>
								</h3>
							</div>
							<div class="controls">
								<button class="commonBtn cancel" @click="goToTurnoPage">Cancelar</button>
								<button class="commonBtn success" :disabled="!activeRoomEntry.availability">
									Trocar
								</button>
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
			description="Esta página foi concebida para fornecer ao utilizador a possibilidade de trocar a sala de um determinado turno, podendo alterar também o seu horário em caso de necessidade."
			:topics="[
				'A aplicação permite que nesta página se selecione uma sala disponivel para a unidade curricular selecionada.',
				'É permitido que se altere a sala com outras UCs caso a mesma alteração não tenha impacto negativo nas UCs em questão.',
				'No painel de informações adicionais é mostrado um conjunto de informações que permite perceber qual o impacto da troca.',
			]"
		></InformationCard>
	</ModalBase>
</template>

<script setup lang="ts">
	import "@/assets/css/director.css";

	import { computed, ref } from "vue";
	import { useRouter } from "vue-router";

	import { type Time, formatTime } from "@/data/time";

	import SideBar from "../components/SideBar.vue";
	import BaseCard from "@/components/BaseCard.vue";
	import BreadCrumb from "@/components/BreadCrumb.vue";
	import CircleProgress from "@/components/CircleProgress.vue";
	import InfoBaseCard from "@/components/InfoBaseCard.vue";
	import { useDiretorSelectedRoomStore } from "@/data/store/rooms";
	import ModalBase from "@/components/ModalBase.vue";
	import InformationCard from "@/components/InformationCard.vue";
	import {
		type APICourse,
		APIWrapper,
		type APIAllocation,
		type APIBuilding,
		type APIClassroom,
		type APIShift,
		type APITeacher,
	} from "@/lib/api";

	//#region -------------- Props --------------
	const props = defineProps({
		course: { type: String, required: true },
		shift: { type: String, required: true },
	});
	//#endregion -------------- Props --------------

	//#region -------------- Data --------------

	type classroomData = {
		duration: string;
		building: string;
		classroom: string;
		occupation: string;
		availability: boolean;
		reason?: string;
	};

	const roomData: classroomData[] = [];

	type shiftData = {
		duration: string;
		location: string;
		teacher: string;
		studentAllocated: number;
		totalStudents: number;
	};

	const shiftData = ref<shiftData>({
		duration: "",
		location: "",
		teacher: "",
		studentAllocated: 0,
		totalStudents: 0,
	});

	const shiftsAPI = APIWrapper.local<APIShift[]>(3000, "shifts");
	const teachersAPI = APIWrapper.local<APITeacher[]>(3000, "teachers");
	const classroomsAPI = APIWrapper.local<APIClassroom[]>(3000, "classrooms");
	const buildingsAPI = APIWrapper.local<APIBuilding[]>(3000, "buildings");
	const allocationsAPI = APIWrapper.local<APIAllocation[]>(3000, "allocations");
	const coursesAPI = APIWrapper.local<APICourse[]>(3000, "courses");

	const shifts = await shiftsAPI.fetch({ filter: { name: props.shift.toUpperCase() } });
	if (shifts !== undefined && shifts.length > 0) {
		const currentShift = shifts[0];
		const classrooms = await classroomsAPI.fetch();
		const teachers = await teachersAPI.fetch({ filter: { id: currentShift.teacherId } });
		if (classrooms !== undefined && classrooms.length > 0) {
			const currentClassroom = classrooms.filter((c) => c.id === currentShift.classroomId)[0];
			const buildings = await buildingsAPI.fetch({ filter: { id: currentClassroom.buildingId } });
			if (
				buildings !== undefined &&
				buildings.length > 0 &&
				teachers !== undefined &&
				teachers.length > 0
			) {
				shiftData.value.duration = `${currentShift.day}: ${formatTime(currentShift.from as Time)} - ${formatTime(currentShift.to as Time)}`;
				shiftData.value.location = `${buildings[0].name} - ${currentClassroom.name}`;
				shiftData.value.teacher = `${teachers[0].name}`;
				shiftData.value.totalStudents = currentShift.totalStudentsRegistered;
			}

			const allocations = await allocationsAPI.fetch({ filter: { shiftId: currentShift.id } });
			if (allocations !== undefined && allocations.length > 0) {
				shiftData.value.studentAllocated = allocations.length;
			}
		}
	}

	const classrooms = await classroomsAPI.fetch();
	const buildings = await buildingsAPI.fetch();
	const allShifts = await shiftsAPI.fetch();
	const allocations = await allocationsAPI.fetch();
	const courses = await coursesAPI.fetch();

	if (
		classrooms &&
		classrooms.length > 0 &&
		buildings &&
		buildings.length > 0 &&
		allShifts &&
		allShifts.length > 0 &&
		allocations &&
		allocations.length > 0 &&
		courses &&
		courses.length > 0
	) {
		const currentShift = allShifts.find((s) => s.name.includes(props.shift.toUpperCase()));
		if (currentShift !== undefined) {
			const overlappingShifts = allShifts.filter(
				(s) => s.day === currentShift.day && s.from < currentShift.to && s.to > currentShift.from,
			);

			for (const classroom of classrooms) {
				if (classroom.id === currentShift.classroomId) continue;

				const building = buildings.find((b) => b.id === classroom.buildingId);

				const overlappingShift = overlappingShifts.find((s) => s.classroomId === classroom.id);

				let reason = undefined;
				let isOccupied = false;

				if (overlappingShift) {
					const overlappingCourse = courses.find((c) => c.id === overlappingShift.courseId);
					reason = `A sala já se encontra atribuída ao turno ${overlappingShift.name} de ${overlappingCourse?.name ?? "desconhecido"}.`;
					isOccupied = true;
				}

				const currentShiftAllocations = allocations.filter(
					(a) => a.shiftId === currentShift.id && currentShift.classroomId === classroom.id,
				);

				if (building) {
					roomData.push({
						duration: `${currentShift.day} das ${formatTime(currentShift.from as Time)} às ${formatTime(currentShift.to as Time)}`,
						building: building.name,
						classroom: classroom.name,
						occupation: `${currentShiftAllocations.length}/${currentShift.totalStudentsRegistered}`,
						availability: !isOccupied,
						reason,
					});
				}
			}
		}
	}

	const activeRoomStore = useDiretorSelectedRoomStore();
	const activeRoomId = ref(activeRoomStore.get());
	//#endregion -------------- Data ---------------

	//#region -------------- Functions -------------
	const infoModal = ref<InstanceType<typeof ModalBase>>();
	const is_expanded = ref(false);
	const router = useRouter();

	const toggleSidebar = () => {
		is_expanded.value = !is_expanded.value;
	};

	function setActiveRoom(id: number) {
		activeRoomId.value = id;
		activeRoomStore.set(id);
		console.log("SAR:", id, activeRoomId.value);
	}

	const goToTurnoPage = () => {
		router.push(`/diretor/turnos/${props.course}/${props.shift}`);
	};

	function openInfoModal() {
		infoModal.value?.open();
	}
	//#endregion -------------- Functions --------------

	//#region -------------- Derivations --------------
	const activeRoomEntry = computed(() => roomData[activeRoomId.value]);
	//#endregion -------------- Derivations --------------
</script>

<style scoped>
	.content {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
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

		&.no-bg {
			background-color: var(--color-background);
			border: 2px solid #5e779b;
			cursor: not-allowed;
		}

		&:hover {
			background-color: #485c77;
		}

		&.success {
			background-color: #008a00;
			border: none;

			&:hover {
				background-color: #146b14;
			}

			&:disabled {
				background-color: #5c5c5c;
				cursor: not-allowed;
			}
		}

		&.cancel {
			background-color: #b14d57;
			border: none;

			&:hover {
				background-color: #b62446;
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
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	:global(.body) {
		height: 95% !important;
	}

	#roomsCard {
		overflow-y: hidden !important;
	}

	.dash-content .roomListContainer {
		height: 100%;
		overflow-y: auto;
	}

	.dash-content .left {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.dash-content .right .info {
		display: grid;
		grid-template-rows: 1fr auto;
		padding: 10px 20px;
		height: 100%;
	}

	.dash-content .right .propertyList {
		/* padding: 10px 20px; */
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.dash-content .right h3 {
		font-weight: bolder;
	}

	.dash-content .right .available-status {
		span {
			font-weight: bolder;
			color: #4ade80;
		}

		&.negative span {
			color: #b14d57;
		}
	}

	.dash-content .right .available-status-note {
		span {
			color: var(--color-text);
		}
	}

	.dash-content .right .controls {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 20px;
		width: 100%;
	}
	/*#endregion -------------- Content -------------- */
</style>
