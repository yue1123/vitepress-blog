import matter from 'gray-matter'

console.log(
	matter.stringify(
		`---
createTime: '2020.10.1'
---

# test ahhh`,
		{
			title: 'Home',
			tag: [1, 2, 3],
			createTime: Date.now(),
			user: { name: 123, tag: 123, jobs: ['js', 'css'] }
		},
		{
			
		}
	)
)
