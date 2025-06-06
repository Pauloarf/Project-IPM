<template>
	<div class="page-container">
		<SideBar :isExpanded="is_expanded" @toggle="toggleSidebar" />

		<div :class="['page-content', { 'content-expanded': is_expanded }]">
			<div class="page-header">
				<h1>PEDIDOS</h1>
				<button class="page-icon-button">
					<span class="material-icons" @click="openInfoModal">info</span>
				</button>
			</div>

			<div class="content">
				<BaseCard title="Pedidos" id="pedidosCard" header-align="space-between">
					<template #header-right>
						<div class="search-bar">
							<span class="material-icons">search</span>
							<input
								v-model="search"
								placeholder="Pesquise por um pedido"
								type="text"
								aria-label="search"
							/>
						</div>
					</template>
					<div class="list-pedidos">
						<MessageCard
							v-for="(entry, index) in filteredMensagens"
							:key="index"
							:message="entry"
							:maxContentLength="256"
							@click="openRequest(entry)"
						/>
						<p style="align-self: center" v-if="filteredMensagens.length === 0">
							Sem mensagens para mostrar.
						</p>
					</div>
				</BaseCard>
			</div>
		</div>
	</div>
	<ShiftExchangeResponseModal
		v-if="shiftRequest"
		ref="fucky"
		:keyValueList="shiftRequest.keyValueList"
		:from="shiftRequest.from"
		:to="shiftRequest.to"
		:shifts="shiftRequest.shifts"
		@close="closeModal"
		@approve="shiftApproved(currentEntry!)"
		@reject="shiftRejected(currentEntry!)"
	/>
	<RoomExchangeResponseModal
		v-if="roomRequest"
		ref="fucky2"
		:keyValueList="roomRequest.keyValueList"
		:from="roomRequest.from"
		:to="roomRequest.to"
		:shifts="roomRequest.shifts"
		@close="closeModal"
		@approve="roomApproved(currentEntry!)"
		@reject="roomRejected(currentEntry!)"
	/>
	<ModalBase ref="infoModal">
		<InformationCard
			title="Ajuda"
			description="Esta página foi concebida para fornecer uma visão geral dos pedidos recebidos e um meio de resposta a esses pedidos."
			:topics="['Últimas mensagens/pedidos recebidos.', 'Visão de pedidos específicos.']"
		></InformationCard>
	</ModalBase>
</template>

