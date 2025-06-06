import deleteRequest from "../util/request/delete";
import getRequest from "../util/request/get";
import postRequest from "../util/request/post";
import putRequest from "../util/request/put";

//#region ============== Types ==============
//#region ========== External ==========
interface APIDirector {
	id: number,
	name: string,
	email: string,
	password: string,
}

interface APITeacher {
	id: number,
	name: string,
	email: string,
	password: string,
}

interface APIStudent {
	id: number,
	name: string,
	email: string,
	password: string,
	firstInscription: boolean,
	specialStatus: boolean,
	alphanum: string,
	enrolled: APIShift["id"][],
}

interface APIDegree {
	id: number,
	name: string,
	abbreviation: string,
	directorId: number,
}

interface APICourse {
	id: number,
	name: string,
	abbreviation: string,
	year: number,
	semester: number,
	degreeId: number,
}

interface APIShift {
	id: number,
	courseId: number,
	classroomId: number,
	day: string,
	from: number,
	to: number,
	type: string,
	name: string,
	teacherId: number,
	totalStudentsRegistered: number,
}

interface APIAllocation {
	id: number,
	shiftId: number,
	studentId: number,
}

interface APIConflict {
	id: number,
	studentId: number,
	courseIDs: number[]
}

interface APIBuilding {
	id: number,
	name: string,
	abbreviation: string
}

interface APIClassroom {
	id: number,
	name: string,
	capacity: number,
	buildingId: number
}

enum APIRequestKind {
	ROOM_EXCHANGE,
	SHIFT_EXCHANGE
}

interface APIBaseRequest {
	id: number,
	name: string,
	capacity: number,
	buildingId: number,
	kind: APIRequestKind,
	requestSeen: boolean,
	requestTimestamp: number,
	response?: unknown,
	responseSeen: boolean,
}
interface APIClassroomExchangeRequest extends APIBaseRequest {
	fromClassroomId: number,
	toClassroomId: number,
	teacherId: number,
	shiftId: number,
	kind: APIRequestKind.ROOM_EXCHANGE,
}
interface APIShiftExchangeRequest extends APIBaseRequest {
	fromShiftId: number,
	toShiftId: number,
	studentId: number,
	alternativeShiftId?: number
	kind: APIRequestKind.SHIFT_EXCHANGE
}
type APIRequest =
	| APIClassroomExchangeRequest
	| APIShiftExchangeRequest

/**
 * The _control field is a special case in the API, and has a fixed structure that contains
 * persistent state control properties. Therefore, it makes sense that it should be statically typed
 * using a tuple.
 */
type APIControl = 
	{
		id: 0,
		published: number
	}


enum ControlPublishedState {
	TO_PUBLISH = 0,
	TEMPORARY  = 1,
	PUBLISHED  = 2
}

interface APILogin {
	// The properties id and kind form the primary key for the login.
	id: number,
	kind: "directors" | "teachers" | "students",
	email: string,
	password: string
}

type APIComponent =
	| APIDirector
	| APITeacher
	| APIStudent
	| APIDegree
	| APICourse
	| APIShift
	| APIAllocation
	| APIConflict
	| APIBuilding
	| APIClassroom
	| APIRequest
	| APIControl
	| APILogin
	| APIComponent[]
//#endregion ========== External ==========

//#region ========== Internal ==========
//#region ======= Util =======
type Tuple<T> = readonly T[] | readonly [];
type TupleOfTupleLength<T, LT extends Tuple<unknown>> = { [K in keyof LT]: T }
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type NullableObject<T> = T | {};
type IndexablePrimitive = string | number;
//#endregion ======= Util =======

interface BaseAPIGetOptions {
	limit?: number,
	page?: number,
	bounds?: [number, number],
	filter?: Record<string, IndexablePrimitive | IndexablePrimitive[]>
}

//#region ======= Sort Options =======
type Order = "asc" | "desc";
interface SingleSortAPIGetOptions {
	sort: string,
	order: Order
}
interface MultiSortAPIGetOptions<T extends Tuple<string>> {
	sort: T,
	order: TupleOfTupleLength<Order, T>
}
type SortAPIGetOptions<T extends Tuple<string>> = SingleSortAPIGetOptions | MultiSortAPIGetOptions<T>;
//#endregion ======= Sort Options =======

type APIGetOptions<S extends Tuple<string>> = BaseAPIGetOptions & NullableObject<SortAPIGetOptions<S>>;
//#endregion ========== Internal ==========
//#endregion ============== Types ==============

//#region ============== Util ==============
const _SAFE_QUERY = (base: string, prop: string) => `${base}${base.includes("?") ? "&" : "?"}${prop}`;
const TARGET = (base: string, target: IndexablePrimitive) => `${base}${base.endsWith("/") ? "" : "/"}${target}`;
// const INCLUDE = (base: string, prop: string) => _SAFE_QUERY(base, `_embed=${prop}`);
// const INCLUDE_REVERSE = (base: string, prop: string) => _SAFE_QUERY(base, `_expand=${prop}`);
const LIMIT = (base: string, limit: number) => _SAFE_QUERY(base, `_limit=${limit}`);
const BOUND = (base: string, start: number, end: number) => _SAFE_QUERY(base, `_start=${start}&_end=${end}`);
const SORT = (base: string, sort: string, order: string) => _SAFE_QUERY(base, `_sort=${sort}&order=${order}`);
const PAGINATE = (base: string, page: number) => _SAFE_QUERY(base, `_page=${page}`);
const FILTER_ARRAY = (base: string, key: string, values: IndexablePrimitive[]) => _SAFE_QUERY(
	base,
	`${key}_like=${encodeURIComponent(`^(${values
		.reduce((acc, v) => ([...acc, `(?:${v})`]), <string[]>[])
		.join("|")
		})$`
	)
	}`
);
const FILTER = (base: string, key: string, value: IndexablePrimitive) => _SAFE_QUERY(
	base,
	`${key}=${encodeURIComponent(value)}`
);
//#endregion ============== Util ==============

