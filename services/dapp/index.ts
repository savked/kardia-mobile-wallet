import { DEFAULT_APP_JSON } from "../config";

export const getDefaultDApp = async () => {
	const requestOptions = {
		method: 'GET',
		redirect: 'follow'
	};

	const rs = await fetch(DEFAULT_APP_JSON, requestOptions)
	try {
		const rsJSON = await rs.json()
		return rsJSON.apps
	} catch (error) {
		console.log(error)
		return []		
	}
}