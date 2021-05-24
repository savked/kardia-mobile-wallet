export const mergeObjArr = (objArr: any[]) => {
  return objArr.reduce((pre, cur) => {
    if (cur) {
      return {
        ...pre,
        ...cur
      }
    }
    return pre
  }, {})
}