class APIWrapper<B extends APIComponent[]> {
	baseUrl: URL;
	debug: boolean;

	constructor(base: string, target?: string) {
		this.baseUrl = new URL(base, target);
		this.debug = false;
	}

	//#region -------------- Static --------------
	/**
	 * Creates an API Wrapper for an API locally hosted.
	 * @param port The local port to connect to.
	 * @param loc The base location to use for the wrapper.
	 */
	public static local<B extends APIComponent[]>(port: number, loc: string = "") {
		return new APIWrapper<B>(`http://localhost:${port}/${loc}`);
	}
	//#endregion -------------- Static --------------

	//#region -------------- Public --------------
	/**
	 * Creates a wrapper for an endpoint relative to the URI this instance targets.
	 *
	 * @example ```md
	 * http://localhost:3000/foo -> sub("bar") -> http://localhost:3000/foo/bar
	 * ```
	 * @param target The relative target endpoint.
	 * @returns
	 */
	public sub(target: string) {
		return new APIWrapper(this.baseUrl.href, target);
	}

	public async fetch<T extends Tuple<string>>(options?: APIGetOptions<T>): Promise<B | undefined>;
	public async fetch<T extends Tuple<string>>(
		target: IndexablePrimitive,
		options?: APIGetOptions<T>
	): Promise<B[number] | undefined>;
	public async fetch<T extends Tuple<string>>(
		arg1?: IndexablePrimitive | APIGetOptions<T>,
		arg2?: APIGetOptions<T>
	): Promise<B | undefined> {
		const target: IndexablePrimitive = (typeof arg1 === "string" || typeof arg1 === "number") ? arg1 : "";
		const options: APIGetOptions<T> | undefined =
			(typeof arg1 === "string" || typeof arg1 === "number")
				? arg2
				: arg1;

		const reqUrl = this.parseOptions(TARGET(this.baseUrl.href, target), options);
		this.trace("FETCH", reqUrl);

		const res = await getRequest(reqUrl, false);
		this.trace("FETCH RES", res.status, reqUrl);
		if (!res.ok) return undefined;

		const data = await res.json();
		// json-server often returns empty objects in case of fetch errors. Instead of having the caller
		// explicitly check for it every time, handle it here. Also works for arrays, because for them,
		// Object.keys will return the indexes for the currently contained data, ain't javascript just
		// lovely?
		if (Object.keys(data).length === 0) return undefined;

		return data;
	}

	public async update(target: IndexablePrimitive, body: Partial<B[number]>): Promise<boolean> {
		const reqUrl = TARGET(this.baseUrl.href, target);
		this.trace("UPDATE", reqUrl, body);

		const res = await putRequest(reqUrl, body, false);
		this.trace("UPDATE RES", res.status, reqUrl);
		return res.ok;
	}

	public async create(target: IndexablePrimitive, body: B[number], idKey?: string): Promise<boolean> {
		// const reqUrl = TARGET(this.baseUrl.href, target);
		const reqUrl = this.baseUrl.href;
		const id = idKey ?? "id";
		this.trace("CREATE", reqUrl, { ...body, [id]: target });

		const res = await postRequest(reqUrl, body, false);
		this.trace("CREATE RES", res.status, reqUrl);
		return res.ok;
	}

	public async kill(target: IndexablePrimitive): Promise<boolean> {
		const reqUrl = TARGET(this.baseUrl.href, target);
		this.trace("KILL", reqUrl);

		const res = await deleteRequest(reqUrl, false);
		this.trace("KILL RES", res.status, reqUrl);
		return res.ok;
	}
	//#endregion -------------- Public --------------


	//#region -------------- Private --------------
	/**
	 * Constructs the API endpoint based on an options object.
	 */
	private parseOptions<T extends Tuple<string>>(base: string, options?: APIGetOptions<T>) {
		this.trace("PO:", base, options)
		if (!options) return base;

		let out = base;
		if (options.limit) out = LIMIT(out, options.limit);
		if (options.page) out = PAGINATE(out, options.page);
		if (options.bounds) out = BOUND(base, ...options.bounds);
		if (options.filter) {
			for (const key in options.filter) {
				const value = options.filter[key];
				if (Array.isArray(value)) out = FILTER_ARRAY(out, key, value);
				else out = FILTER(out, key, value);
			}
		}
		if ("sort" in options) {
			// Here, typescript can't type narrow the parent type based on the type of "sort" because it's
			// a non-discriminant key in APIGetOptions. Manual type narrowing is required.
			if (typeof options.sort === "string") {
				out = SORT(out, options.sort, (<SingleSortAPIGetOptions>options).order);
			} else {
				out = SORT(
					out,
					options.sort.join(","),
					(<MultiSortAPIGetOptions<T>>options).order.join(",")
				);
			}
		}

		return out;
	}

	private trace(...args: unknown[]) {
		if (!this.debug) return;

		console.log(`[API ${this.baseUrl.pathname}]`, ...args);
	}
	//#endregion -------------- Private --------------
}

export {
	//#region ======= Types =======
	type APIDirector,
	type APITeacher,
	type APIStudent,
	type APIDegree,
	type APICourse,
	type APIShift,
	type APIAllocation,
	type APIConflict,
	type APIBuilding,
	type APIClassroom,
	type APIRequest,
	type APIControl,
	type APILogin,
	//#endregion ======= Types =======

	ControlPublishedState,
	APIWrapper,
};
