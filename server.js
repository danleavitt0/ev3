#!/usr/bin/env node

var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var cors = require('cors')
var path = require('path')
var devices = require('ev3-js-devices')
var app = express()
var http = require('http').Server(app)
var parsetrace = require('parsetrace')
var cluster = require('./cluster')
var spawn = require('child_process').spawn
var MoveSteering = require('move-steering')

var ports = ['a', 'b', 'c', 'd', 1, 2, 3, 4]

app.use(cors())
app.use(bodyParser.json())
app.use('/static', express.static(__dirname + '/public'))

var node

app.post('/file.get/:name', function (req, res) {
  var file = __dirname + '/files/' + req.params.name
  fs.readFile(file, 'utf-8', function (err, data) {
    if (err)  {
      var startString = 'var MoveSteering = require(\'move-steering\')'
      fs.writeFileSync(file, startString)
      return res.send(startString)
    }
    res.send(data)
  })
})

app.post('/log.get', function (req,res) {
  var file = fs.readFile('log.txt', 'utf-8', function (err, data) {
    if (err) {
      fs.writeFile('log.txt', '', function () {
        res.json({ ok: true, data: 'Create log.txt'})
      })
    } else {
      res.json({ ok: true, data: data })
    }
  })
})

app.post('/log.clear', function (req, res) {
  fs.writeFile('log.txt', '', function () {
    res.json({ ok: true, data: 'Create log.txt'})
  })
})

app.post('/file.save', function (req, res) {
  if (!fs.existsSync(__dirname + '/files/')) {
    fs.mkdirSync(__dirname + '/files/')
  }
  fs.writeFile(
    __dirname + '/files/' + req.body.name,
    req.body.text,
    function (err, data) {
      if (err) {
        res.json({ok: false, message: err})
      } else {
        res.json({ok: true, message: 'Save Successful'})
      }
    })
})

app.post('/file.stop', function (req, res) {
  if(node) {
    node.kill()
  }
  try {
    MoveSteering().reset()
  } catch (e) {
    console.warn('no motors attached')
  }
  setTimeout(function () {
    res.json({
      ok: true,
      message: 'Run finished'
    })
  }, 6000)
})

app.post('/file.run', function (req, res) {
  var filePath = __dirname + '/files/' + req.body.fileName
  node = createNode(filePath, req.body.fileName)
  node.on('exit', function () {
    setTimeout(function () {
      res.json({ok: true, message: 'Run finished'})
    }, 6000)
  })
})

app.post('/file.getAll', function (req, res) {
  fs.readdir(__dirname + '/files', function (err, data) {
    if (err) {
      res.send({text: ''})
    }
    res.send(JSON.stringify(data))
  })
})

app.post('/sensor.data', function (req, res) {
  var readPath = path.join(req.body.path, req.body.ext || 'value0')
  fs.readFile(readPath, 'utf-8', function (err, data) {
    if (err) {
      res.json({
        ok: false,
        msg: err
      })
    } else {
      res.json({
        ok: true,
        data: {
          value: data.trim(),
          port: req.body.port
        }
      })
    }
  })
})

app.post('/sensor.mode', function (req, res) {
  var writePath = path.join(req.body.path, 'mode')
  fs.writeFile(writePath, req.body.mode, function (err) {
    if (err) {
      res.json({
        ok: false,
        msg: err
      })
    } else {
      res.json({ ok: true })
    }
  })
})

app.post('/sensors.find', function (req, res) {
  var currentDevices = ports.reduce(function (obj, port) {
    try {
      var path = devices(port)
      obj[port] = {
        path: path,
        type: fs.readFileSync(path + '/driver_name', 'utf-8').trim()
      }
    } catch (e) {
      obj[port] = {
        type: 'No device connected'
      }
    }
    return obj
  }, {})
  res.json({
    ok: true,
    currentDevices: currentDevices
  })
})

app.post('/source.update', function (req, res) {
  var update = spawn('git', ['pull'])
  update.stderr.setEncoding('utf-8')
  update.stdout.setEncoding('utf-8')
  update.stderr.on('data', function(data) {
    console.log('error', data)
  })
  update.stdout.on('data', function(data) {
    console.log('message', data)
  })
  update.on('exit', function (msg) {
    res.json({ ok: true, message: 'Pull finished' })
  })
})

function createNode (filePath, fileName) {
  var n = cluster.run(filePath)
  n.stdout.setEncoding('utf-8')
  n.stderr.setEncoding('utf-8')
  n.stdout.on('data', function (data) {
    fs.appendFileSync('log.txt', data)
  })
  n.stderr.on('data', function (data) {
    var trace = parsetrace({stack: data}).object()
    var lineNum = trace.frames.reduce(function (str, next) {
      if (next.file.indexOf('run.js') > -1 && !str) {
        return str += next.line
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
    if(lineNum) {
      fs.appendFileSync('log.txt', err)
    }
  })
  return n
}


app.get('*', function (req, res) {
  res.sendFile(__dirname + '/public/index.html')
})


var port = process.env.port || 3000
http.listen(port)
