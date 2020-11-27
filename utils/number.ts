export const isNumber = (val: string) => {
    return /^\d+(,\d{3})*(\.\d+)?$/.test(val)
}

export const getDigit = (val: string) => {
    let result = ''
    for (let index = 0; index < val.length; index++) {
        const char = val.charAt(index);
        if (/\d/.test(char)) result += char
    }
    return result
}

export const format = (val: number, options?: Intl.NumberFormatOptions) => {

    let defaultOption = {
        maximumFractionDigits: 18
    }

    if (options) defaultOption = Object.assign(defaultOption, options)

    return new Intl.NumberFormat('en-US', defaultOption).format(val)
}