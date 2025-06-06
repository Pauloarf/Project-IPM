async function postRequest(url: string, body: unknown, json: true): Promise<unknown>;
async function postRequest(url: string, body: unknown, json?: false): Promise<Response>;
async function postRequest(url: string, body: unknown, json = true) {
	// console.log(`---> POST ${url}\n - BODY:`, body);

	const headers = new Headers();
	headers.append("Content-Type", "application/json; charset=utf-8");

	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify(body),

		headers: headers
	});

	// console.log(`<--- POST ${res.status} ${url}`);

	if (json) {
		const resData = await res.json();
		return resData;
	} else {
		return res;
	}
}

export default postRequest;