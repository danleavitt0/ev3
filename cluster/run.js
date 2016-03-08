require('ev3-robot')
var fs = require('fs')

process.stdin.setEncoding('utf-8')
process.stdin.on('data', function (filePath) {
	var file = fs.readFileSync(filePath, 'utf-8')
	eval(file)
	process.exit()
})
