async function getRequest(url: string, json: true): Promise<unknown>;
async function getRequest(url: string, json?: false): Promise<Response>;
async function getRequest(url: string, json: boolean = true) {
	// console.log(`---> GET ${url}`);

	const res = await fetch(url, {
		method: "GET"
	});

	// console.log(`<--- GET ${res.status} ${url}`);

	if (json) {
		const resData = await res.json();
		return resData;
	} else {
		return res;
	}
}

export default getRequest;
