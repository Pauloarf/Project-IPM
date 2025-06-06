<template>
	<div class="container">
		<BaseCard title="Horário">
			<div class="base">
				<div class="empty"></div>
				<div class="weekday" v-for="day in WEEKDAYS" :key="day">
					{{ day }}
				</div>
				<template v-for="cell in calendarGrid" :key="cell">
					<div v-if="cell._system" class="time">
						<div class="time-text">
							{{ cell.time }}
						</div>
					</div>
					<template v-else-if="cell.filled">
						<template v-if="cell.conflict || cell.multi">
							<div
								class="shift filled"
								:class="{ double: cell.double, conflict: true, multi: cell.multi }"
								:id="`calendarShift_${cell.weekdayIndex}_${cell.timeIndex}`"
								:style="{
									width: `${cell.conflictSize}%`,
									'margin-left': `${cell.conflictOffset}%`,
									'--shiftColor': cell.color || undefined,
								}"
							>
								<template v-if="cell.multi">
									<div
										v-for="inner in cell.multiData"
										:key="<any>inner"
										class="shift filled inner"
										:class="{ double: inner.double, conflict: true }"
										:style="{
											// width: `${cell.conflictSize}%`,
											// 'margin-left': `${cell.conflictOffset}%`,
											'--shiftColor': cell.color || undefined,
										}"
									>
										<div class="course-line">
											<div>{{ inner.course }}</div>
											<div>{{ inner.shift }}</div>
										</div>
										<div class="classroom">{{ inner.classroom }}</div>
									</div>
								</template>
								<template v-else>
									<div class="course-line">
										<div>{{ cell.course }}</div>
										<div>{{ cell.shift }}</div>
									</div>
									<div class="classroom">{{ cell.classroom }}</div>
								</template>
							</div>
						</template>
						<template v-else>
							<div
								class="shift filled"
								:class="{ double: cell.double }"
								:id="`calendarShift_${cell.weekdayIndex}_${cell.timeIndex}`"
								:style="{
									'--shiftColor': cell.color || undefined,
								}"
							>
								<div class="course-line">
									<div>{{ cell.course }}</div>
									<div>{{ cell.shift }}</div>
								</div>
								<div class="classroom">{{ cell.classroom }}</div>
							</div>
						</template>
					</template>
					<div
						v-else
						class="shift"
						:id="`calendarShift_${cell.weekdayIndex}_${cell.timeIndex}`"
					></div>
				</template>
			</div>
		</BaseCard>
	</div>
</template>

