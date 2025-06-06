async function deleteRequest(url: string, json: true): Promise<unknown>;
async function deleteRequest(url: string, json?: false): Promise<Response>;
async function deleteRequest(url: string, json = true) {
	// console.log(`---> DELETE ${url}`);

	const res = await fetch(url, {
		method: "DELETE"
	});

	// console.log(`<--- DELETE ${res.status} ${url}`);

	if (json) {
		const resData = await res.json();
		return resData;
	} else {
		return res;
	}
}

export default deleteRequest;