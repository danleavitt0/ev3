var spawn = require('child_process').spawn
var parsetrace = require('parsetrace')
var path = require('path')
var fs = require('fs')

var NUM_NODES = 1
var COUNTDOWN = 6000

var nodes = []
var running = false
var idx = 0

for (var i = 0; i < NUM_NODES; i++) {
	nodes.push(createSpawn())
}

exports.run = function (file, cb) {
	if (!running) {
		var node = nodes[idx]

		setCallback(node, cb)
		running = true
		node.stdin.write(file, 'utf-8')
		nodes[idx] = createSpawn(path.basename(file))
		idx = (idx + 1) % NUM_NODES
		return node
	} else {
		throw new Error('Already running')
	}
}

function setCallback (node, cb) {
	cb = cb || function () {}
	node.on('exit', function () {
		setTimeout(function () {
			running = false
			cb()
		}, COUNTDOWN)
	})
}

function createSpawn (file, cb) {
	var n = spawn('node', [__dirname + '/run.js'])
  n.stdout.setEncoding('utf-8')
  n.stderr.setEncoding('utf-8')
  n.stdout.on('data', function (data) {
    fs.appendFileSync('log.txt', data)
  })
  n.stderr.on('data', function (data) {
		getErrorMessage(data, file)
    n.kill()
  })
  return n
}

function getErrorMessage (data, fileName) {
	var trace = parsetrace({stack: data}).object()
	var lineNum = trace.frames.reduce(function (str, next) {
		if (next.file.indexOf('run.js') > -1 && !str) {
			str += next.line
			return str
		} else {
			return str
		}
	}, '')
	var err = [
		'Error: ' + trace.error,
		'File: ' + fileName,
		'Line: ' + lineNum,
		'\n'
	].join('\n')
	if (lineNum) {
		fs.appendFileSync('log.txt', err)
	}
}
