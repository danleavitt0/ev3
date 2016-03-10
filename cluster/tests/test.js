var test = require('tape')
var cluster = require('../index')
var path = require('path')


var noError = path.join(__dirname, 'noError.js')
var withError = path.join(__dirname, 'withError.js')

test('normal run', function (t) {
  t.plan(2)
  var c = cluster()
  c.run(noError, function (err) {
    if (err) { return t.fail(err) }
    t.equals(c.isRunning(), false)
  })
  t.equals(c.isRunning(), true)
})

test('broken run', function (t) {
  t.plan(3)
  var c = cluster()
  c.run(withError, function (err) {
    if (err) { console.log(err) }
    t.equal(c.isRunning(), false)
  })
  t.equal(c.isRunning(), true)
  c.run(withError, function (err) {
    t.ok(err, 'should have an error')
  })
})

test('forever run', function (t) {
  t.plan(2)
  var c = cluster()
  var node = c.run(path.join(__dirname, 'forever.js'), function (err) {
    if (err) { console.log(err) }
    t.equal(c.isRunning(), false)
  })

  t.equal(c.isRunning(), true)
  node.kill()
  c.stop()
})
