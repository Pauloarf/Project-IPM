<template>
	<div class="page-container">
		<SideBar :isExpanded="is_expanded" @toggle="toggleSidebar" />

		<div :class="['page-content', { 'content-expanded': is_expanded }]">
			<div class="page-header">
				<h1>PAINEL PRINCIPAL</h1>
				<button class="page-icon-button">
					<span class="material-icons" @click="openInfoModal">info</span>
				</button>
			</div>

			<div class="content">
				<div class="upper">
					<BaseCard title="Alunos">
						<div class="cardHeader">
							<div class="alunosCardBody">
								<CircleProgress :value="toAllocateCounter" :max="students!.length" />
								<div class="metaAlunosAtribuicao">
									<p>Alunos atribuídos: <span class="green">{{ students!.length - toAllocateCounter }}</span></p>
									<p>Alunos não atribuídos: <span class="red">{{ toAllocateCounter }}</span></p>
									<button class="custom-button" @click="goToAlunosPage">Atribuir Manualmente</button>
								</div>
								<div class="statusPublicacaoHorarios">
									<p>
										Horários
										<span :class="horariosPublicados ? 'green' : 'red'">
											{{ horariosPublicados ? "publicados" : "não publicados" }}
										</span>
									</p>
									<button class="custom-button" @click="publish">Publicar Horários</button>
								</div>
							</div>
							<button class="custom-button" @click="goToAlunosPage">
								<span class="material-icons">people</span>
								Ver Alunos
							</button>
						</div>
					</BaseCard>
					<BaseCard title="Pedidos">
						<div class="cardHeader">
							<div class="pedidosCardBody">
								<MessageCard
									v-for="(entry, index) in mensagensTeste"
									:key="index"
									:message="entry"
									:maxContentLength="256"
								/>
							</div>
							<button class="custom-button" @click="goToPedidosPage">
								<span class="material-icons">mail</span>
								Mais Pedidos
							</button>
						</div>
					</BaseCard>
				</div>
				<BaseCard title="Turnos" id="turnosCard">
					<div class="cardHeader">
						<div class="turnosListContainer">
							<OccupancyCard
								v-for="(entry, index) in accordionData"
								:key="index"
								:title="entry.title"
								:media="entry.media"
								:minima="entry.minima"
								:maxima="entry.maxima"
							/>
						</div>
						<button class="custom-button" @click="goToTurnos">
							<span class="material-icons">calendar_month</span>
							Ver Turnos
						</button>
					</div>
				</BaseCard>
			</div>
		</div>
	</div>

	<ModalBase ref="infoModal">
		<InformationCard
			title="Informações"
			description="Esta página foi concebida para fornecer uma visão geral rápida e eficiente das informações mais relevantes relacionadas com a gestão de turnos."
			:topics="['Últimas mensagens/pedidos recebidos.', 'Ocupação geral dos turnos.', 'Observação geral do número de alunos não alocados.']"
		></InformationCard>
	</ModalBase>
</template>

