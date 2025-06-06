function getCookie(key: string) {
	return document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop() || ""
}

function setCookie(key: string, value: string, expirationDate: Date) {
	console.log("COOKIE SET:", [`${key}=${value}`
		+ `;Expires=${expirationDate.toUTCString()};Path=/;Secure`])
	document.cookie = `${key}=${value}`
		+ `;Expires=${expirationDate.toUTCString()};Path=/;Secure`;
}
function deleteCookie(key: string) {
	document.cookie = key + "=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=None;Secure";
}

export {
	getCookie,
	setCookie,
	deleteCookie
}
