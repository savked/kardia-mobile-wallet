export const parseRun = (id: any, result: any) => {
	const parsedResult = typeof result === 'string' ? `'${result}'` : JSON.stringify(result)
	return `
		window.kardiachain.sendResponse(${id}, ${parsedResult})
	`
}

export const parseError = (id: any, errMessage: any) => {
	return `
		window.kardiachain.sendError(${id}, '${errMessage}')
	`
}

export const parseEmit = (event: string, message: any) => {
	const parsedMessage = typeof message === 'string' ? `'${message}'` : JSON.stringify(message)
	return `
		window.kardiachain.remoteEmit(${event}, '${parsedMessage}')
	`
}