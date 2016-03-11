var spawn = require('child_process').spawn
var parsetrace = require('parsetrace')
var path = require('path')
var fs = require('fs')

var NUM_NODES = 1
var COUNTDOWN = 6000

module.exports = cluster

function cluster () {
	const state = {
		running: false,
		idx: 0,
		nodes: []
	}
	for (var i = 0; i < NUM_NODES; i++) {
		state.nodes.push(createSpawn())
	}
	return {run: run, isRunning: isRunning, stop: stop}

	function run (file, cb) {
		cb = cb || function (err) { return err }
		if (!isRunning()) {
			var node = state.nodes[state.idx]
			setCallback(node, path.basename(file), cb)
			state.running = true
			node.stdin.write(file, 'utf-8')
			state.nodes[state.idx] = createSpawn()
			state.idx = (state.idx + 1) % NUM_NODES
			return node
		} else {
			cb(new Error('Already running'))
		}
	}

	function isRunning () {
		return state.running
	}

	function stop () {
		state.nodes.every(function (node) {
			node.kill()
		})
	}

	function setCallback (node, file, cb) {
		node.on('exit', function () {
			setTimeout(function () {
				state.running = false
				cb()
			}, COUNTDOWN)
		})
	}
}

function createSpawn () {
	var n = spawn('node', [path.join(__dirname, 'run.js')])
  n.stdout.setEncoding('utf-8')
  n.stderr.setEncoding('utf-8')
	n.stderr.on('data', function (data) {
		getErrorMessage(data)
		node.kill()
	})

  n.stdout.on('data', function (data) {
    fs.appendFileSync(path.resolve('log.txt'), data)
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
		fs.appendFileSync(path.resolve('log.txt'), err)
	}
}
