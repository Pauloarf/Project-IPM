<template>
	<div class="page-container">
		<SideBar :isExpanded="is_expanded" @toggle="toggleSidebar" />

		<div :class="['page-content', { 'content-expanded': is_expanded }]">
			<div class="page-header">
				<h1>TURNOS</h1>
				<button class="page-icon-button">
					<span class="material-icons">info</span>
				</button>
			</div>

			<div class="content">
				<div class="left">
					<BaseCard title="Turnos" header-align="space-between" id="turnosCard">
						<template #header-right>
							<div class="button-container">
								<span class="button-label">Calendário</span>
								<div class="switch-container">
									<label class="switch">
										<input type="checkbox" v-model="isOn" @change="() => viewModeStore.set(isOn)" />
										<span class="slider">
											<span class="toggle-text" :class="{ left: isOn, right: !isOn }">
												{{ isOn ? "ON" : "OFF" }}
											</span>
										</span>
									</label>
								</div>
							</div>
						</template>
						<div class="cardBody">
							<template v-if="!isOn">
								<OccupancyAccordion :itens="filteredAccordionData" />
							</template>
							<template v-else>
								<template
									v-if="
										selectedFilters.yearSemester.length === 0 && selectedFilters.uc.length === 0
									"
								>
									<p>Selecione pelo menos um <b>filtro</b> para aparecer informação...</p>
								</template>
								<template v-else>
									<div class="calendar">
										<ShiftCalendar id="calendarioCard" height="auto" :shifts="calendarioData" />
									</div>
								</template>
							</template>
						</div>
					</BaseCard>
				</div>

				<div class="right">
					<div class="search-bar">
						<span class="material-icons">search</span>
						<input
							v-model="search"
							placeholder="Pesquise por uma unidade curricular"
							type="text"
							aria-label="search"
						/>
					</div>
					<FiltersBox
						title="Filtros"
						:filterGroups="courseFilterGroups"
						:multiSelect="true"
						@filter-change="(filters) => onFilterChange(filters, 'yearSemester')"
						@filter-change-diff="
							(group, value, added) => onFilterChangeDiff(group, value, added, 'yearSemester')
						"
						ref="filters1"
					></FiltersBox>
					<FiltersBox
						title="Filtros"
						:filterGroups="ucFilterGroups"
						:multiSelect="true"
						@filter-change="(filters) => onFilterChange(filters, 'uc')"
						@filter-change-diff="
							(group, value, added) => onFilterChangeDiff(group, value, added, 'uc')
						"
						ref="filters2"
					></FiltersBox>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import "@/assets/css/director.css";

	import { computed, ref } from "vue";

	import SideBar from "../components/SideBar.vue";
	import BaseCard from "@/components/BaseCard.vue";
	import FiltersBox from "@/components/FiltersBox.vue";
	import OccupancyAccordion from "@/components/OccupancyAccordion.vue";
	import ShiftCalendar, { type Shift } from "@/components/ShiftCalendar.vue";
	import { useDiretorTurnoFiltersStore } from "@/data/store/filters";
	import { useDiretorTurnosViewModeStore } from "@/data/store/turnoViewMode";
	import { APIWrapper } from "@/lib/api";
	import type { APIShift, APICourse, APIStudent, APIClassroom, APIBuilding } from "@/lib/api";
	import type { AccordionItem } from "@/components/OccupancyAccordion.vue";
	import { formatTime, type Time, type Weekday } from "@/data/time";

	//#region -------------- Data --------------
	const courseFilterGroups = ref({
		status: [
			{ value: "1a", label: "1º Ano" },
			{ value: "2a", label: "2º Ano" },
			{ value: "3a", label: "3º Ano" },
			{ value: "1s", label: "1º Semestre" },
			{ value: "2s", label: "2º Semestre" },
		],
	});

	type FilterUcData = {
		value: string;
		label: string;
	};

	const calendarioData = ref<Shift[]>([]);

	const ucFilterGroups = ref<{ status: FilterUcData[] }>({ status: [] });

	type ShiftMetric = { occupancy: number; entry: APIShift };
	type SemesterMetric = {
		total: number;
		count: number;
		min: number;
		max: number;
		courses: AccordionItem[];
	};

	const shiftsAPI = APIWrapper.local<APIShift[]>(3000, "shifts");
	const coursesAPI = APIWrapper.local<APICourse[]>(3000, "courses");
	const studentsAPI = APIWrapper.local<APIStudent[]>(3000, "students");
	const classroomsAPI = APIWrapper.local<APIClassroom[]>(3000, "classrooms");
	const buildingsAPI = APIWrapper.local<APIBuilding[]>(3000, "buildings");

	const accordionData: AccordionItem[] = [];
	const semestersMetrics: Record<string, SemesterMetric> = {};
	const courseMetrics: Record<
		number,
		{ max: number; min: number; total: number; count: number; shifts: ShiftMetric[] }
	> = {};

	const shifts = await shiftsAPI.fetch();
	const courses = await coursesAPI.fetch();
	const students = await studentsAPI.fetch();
	const classrooms = await classroomsAPI.fetch();
	const buildings = await buildingsAPI.fetch();

	const updateCalendarioData = () => {
		if (!shifts || !courses || !students || !classrooms || !buildings) return;

		const yearSemesterFilters = selectedFilters.value.yearSemester;
		const ucFilters = selectedFilters.value.uc.map((uc) => uc.toLowerCase());

		const filteredCourses = courses.filter((course) => {
			const matchesYearSemester =
				yearSemesterFilters.length === 0 ||
				yearSemesterFilters.some(
					(filter) =>
						(filter.charAt(1) === "a" && course.year.toString().includes(filter.charAt(0))) ||
						(filter.charAt(1) === "s" && course.semester.toString().includes(filter.charAt(0))),
				);

			const matchesUC =
				ucFilters.length === 0 || ucFilters.includes(course.abbreviation.toLowerCase());

			return matchesYearSemester && matchesUC;
		});

		const filteredCourseIds = filteredCourses.map((course) => course.id);
		const filteredShifts = shifts.filter((shift) => filteredCourseIds.includes(shift.courseId));

		calendarioData.value = filteredShifts.map((shift) => {
			const course = courses.find((c) => c.id === shift.courseId);
			const classroom = classrooms.find((c) => c.id === shift.classroomId);
			const building = buildings.find((b) => b.id === classroom?.buildingId);

			return {
				day: shift.day as Weekday,
				from: shift.from as Time,
				to: shift.to as Time,
				course: course!.abbreviation,
				name: `- ${shift.name}`,
				classroom: `${building?.abbreviation ?? "N/A"} - ${classroom?.name ?? "N/A"}`,
			};
		});
	};

	if (
		shifts !== undefined &&
		shifts.length > 0 &&
		courses !== undefined &&
		courses.length > 0 &&
		students !== undefined &&
		students.length > 0
	) {
		for (const course of courses) {
			ucFilterGroups.value.status.push({
				value: course.abbreviation.toLowerCase(),
				label: course.abbreviation,
			});
		}

		for (const shift of shifts) {
			const course = courses.find((c) => c.id === shift.courseId);
			if (!course) continue;
			const courseId = course.id;
			const registeredStudents = students.filter((s) => s.enrolled.includes(shift.id)).length;

			if (!courseMetrics[courseId]) {
				courseMetrics[courseId] = { max: 0, min: 100, total: 0, count: 0, shifts: [] };
			}

			const shiftOccupancy = (registeredStudents / shift.totalStudentsRegistered) * 100;

			if (shiftOccupancy > courseMetrics[courseId].max)
				courseMetrics[courseId].max = shiftOccupancy;
			else if (shiftOccupancy < courseMetrics[courseId].min)
				courseMetrics[courseId].min = shiftOccupancy;

			courseMetrics[courseId].total += registeredStudents;
			courseMetrics[courseId].count += 1;
			courseMetrics[courseId].shifts.push({ occupancy: shiftOccupancy, entry: shift });
		}

		for (const courseId in courseMetrics) {
			const metric = courseMetrics[Number(courseId)];
			const course = courses.find((c) => c.id === Number(courseId));
			if (!course) continue;

			const media = (metric.total / metric.count) * 10;
			const courseItem: AccordionItem = {
				title: course.abbreviation,
				maxima: +metric.max.toFixed(0),
				media: +media.toFixed(0),
				minima: +metric.min.toFixed(0),
				children: metric.shifts.map((s) => ({
					title: s.entry.name,
					descricao: `${s.entry.day} ${formatTime(s.entry.from as Time)} - ${formatTime(s.entry.to as Time)}`,
					media: +s.occupancy.toFixed(0),
					link: `/diretor/turnos/${course.abbreviation}/${s.entry.name}`,
				})),
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
			maxima: +data.max.toFixed(0),
			minima: +data.min.toFixed(0),
			media: +(data.total / data.count).toFixed(0),
			children: data.courses,
		});
	}

	const filteredAccordionData = computed<AccordionItem[]>(() => {
		const query = search.value.toLowerCase();
		const yearSemesterFilters = selectedFilters.value.yearSemester.map((f) => f.toLowerCase());
		const ucFilters = selectedFilters.value.uc.map((f) => f.toLowerCase());

		return accordionData
			.map((section) => {
				const sectionTitle = section.title.toLowerCase();

				const matchesYearSemester = yearSemesterFilters.every(
					(filter) =>
						(filter.charAt(1) === "a" &&
							sectionTitle.toLowerCase().includes(`${filter.charAt(0)}º ano`)) ||
						(filter.charAt(1) === "s" &&
							sectionTitle.toLowerCase().includes(`${filter.charAt(0)}º semestre`)),
				);

				if (!matchesYearSemester) return null;

				const filteredCourses = section.children!.filter((course) => {
					const title = course.title.toLowerCase();
					const descricao = course.descricao?.toLowerCase() || "";

					const matchesSearch = query === "" || title.includes(query) || descricao.includes(query);

					const matchesUCFilter =
						ucFilters.length === 0 || ucFilters.some((filter) => title.includes(filter));

					return matchesSearch && matchesUCFilter;
				});

				const shouldInclude = filteredCourses.length > 0;

				if (!shouldInclude) return null;

				return {
					...section,
					children: filteredCourses,
				} as AccordionItem;
			})
			.filter((item): item is AccordionItem => item !== null);
	});

	//#endregion -------------- Data --------------

	//#region -------------- Functions --------------
	const filterStore = useDiretorTurnoFiltersStore();
	const viewModeStore = useDiretorTurnosViewModeStore();

	const is_expanded = ref(false);
	const isOn = ref(viewModeStore.get());
	const search = ref("");
	const filters1 = ref<InstanceType<typeof FiltersBox>>();
	const filters2 = ref<InstanceType<typeof FiltersBox>>();

	const toggleSidebar = () => {
		is_expanded.value = !is_expanded.value;
	};

	const selectedFilters = ref({
		yearSemester: [] as string[],
		uc: [] as string[],
	});

	function onFilterChange(newFilters: { status: string[] }, filterType: "yearSemester" | "uc") {
		selectedFilters.value[filterType] = newFilters.status;
		updateCalendarioData();
	}

	function onFilterChangeDiff(
		groupName: string,
		value: string,
		added: boolean,
		filterType: "yearSemester" | "uc",
	) {
		// Cria um novo array para garantir a reatividade
		const newFilters = [...selectedFilters.value[filterType]];

		if (added) {
			if (!newFilters.includes(value)) {
				newFilters.push(value);
			}
		} else {
			const index = newFilters.indexOf(value);
			if (index !== -1) {
				newFilters.splice(index, 1);
			}
		}

		selectedFilters.value[filterType] = newFilters;
		filterStore.set(value, added);
		updateCalendarioData();
	}

	//#endregion -------------- Functions --------------
