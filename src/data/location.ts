enum Building {
	CP1,
	CP2,
	CP3,
	CP4,
	CP6,
	CP7
}

const BuildingMapping = {
	[Building.CP1]: "Complexo Pedagógico 1",
	[Building.CP2]: "Complexo Pedagógico 2",
	[Building.CP3]: "Complexo Pedagógico 3",
	[Building.CP4]: "Complexo Pedagógico 4",
	[Building.CP6]: "Complexo Pedagógico 6",
	[Building.CP7]: "Complexo Pedagógico 7"
} satisfies Record<Building, string>;

// Preventive type alias
type Room = string;

export {
	type Room,

	Building,
	BuildingMapping
};