<script setup lang="ts">
	import "@/assets/css/director.css";

	import { ref } from "vue";
	import { useRouter } from "vue-router";

	import SideBar from "../components/SideBar.vue";
	import BaseCard from "@/components/BaseCard.vue";
	import CircleProgress from "@/components/CircleProgress.vue";
	import MessageCard from "@/components/MessageCard.vue";
	import OccupancyCard from "@/components/OccupancyCard.vue";
	import ModalBase from "@/components/ModalBase.vue";
	import InformationCard from "@/components/InformationCard.vue";
	import { type APIControl, APIWrapper, type APICourse, type APIShift, type APIStudent, type APIConflict, type APIRequest } from "@/lib/api";
	import type { AccordionItem } from "@/components/OccupancyAccordion.vue";

	//#region -------------- Data --------------

	type ShiftMetric = { occupancy: number; entry: APIShift };
	type SemesterMetric = { total: number; count: number; min: number; max: number; courses: AccordionItem[] };
	
	const shiftsAPI = APIWrapper.local<APIShift[]>(3000, "shifts");
	const coursesAPI = APIWrapper.local<APICourse[]>(3000, "courses");
	const studentsAPI = APIWrapper.local<APIStudent[]>(3000, "students");
	const conflictsAPI = APIWrapper.local<APIConflict[]>(3000, "conflicts");
	const requestsAPI = APIWrapper.local<APIRequest[]>(3000, "requests");
	
	const accordionData: AccordionItem[] = [];
	const semestersMetrics: Record<string, SemesterMetric> = {}; 
	const courseMetrics : Record<number, {max:number, min: number, total: number, count: number, shifts: ShiftMetric[]}> = {};
	
	const shifts = await shiftsAPI.fetch();
	const courses = await coursesAPI.fetch();
	const students = await studentsAPI.fetch();
	const conflicts = await conflictsAPI.fetch();
	const requests = await requestsAPI.fetch();

	if (
		(shifts !== undefined && shifts.length > 0) && 
		(courses !== undefined && courses.length > 0) &&
		(students !== undefined && students.length > 0)
	) {
		for (const shift of shifts) {
			const course = courses.find(c => c.id === shift.courseId);
			if (!course) continue;
			const courseId = course.id;
			const registeredStudents = students.filter(s => s.enrolled.includes(shift.id)).length;

			if (!courseMetrics[courseId]) {
				courseMetrics[courseId] = {max: 0, min: 100, total: 0, count: 0, shifts: []};
			}

			const shiftOccupancy = (registeredStudents / shift.totalStudentsRegistered) * 100;

			if (shiftOccupancy > courseMetrics[courseId].max) courseMetrics[courseId].max = shiftOccupancy;
			else if (shiftOccupancy < courseMetrics[courseId].min) courseMetrics[courseId].min = shiftOccupancy;
			
			courseMetrics[courseId].total += registeredStudents;
			courseMetrics[courseId].count += 1;
			courseMetrics[courseId].shifts.push({occupancy: shiftOccupancy, entry: shift});
		}

		for (const courseId in courseMetrics) {
			const metric = courseMetrics[Number(courseId)];
			const course = courses.find(c => c.id === Number(courseId));
			if (!course) continue;

			const media = (metric.total / metric.count) * 10;
			const courseItem : AccordionItem = {
				title: course.abbreviation,
				maxima: metric.max,
				media: media,
				minima: metric.min
			};

			const key = `${course.year}:${course.semester}`;
			if (!semestersMetrics[key]) {
				semestersMetrics[key] = { total: 0, count: 0, max: 0, min: 100, courses: [] };
			}

			if (semestersMetrics[key].max < metric.max) semestersMetrics[key].max = metric.max;
			else if (semestersMetrics[key].min > metric.min) semestersMetrics[key].min = metric.min;

			semestersMetrics[key].total += media;
			semestersMetrics[key].count += 1;
			semestersMetrics[key].courses.push(courseItem);
		}
	}

	for (const semester in semestersMetrics) {
		const data = semestersMetrics[semester];
		const year = semester.split(":")[0];
		const numSemester = semester.split(":")[1];
		accordionData.push({
			title: `${year}º Ano ${numSemester}º Semestre`,
			maxima: data.max,
			minima: data.min,
			media: (data.total / data.count)
		});
	}

	const horariosPublicados = ref<boolean>(false);
	const controlAPI = APIWrapper.local<APIControl[]>(3000, "_control");
	const control = await controlAPI.fetch();
	
	if (control && control.length > 0) horariosPublicados.value = (control[0].published === 2) ? true : false;

	let toAllocateCounter = 0;
	if ((students && students.length > 0) && (conflicts && conflicts.length > 0)) {
		for (const student of students) {
			if (conflicts.some(c => c.studentId === student.id)) toAllocateCounter += 1;
		}
	}

	// TODO Fetch from API last 2 requests unseen. Only 2, not more :)
	type mensagem = {
		id: string,
		sender: string,
		content: string,
		timestamp: Date,
		read: boolean
	}
	const mensagens = ref<mensagem[]>([]);
	if (requests && requests.length > 0) {
		const requestsSorted = requests.sort((r1, r2) => r1.requestTimestamp - r2.requestTimestamp).slice(0, 1);
		for (let i = 0 ; i < 2 ; i++) {
			const request = requestsSorted[i];
			// TODO kind here
			// mensagens.value.push({
			// 	id: request.id,
			// 	sender: request.
			// })
		}
	}
	
	const mensagensTeste = [
		{
			id: "msg1",
			sender: "Joana Carvalho",
			content: "Bom dia! Já enviaste o relatório de estágio?",
			timestamp: new Date("2025-04-23T08:15:00"),
			read: false,
		},
		{
			id: "msg2",
			sender: "Carlos Duarte",
			content:
				"Reunião marcada para amanhã às 14h na sala 2.1.Reunião marcada para amanhã às 14h na sala 2.1.",
			timestamp: new Date("2025-04-22T18:45:00"),
			read: false,
		},
	];
	//#endregion -------------- Data --------------

	//#region -------------- Functions --------------
	const infoModal = ref<InstanceType<typeof ModalBase>>();
	const is_expanded = ref(false);
	const router = useRouter();

	const toggleSidebar = () => {
		is_expanded.value = !is_expanded.value;
	};

	function goToAlunosPage() {
		router.push("/diretor/alunos");
	}

	function goToPedidosPage() {
		router.push("/diretor/pedidos");
	}

	function goToTurnos() {
		router.push("/diretor/turnos");
	}

	function openInfoModal() {
		infoModal.value?.open();
	}

	function publish() {
		horariosPublicados.value = true;
		controlAPI.update(0, {published: 2});
	}
	//#endregion -------------- Functions --------------
</script>

<style scoped>
	/* .green {
		color: #22c55e;
		font-weight: 600;
	}

	.red {
		color: #ef4444;
		font-weight: 600;
	} */

	.content {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.cardHeader {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: 15px;
		height: 100%;
	}

	.alunosCardBody {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		width: 100%;
		overflow: hidden;
	}

	.alunosCardBody p {
		font-size: 20px;
		font-weight: 600;
		color: white;
	}

	.metaAlunosAtribuicao {
		display: flex;
		flex-direction: column;
		align-items: start;
		padding-left: 15px;
		justify-content: center;
	}

	.pedidosCardBody {
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow: hidden;
	}

	.statusPublicacaoHorarios {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 15px;
	}

	.statusPublicacaoHorarios p {
		font-size: 20px;
		font-weight: 600;
		color: white;
	}

	.content .upper {
		display: grid;
		grid-template-columns: 55% 45%;
		gap: 15px;
		padding-bottom: 15px;
		padding-right: 15px;
	}

	:global(.body) {
		height: 90% !important;
	}

	#turnosCard {
		overflow-y: hidden !important;
	}

	.content .turnosListContainer {
		overflow-y: auto;
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
		padding: 5px 40px;
		cursor: pointer;
	}

	.custom-button:hover {
		background-color: #456288;
	}
</style>
