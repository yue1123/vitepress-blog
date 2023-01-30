const { cyan, blue, yellow, bold, dim, green } = require('chalk')
const { version } = require('./package.json')

console.log()
console.log(`  ${cyan('●') + blue('■') + yellow('▲')}`)
console.log(`${bold('  Slidev') + dim(' Creator')}  ${blue(`v${version}`)}`)
console.log()
