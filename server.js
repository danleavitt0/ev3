#!/usr/bin/env node

var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var cors = require('cors')
var path = require('path')
var devices = require('ev3-js-devices')
var app = express()
var cluster = require('./cluster')()
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
    if (err) {
      var startString = 'var robot = require(\'ev3-robot\')'
      fs.writeFileSync(file, startString)
      return res.send(startString)
    }
    res.send(data)
  })
})

app.post('/log.get', function (req, res) {
  fs.readFile('log.txt', 'utf-8', function (err, data) {
    if (err) {
      fs.writeFile('log.txt', '', function () {
        res.json({ ok: true, data: 'Created log.txt' })
      })
    } else {
      res.json({ ok: true, data: data })
    }
  })
})

app.post('/log.clear', function (req, res) {
  fs.writeFile('log.txt', '', function () {
    res.json({ ok: true, data: 'Created log.txt' })
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
  if (node) {
    node.kill()
  }
  stopMotors()
  res.json({ok: true})
})

app.post('/file.run', function (req, res) {
  var filePath = path.join(__dirname, '/files/', req.body.fileName)
  node = cluster.run(filePath, function (err) {
    if (err) {
      return res.json({ok: false, message: err})
    }
    return res.json({ok: true, message: 'Run finished'})
  })
})

app.post('/file.getAll', function (req, res) {
  fs.readdir(__dirname + '/files', function (err, data) {
    if (err) {
      res.send({})
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
  update.stderr.on('data', function (data) {
    console.log('error', data)
  })
  update.stdout.on('data', function (data) {
    console.log('message', data)
  })
  update.on('exit', function (msg) {
    res.json({ ok: true, message: 'Pull finished' })
  })
})

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

function stopMotors () {
  try {
    MoveSteering().reset()
  } catch (e) {
    console.warn('no motors attached')
  }
}

var port = process.env.port || 3000
var server = app.listen(port)
server.timeout = 1800000
