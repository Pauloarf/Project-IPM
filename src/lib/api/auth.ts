import { APIWrapper, type APILogin } from ".";
import { deleteCookie, getCookie, setCookie } from "../util/cookie";

//#region ============== Constants ==============
const AUTH_COOKIE_KEY = "auth";
const AUTH_COOKIE_EXP = 3600_000; // ms
//#endregion ============== Constants ==============

//#region ============== Variables / Cache ==============
const g_API = APIWrapper.local<APILogin[]>(3000, "logins");
g_API.debug = true;
const ENCODER = new TextEncoder();
//#endregion ============== Variables / Cache ==============

//#region ============== Types ==============
interface AuthCookie {
	expirationDate: Date,
	uid: string,
	checksum: string
}

interface AuthUser {
	id: number,
	kind: APILogin["kind"]
}
//#endregion ============== Types ==============

//#region ============== Misc Util ==============
const MSF_MAGIC1 = 12;
const MSF_MAGIC2 = 64;
function magicStringFuck(str: string) {
	return btoa(encodeURIComponent(
		str
			.split("")
			.map((ch, i) => String.fromCharCode(
				ch.charCodeAt(0) + (i % 2 === 0 ? MSF_MAGIC1 : -MSF_MAGIC2)
			))
			.reverse()
			.join("")
	)).split("").reverse().join("");
}

function magicStringUnfuck(str: string) {
	return decodeURIComponent(atob(str.split("").reverse().join(""))).split("")
		.map((ch, i) => String.fromCharCode(
			ch.charCodeAt(0) - (i % 2 === 0 ? MSF_MAGIC1 : -MSF_MAGIC2)
		))
		.reverse()
		.join("")
}

async function sha256(src: string) {
	const digest = await window.crypto.subtle.digest("sha-256", ENCODER.encode(src));
	return new Uint8Array(digest).reduce((a, b) => a + b.toString(16).padStart(2, '0'), '');
}
//#endregion ============== Misc Util ==============

//#region ============== Authentication ==============
function readAuthCookie(cookie: string): AuthCookie | undefined {
	try {
		const data = JSON.parse(atob(cookie));
		if (typeof data.expirationDate !== "string") return undefined;
		if (typeof data.checksum !== "string") return undefined;

		data.expirationDate = new Date(data.expirationDate);

		return data;
	} catch {
		return undefined;
	}
}

async function assertAuthentication(prune: boolean = false) {
	try {
		happyPath: {
			const authCookie = getCookie(AUTH_COOKIE_KEY);
			if (!authCookie) break happyPath;

			const authData = readAuthCookie(authCookie);
			if (!authData) break happyPath;
			if (authData.expirationDate.getTime() < Date.now()) break happyPath;

			const userId = magicStringUnfuck(authData.uid);
			const uidComponents = userId.split(":");
			if (uidComponents.length !== 2) break happyPath;

			const _apiUser = await g_API.fetch("", { filter: { id: uidComponents[1], kind: uidComponents[0] } });
			if (!_apiUser || !Array.isArray(_apiUser) || _apiUser.length === 0) break happyPath;
			const apiUser = _apiUser[0];

			return { id: apiUser.id, kind: apiUser.kind };
		}
	} catch (e) {
		console.error("Authentication Assertion Error:", e)
		// Passthrough
	}

	if (prune) deleteCookie(AUTH_COOKIE_KEY);
	return false;
}

async function authenticate(email: string, password: string) {
	const passwordHash = await sha256(password);
	const _user = <APILogin[] | undefined>(await g_API.fetch("", { filter: { email: email, password: passwordHash } }));
	if (!_user || !Array.isArray(_user) || _user.length === 0) return undefined;
	const user = _user[0];

	// console.log("USER:", user);

	const uid = magicStringFuck(`${user.kind}:${user.id}`);
	const cookie: AuthCookie = {
		expirationDate: new Date(Date.now() + AUTH_COOKIE_EXP),
		uid: uid,
		checksum: await sha256(magicStringFuck(`${uid}`))
	};

	// console.log("COOKIE:", cookie);
	setCookie(
		AUTH_COOKIE_KEY,
		btoa(JSON.stringify(cookie)),
		new Date(Date.now() + AUTH_COOKIE_EXP),
		// 2
	);

	return { id: user.id, kind: user.kind };
}

function deauthenticate() {
	deleteCookie(AUTH_COOKIE_KEY);
}
//#region ============== Authentication ==============

export {
	type AuthUser,

	assertAuthentication,
	authenticate,
	deauthenticate
}