<script setup lang="ts">
	import { computed, type PropType } from "vue";
	import BaseCard from "./BaseCard.vue";
	import type { Weekday, Time } from "@/data/time";
	import { WEEKDAYS, _TIMES, TIMES } from "@/data/time";

	//#region -------------- Unbound Types --------------
	//#endregion -------------- Unbound Types --------------

	//#region -------------- Constants --------------
	// const WEEKDAYS = [
	// 	"Segunda-Feira",
	// 	"Terça-Feira",
	// 	"Quarta-Feira",
	// 	"Quinta-Feira",
	// 	"Sexta-Feira",
	// ] as const;
	// type Weekday = (typeof WEEKDAYS)[number];

	// const _TIMES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
	// const TIMES = _TIMES.map((t) => `${t.toString().padStart(2, "0")}:00`);
	// type Time = (typeof _TIMES)[number];
	//#endregion -------------- Constants --------------

	//#region -------------- Props --------------
	export interface Shift {
		day: Weekday;
		from: Time;
		to: Time;
		course: string;
		name: string;
		classroom?: string;
		color?: string;
	}

	const props = defineProps({
		height: { type: String, default: "400px" },
		shifts: { type: Array as PropType<Shift[]>, required: true },
	});
	//#endregion -------------- Props --------------

	//#region -------------- Functions --------------
	interface ShiftElem extends Shift {
		double: boolean;
	}

	/**
	 * Determines whether a shift occurs at a given weekday and hour.
	 * @param weekday The {@link WEEKDAYS} index representing the weekday this shift occurs on.
	 * @param startTime The {@link _TIMES} index representing the hour this shift starts at.
	 */
	function hasShift(weekday: number, startTime: number): boolean {
		return props.shifts.some(
			(s) => WEEKDAYS.indexOf(s.day) === weekday && s.from === _TIMES[startTime],
		);
	}

	/**
	 * Determines the conflict chain present at a given position, if it exists.
	 * A conflict chain is defined as a series of contiguous conflicts between two or more shifts.
	 * @param shift The shift to be used as reference to build the conflict chain.
	 */
	function getConflicts(shift: ShiftElem) {
		// A set is used here to filter out duplicates, given all shifts used throughout the component
		// are direct references to the original shift list.
		const visited = new Set<Shift>();
		const toVisit = [shift];

		// This loop finds all transient conflicts in a shift chain given a starting shift.
		// This resolves the problem where three shifts, S1 from 9 to 11, S2 from 10 to 12 and
		// S3 from 11 to 13 are all part of a conflict chain, with S1 overlapping S2 and S2 overlapping
		// S3, but S1 and S3 do not directly overlap, and therefore need to be correctly offset.
		while (toVisit.length > 0) {
			const current = toVisit.pop()!;
			if (visited.has(current)) continue;

			visited.add(current);

			toVisit.push(
				...(<ShiftElem[]>(
					props.shifts.filter(
						(s) =>
							s !== current &&
							s.day === current.day &&
							current.to > s.from &&
							current.from < s.to &&
							current.course !== s.course &&
							current.name !== s.name &&
							!visited.has(s),
					)
				)),
			);
		}

		// The set is sorted by start times of each shift before returning, to make the conflict chain
		// offsets create "stairs" from top to bottom, left to right.
		return Array.from(visited).sort((a, b) => a.from - b.from);
	}

	/**
	 * Fetches a reference to the shift object at a given weekday and hour.
	 * This function assumes a previous call to {@link hasShift}.
	 * @param weekday The {@link WEEKDAYS} index representing the weekday this shift occurs on.
	 * @param startTime The {@link _TIMES} index representing the hour this shift starts at.
	 */
	function getShift(weekday: number, startTime: number): ShiftElem[] {
		// const shift = <ShiftElem>(
		// 	props.shifts.filter(
		// 		(s) => WEEKDAYS.indexOf(s.day) === weekday && s.from === _TIMES[startTime],
		// 	)[0]
		// );
		//
		// shift.double = shift.to - shift.from > 1;
		// return shift;

		const shifts = props.shifts
			.filter((s) => WEEKDAYS.indexOf(s.day) === weekday && s.from === _TIMES[startTime])
			.map((s) => ({ ...s, double: s.to - s.from > 1 }));

		// console.log("GET SHIT:", shifts);

		return shifts;
	}
	//#endregion -------------- Functions --------------

	//#region -------------- Derivations --------------
	interface TimeCalendarCell {
		_system: true;
		time: string;
	}
	interface EmptyCalendarCell {
		_system: false;
		filled: false;
		weekdayIndex: number;
		timeIndex: number;
	}
	interface FilledCalendarCell {
		_system: false;
		filled: true;
		double: boolean;
		weekdayIndex: number;
		timeIndex: number;
		course: string;
		shift: string;
		classroom: string;
		color: string;
		conflict: boolean;
		conflictSize: number;
		conflictOffset: number;
		multi: boolean;
		multiData?: FilledCalendarCell[];
	}
	type CalendarCell = TimeCalendarCell | EmptyCalendarCell | FilledCalendarCell;

	// Here I precompute the entire grid to avoid some pretty ugly hacks needed to store intermediate
	// state on the template while computing conflicts.
	const calendarGrid = computed(() => {
		const cells = <CalendarCell[]>[];

		for (let ti = 0; ti < TIMES.length; ti++) {
			const time = TIMES[ti];

			cells.push({
				_system: true,
				time: time,
			});

			if (ti < TIMES.length - 1) {
				for (let i = 0; i < 5; i++) {
					if (hasShift(i, ti)) {
						const s = getShift(i, ti);
						const conflicts = getConflicts(s[0]);

						// console.log("CONFLICTS:", conflicts);

						const cell = <FilledCalendarCell>{
							_system: false,
							filled: true,
							double: s[0].double,
							weekdayIndex: i,
							timeIndex: ti,
							course: s[0].course,
							shift: s[0].name,
							classroom: s[0].classroom,
							color: s[0].color ?? undefined,
							multi: s.length > 1,
							multiData:
								s.length > 1
									? s.map((ss) => ({
											_system: false,
											filled: true,
											double: ss.double,
											weekdayIndex: i,
											timeIndex: ti,
											course: ss.course,
											shift: ss.name,
											classroom: ss.classroom,
											color: ss.color ?? undefined,
											multi: false,
										}))
									: undefined,
						};

						if (conflicts.length > 1) {
							cell.conflict = true;
							cell.conflictSize = 100 / conflicts.length;
							cell.conflictOffset = (100 / conflicts.length) * conflicts.indexOf(s[0]);
						}

						cells.push(cell);
					} else {
						cells.push({
							_system: false,
							filled: false,
							weekdayIndex: i,
							timeIndex: ti,
						});
					}
				}
			}
		}

		// console.log(TIMES.length - 1);
		// console.log("CELLS:", cells);
		return cells;
	});
	//#endregion -------------- Derivations --------------
</script>

<style scoped>
	.container {
		height: 100%;
		width: 100%;
		background: #333750;
	}
	.base {
		position: relative;
		display: grid;
		grid-template-columns: 1fr repeat(5, 4fr);
		grid-template-rows: repeat(14, 1fr);
		height: 100%;
	}

	.weekday {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;

		border-bottom: 1px solid #a1a1aa;
	}

	.time {
		position: relative;
		/* display: flex;
		flex-direction: row;
		align-items: start;
		justify-content: flex-end; */

		& .time-text {
			position: absolute;
			top: -5px;
			right: 5px;
			font-size: 12px;
		}
	}

	.shift {
		/*
			Split this way so that when a double shift is filled, the separator in the middle
			can be removed. The border for the first cells is defined in the class weekday.
		*/
		border-left: 1px solid #a1a1aa;
		border-right: 1px solid #a1a1aa;
		border-bottom: 1px solid #a1a1aa;

		&.double {
			border-bottom: unset;
			height: 200%;
			max-height: 200%;
			overflow: hidden;
		}

		&.filled {
			--shiftColor: #33ff3a82;

			&.conflict {
				--shiftColor: #ff5c3382;
			}

			display: flex;
			flex-direction: column;
			padding-left: 5px;
			background-color: var(--shiftColor);
			border: 2px solid #fafafa;
			z-index: 2;

			* {
				font-weight: bolder;
			}

			.course-line {
				display: flex;
				flex-direction: row;
				font-weight: unset;
				gap: 10px;
			}
		}

		&.multi {
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			background: transparent;
			width: 100%;
			padding: 0;
			border: unset;

			.inner {
				height: 100%;
				width: 100%;
			}
		}
	}
</style>
