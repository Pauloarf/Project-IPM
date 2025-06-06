const WEEKDAYS = [
	"Segunda-Feira",
	"Terça-Feira",
	"Quarta-Feira",
	"Quinta-Feira",
	"Sexta-Feira",
] as const;
type Weekday = (typeof WEEKDAYS)[number];

const _TIMES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
const TIMES = _TIMES.map((t) => `${t.toString().padStart(2, "0")}:00`);
type Time = (typeof _TIMES)[number];

function formatTime(time: Time) {
	return TIMES[_TIMES.indexOf(time)];
}

function formatTimeFromString(str: string): string | undefined {
	const num = parseInt(str, 10);
	if (_TIMES.includes(num as Time)) {
	  return formatTime(num as Time);
	}
	return undefined;
  }  

export {
	type Weekday,
	type Time,

	WEEKDAYS,
	_TIMES,
	TIMES,

	formatTime,
	formatTimeFromString
};