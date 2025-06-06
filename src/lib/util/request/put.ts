async function putRequest(url: string, body: unknown, json: true): Promise<unknown>;
async function putRequest(url: string, body: unknown, json?: false): Promise<Response>;
async function putRequest(url: string, body: unknown, json = true) {
	// console.log(`---> PUT ${url}\n - BODY:`, body);

	const headers = new Headers();
	headers.append("Content-Type", "application/json; charset=utf-8");

	const res = await fetch(url, {
		method: "PUT",
		body: JSON.stringify(body),

		headers: headers
	});

	// console.log(`<--- PUT ${res.status} ${url}`);

	if (json) {
		const resData = await res.json();
		return resData;
	} else {
		return res;
	}
}

export default putRequest;