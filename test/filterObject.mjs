import matter from 'gray-matter'

function filterObject(obj, deep = false, filter = Boolean) {
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

const data = {
	name: '1',
	age: null,
	b: false,
	d: '',
	c: undefined,
	ages: [1, '', undefined, false]
}
const a = filterObject(data, true)
console.log(a)
console.log(
	matter.stringify(
		`---
createTime: '2020.10.1'
---

# test ahhh`,
		a
	)
)

// console.log(filterObject(data, true))