</script>

<style scoped>
	.content {
		display: grid;
		grid-template-columns: 75% 25%;
	}

	.content .left #turnosCard {
		height: 100%;
		margin-right: 15px;
		overflow: hidden;
	}

	.content .left {
		overflow: hidden;
		overflow-y: auto;
	}

	:global(.body) {
		height: 95% !important;
	}

	.content .left .cardBody {
		height: 100%;
		overflow-y: auto;
	}

	.cardBody p {
		text-align: center;
		font-size: 18px;
	}

	.cardBody b {
		font-weight: 600;
		color: white;
	}

	.calendar {
		width: 100%;
		height: 100%;
	}

	.content .right {
		display: grid;
		grid-template-rows: 5% 0.5fr 1fr;
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

	.button-container {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
	}

	.button-label {
		font-size: 18px;
		font-weight: 600;
		/* color: #a1a1aa; */
		color: #acacb5;
	}

	.switch-container {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 70px;
		height: 34px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #272b3c;
		transition: 0.4s;
		border-radius: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5px;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 26px;
		width: 26px;
		border-radius: 50%;
		left: 4px;
		bottom: 4px;
		background-color: #364459;
		transition: 0.4s;
	}

	input:checked + .slider:before {
		transform: translateX(36px);
	}

	.toggle-text {
		font-size: 14px;
		font-weight: 600;
		color: #a1a1aa;
		position: absolute;
		top: 5px;
		transition: 0.4s;
	}

	.toggle-text.left {
		left: 10px;
	}

	.toggle-text.right {
		left: calc(100% - 10px - 25px);
		/* right: 10px; */
	}
</style>
