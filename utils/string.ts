export const truncate = (str: string, n: number, e: number) => {
    if (n > str.length - e) {
        return str
    }
    return str.substr(0, n - 1) + '...' + str.substr(str.length - e - 1);
};