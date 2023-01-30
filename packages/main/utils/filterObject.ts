/**
 * deep or shallow filter object property by filter
 * @param obj
 * @param filter
 * @returns
 */

export function filterObject(
	obj: Record<any, any>,
	deep: boolean = false,
	filter: (v: any) => boolean = Boolean
): Record<any, any> {
	const keys = Object.keys(obj)
	keys.forEach((key, index) => {
		Array.isArray(obj) && console.log(index)
		const value = obj[key]
		const isTrue = filter(value)
		if (!isTrue) {
			Reflect.deleteProperty(obj, key)
			return
		}
		if (typeof value === 'object' && deep) {
			obj[key] = Array.isArray(value)
				? filterObject(value, deep, filter).filter(Boolean) // remove empty item
				: filterObject(value, deep, filter)
		}
	})
	return obj
}

// const a:Record<any, any> = {a:1}