<script setup lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	//#region -------------- Imports --------------
	import "@/assets/css/director.css";
	import { ref, computed, nextTick, onMounted } from "vue";

	import SideBar from "../components/SideBar.vue";
	import BaseCard from "@/components/BaseCard.vue";
	import MessageCard from "@/components/MessageCard.vue";
	import ShiftExchangeResponseModal from "@/components/ShiftExchangeResponseModal.vue";
	import RoomExchangeResponseModal from "@/components/RoomExchangeResponseModal.vue";
	import InformationCard from "@/components/InformationCard.vue";
	import ModalBase from "@/components/ModalBase.vue";
	
	import type { Shift } from "@/components/ShiftCalendar.vue";
	import type { Time, Weekday } from "@/data/time";
	import type { NotificationMessage } from "@/components/MessageCard.vue";
	import { APIWrapper } from "@/lib/api";
	import type {
		APIRequest,
		APITeacher,
		APIClassroom,
		APIAllocation,
		APIBuilding,
		APICourse,
		APIShift,
		APIStudent,
	} from "@/lib/api";
	//#endregion

	//#region -------------- Types --------------
	interface InternalNotificationMessage extends NotificationMessage {
		senderId: number;
		from: number;
		to: number;
		awnsered: boolean;
		shiftId: number;
	}
	//#endregion -------------- Types --------------

	//#region -------------- API Setup --------------
	const requestApi = APIWrapper.local<APIRequest[]>(3000, "requests");
	const teacherApi = APIWrapper.local<APITeacher[]>(3000, "teachers");
	const classroomApi = APIWrapper.local<APIClassroom[]>(3000, "classrooms");
	const allocationApi = APIWrapper.local<APIAllocation[]>(3000, "allocations");
	const buildingsApi = APIWrapper.local<APIBuilding[]>(3000, "buildings");
	const coursesApi = APIWrapper.local<APICourse[]>(3000, "courses");
	const shiftsApi = APIWrapper.local<APIShift[]>(3000, "shifts");
	const studentApi = APIWrapper.local<APIStudent[]>(3000, "students");
	//#endregion

	//#region -------------- Reactive State --------------
	const is_expanded = ref(false);
	const search = ref("");
	const roomRequest = ref<Record<string, any>>();
	const shiftRequest = ref<Record<string, any>>();
	const shift = ref(false);
	const room = ref(false);
	const fucky = ref();
	const fucky2 = ref();
	const response = ref<APIRequest[]>([]);
	const infoModal = ref<InstanceType<typeof ModalBase>>();
	const currentEntry = ref<InternalNotificationMessage>();
	//#endregion

	//#region -------------- Lifecycle --------------
	onMounted(() => {
		fetchMensagens();
	});
	//#endregion

	//#region -------------- Data Fetching --------------
	const fetchMensagens = async () => {
		const requests = (await requestApi.fetch()) ?? [];

		const enriched = await Promise.all(
			requests.map(async (req) => {
				let name = "Sem Nome";

				if (req.kind === 1 && req.studentId) {
					const student = await studentApi.fetch(`${req.studentId}`);
					name = student?.name ?? "Sem Nome";
				} else if (req.kind === 0 && req.teacherId) {
					const teacher = await teacherApi.fetch(`${req.teacherId}`);
					name = teacher?.name ?? "Sem Nome";
				}

				return { ...req, name };
			}),
		);

		// Ordena: não lidas primeiro, depois por timestamp
		enriched.sort((a, b) => {
			if (a.requestSeen === b.requestSeen) {
				const timeA = new Date(a.requestTimestamp ?? 0).getTime();
				const timeB = new Date(b.requestTimestamp ?? 0).getTime();
				return timeB - timeA;
			}
			return a.requestSeen ? 1 : -1;
		});

		response.value = enriched;
	};

	const fromShift = async (entry: InternalNotificationMessage) => {
		const shift = await shiftsApi.fetch(`${entry.from}`);
		return shift?.name;
	};

	const toShift = async (entry: InternalNotificationMessage) => {
		const shift = await shiftsApi.fetch(`${entry.to}`);
		return shift?.name;
	};

	const fromClassroom = async (entry: InternalNotificationMessage) => {
		const classroom = await classroomApi.fetch(`${entry.from}`);
		return classroom?.name;
	};

	const toClassroom = async (entry: InternalNotificationMessage) => {
		const classroom = await classroomApi.fetch(`${entry.to}`);
		return classroom?.name;
	};

	const getCourseAbv = async (entry: InternalNotificationMessage) => {
		const shift = await shiftsApi.fetch(`${entry.from}`);
		const course = await coursesApi.fetch(`${shift?.courseId}`);
		return course?.abbreviation;
	};

	const getCourseByRoom = async (entry: InternalNotificationMessage) => {
		const course = await coursesApi.fetch({
			limit: 1,
			filter: {
				teacherId: entry.sender,
				classroomId: entry.from,
			},
		});
		return (course ?? [])[0];
	}

	const getCourseName = async (entry: InternalNotificationMessage) => {
		const shift = await shiftsApi.fetch(`${entry.from}`);
		const course = await coursesApi.fetch(`${shift?.courseId}`);
		return course?.name;
	};

	const getToBuilding = async (entry: InternalNotificationMessage) => {
		const classroom = await classroomApi.fetch(`${entry.to}`);
		const build = await buildingsApi.fetch(`${classroom?.buildingId}`);
		return build?.abbreviation;
	};

	const getFromBuilding = async (entry: InternalNotificationMessage) => {
		const classroom = await classroomApi.fetch(`${entry.from}`);
		const build = await buildingsApi.fetch(`${classroom?.buildingId}`);
		return build?.abbreviation;
	};

	const getStudentCount = async (entry: InternalNotificationMessage) => {
		let ret = 0;
		const course = await coursesApi.fetch({
			limit: 1,
			filter: {
				teacherId: entry.sender,
				classroomId: entry.from,
			},
		});
		const courseId = (course ?? [])[0]?.id;
		const students = await studentApi.fetch();
		const shifts = await shiftsApi.fetch();
		const shiftsFromCourse = (shifts ?? []).filter((s) => s.courseId == courseId);
		(students ?? []).forEach(student => {
			const isEnrolled = shiftsFromCourse.some(shift =>
				student.enrolled.includes(shift.id)
			);
			if (isEnrolled) ret++;
		});
		return ret;
	};

	const getStudent = async (entry: InternalNotificationMessage) => {
		const student = await studentApi.fetch(`${entry.senderId}`);
		return student;
	};
	//#endregion

	//#region -------------- Computed Properties --------------
	const mensagens = computed<InternalNotificationMessage[]>(() => {
		return (response.value ?? [])
			.map((req) => ({
				id: String(req.id),
				sender: req.name ?? "Sem Nome",
				senderId: req.kind === 0 ? req.teacherId : req.studentId,
				content: req.kind === 0 ? "Troca de Sala" : "Troca de Turno",
				timestamp: new Date(
					typeof req.requestTimestamp === "number"
						? req.requestTimestamp < 1e12
							? req.requestTimestamp * 1000
							: req.requestTimestamp
						: Date.now(),
				),
				from: req.kind === 0 ? req.fromClassroomId : req.fromShiftId,
				to: req.kind === 0 ? req.toClassroomId : req.toShiftId,
				read: req.requestSeen ?? false,
				awnsered: (req.response != undefined),
				shiftId: req.kind === 0 ? req.shiftId : 0
			}))
			.sort((a, b) => {
				if (a.read === b.read) {
					return b.timestamp.getTime() - a.timestamp.getTime(); // Ordem decrescente
				}
				return a.read ? 1 : -1;
			});
	});

	const filteredMensagens = computed(() => {
		const searchTerm = search.value?.toLowerCase() ?? "";
		return mensagens.value.filter((msg) => {
			if (!msg || !msg.sender || !msg.content || msg.awnsered) return false;
			if (searchTerm === "") return true;
			return (
				msg.sender.toLowerCase().includes(searchTerm) ||
				msg.content.toLowerCase().includes(searchTerm)
			);
		});
	});
	//#endregion

	//#region -------------- UI Actions --------------
	const toggleSidebar = () => {
		is_expanded.value = !is_expanded.value;
	};

	const markAsRead = async (id: number) => {
		const item = response.value.find((res) => res.id === id);
		if (!item) return;
		item.requestSeen = true;
		try {
			await requestApi.update(id, item);
		} catch (err) {
			console.error("Erro ao atualizar requestSeen:", err);
		}
	};

	const markAsAwnsered = (id: number) => {
		const item = response.value.find((res) => res.id === id);
		if (!item) return;
		item.response = true;
	};

	const getStudentShifts = async (entry: any): Promise<Shift[]> => {
		const student = await studentApi.fetch(`${entry.senderId}`);
		const toShift = await shiftsApi.fetch(`${entry.to}`);
		const studentShifts: Shift[] = [];

		if (student) {
			const shifts = await shiftsApi.fetch({ filter: { id: student.enrolled } });
			if (shifts && shifts.length > 0) {
				for (const shift of shifts) {
					const classroom = await classroomApi.fetch({ filter: { id: shift.classroomId } });
					const course = await coursesApi.fetch({ filter: { id: shift.courseId } });

					if (classroom?.length && course?.length) {
						const building = await buildingsApi.fetch({ filter: { id: classroom[0].buildingId } });
						if (building?.length) {
							studentShifts.push({
								day: shift.day as Weekday,
								from: shift.from as Time,
								to: shift.to as Time,
								name: course[0].abbreviation,
								course: shift.name,
								classroom: `${building[0].abbreviation} - ${classroom[0].name}`,
							});
						}
					}
				}
			}
		}
		if (toShift) {
			const classroom = await classroomApi.fetch({ filter: { id: toShift.classroomId } });
			const course = await coursesApi.fetch({ filter: { id: toShift.courseId } });

			if (classroom?.length && course?.length) {
				const building = await buildingsApi.fetch({ filter: { id: classroom[0].buildingId } });
				if (building?.length) {
					studentShifts.push({
						day: toShift.day as Weekday,
						from: toShift.from as Time,
						to: toShift.to as Time,
						name: course[0].abbreviation,
						course: toShift.name,
						classroom: `${building[0].abbreviation} - ${classroom[0].name}`,
						color: "#2196F3"
					});
				}
			}
		}
	return studentShifts;
	}

	const openRequest = async (entry: InternalNotificationMessage) => {
		currentEntry.value = entry;
		room.value = entry.content === "Troca de Sala"; // || entry.kind === 0;
		shift.value = entry.content === "Troca de Turno"; // || entry.kind === 1;

		if (room.value) {
			const fromClass = await fromClassroom(entry);
			const toClass = await toClassroom(entry);
			const fromBuild = await getFromBuilding(entry);
			const toBuild = await getToBuilding(entry);
			const stdCount = await getStudentCount(entry);
			const course = await getCourseByRoom(entry);
			roomRequest.value = {
				keyValueList: {
					"Unidade Curricular": `[${course.abbreviation}] - ${course.name}`,
					Docente: entry.sender,
					Turno: (await shiftsApi.fetch(`${entry.shiftId}`))?.name,
					"Alunos Inscritos": stdCount,
				},
				from: {
					text: `${fromBuild} - ${fromClass}`,
					barColor: "#4CAF50",
				},
				to: {
					text: `${toBuild} - ${toClass}`,
					barColor: "#2196F3",
				},
			};
			await nextTick();
			fucky2.value.open();
		} else {
			const shifts = await getStudentShifts(entry);
			const courseName = await getCourseName(entry);
			const courseAbv = await getCourseAbv(entry);
			const from = await fromShift(entry);
			const to = await toShift(entry);
			const student = await getStudent(entry);
			console.log(shifts);
			shiftRequest.value = {
				keyValueList: {
					"Unidade Curricular": `[${courseAbv}] - ${courseName}`,
					Aluno: entry.sender,
					Estatuto: student?.specialStatus ? "Sim" : "Não",
				},
				from: {
					text: from,
					barColor: "#4CAF50",
				},
				to: {
					text: to,
					barColor: "#2196F3",
				},
				shifts: shifts,
			};
			await nextTick();
			fucky.value.open();
		}

		await markAsRead(Number(entry.id));
	};

	const closeModal = () => {
		room.value = false;
		shift.value = false;
	};

	function openInfoModal() {
		infoModal.value?.open();
	}

	async function shiftApproved(entry: InternalNotificationMessage){
		// Atualizar o pedido de request
		const request = await requestApi.fetch(`${entry.id}`);
		request!.response = true;

		//Alterar o valor do enrolled
		const student = await studentApi.fetch(`${entry.senderId}`);
		const copy = await studentApi.fetch(`${entry.senderId}`);
		console.log(copy);
		if(student){
			student.enrolled = student?.enrolled.filter((s) => s != entry.from);
			student.enrolled.push(entry.to);
		}
		console.log(student);

		//Remover a alocation
		const allocation = await allocationApi.fetch({
			limit: 1,
			filter:{
				shiftId: entry.from,
				studentId: entry.senderId
			}
		})
		if(allocation){
			allocation[0].shiftId = entry.to;
		}

		//Alterar os total students in shifts
		const oldShift = await shiftsApi.fetch(`${entry.from}`);
		if(oldShift){
			oldShift.totalStudentsRegistered--;
		}

		const newShift = await shiftsApi.fetch(`${entry.to}`);
		if(newShift){
			newShift.totalStudentsRegistered++;
		}


		try {
			await requestApi.update(entry.id, request!);
			await studentApi.update(entry.senderId, student!);
			await allocationApi.update((allocation ?? [])[0].id, (allocation ?? [])[0]);
			await shiftsApi.update(entry.from, oldShift!);
			await shiftsApi.update(entry.to, newShift!);

			markAsAwnsered(Number(entry.id));
		} catch (err) {
			console.error("Erro ao atualizar o turno", err);
		}

		currentEntry.value = undefined;
	}

	async function shiftRejected(entry: InternalNotificationMessage){
		// Atualizar o pedido de request
		const request = await requestApi.fetch(`${entry.id}`);
		request!.response = false;

		try {
			await requestApi.update(entry.id, request!);

			markAsAwnsered(Number(entry.id));
		} catch (err) {
			console.error("Erro a rejeitar", err);
		}

		currentEntry.value = undefined;
	}

	async function roomApproved(entry: InternalNotificationMessage){
		// Atualizar o pedido de request
		const request = await requestApi.fetch(`${entry.id}`);
		request!.response = true;

		const shift = await shiftsApi.fetch(`${entry.shiftId}`);
		if(shift) shift.classroomId = entry.to;

		try {
			await requestApi.update(entry.id, request!);
			await shiftsApi.update(entry.from, shift!);


			markAsAwnsered(Number(entry.id));
		} catch (err) {
			console.error("Erro a rejeitar", err);
		}

		currentEntry.value = undefined;
	}

	async function roomRejected(entry: InternalNotificationMessage){
		// Atualizar o pedido de request
		const request = await requestApi.fetch(`${entry.id}`);
		request!.response = false;

		try {
			await requestApi.update(entry.id, request!);

			markAsAwnsered(Number(entry.id));
		} catch (err) {
			console.error("Erro a rejeitar", err);
		}

		currentEntry.value = undefined;
	}
	//#endregion
</script>

<style scoped>
	.content {
		width: 100%;
		height: 100%;
	}

	.content #pedidosCard {
		display: flex;
		height: 100%;
		overflow: hidden;
	}

	.content .list-pedidos {
		display: flex;
		flex-direction: column;
		padding-top: 10px;
		gap: 10px;
		height: 100%;
		overflow-y: auto;
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
</style>
