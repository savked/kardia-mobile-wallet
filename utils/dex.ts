import { WKAI_SMC } from "../config";

export const isKAI = (tokenAddr: string): boolean => !!(tokenAddr && WKAI_SMC && tokenAddr.toLowerCase() === WKAI_SMC.toLowerCase())