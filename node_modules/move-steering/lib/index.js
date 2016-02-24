/**
 * Imports
 */

var Motor = require('ev3-js-motor')
var defaults = require('101/defaults')

/**
 * Vars
 */

var motorDefaults = {
  speed: 300,
  braking: 'brake',
  wait: false
}

/**
 * Expose MoveSteering
 */

module.exports = MoveSteering

/**
 * MoveSteering drives with two motors at the same time
 * @param  {String} leftPort  letter of port for left motor
 * @param  {String} rightPort letter of port for right motor
 */

function MoveSteering (leftPort, rightPort) {
  if (!(this instanceof MoveSteering)) {
    return new MoveSteering(leftPort, rightPort)
  }

  try {
    this.left = new Motor(leftPort || 'b')
    this.right = new Motor(rightPort || 'c')
  } catch (e) {
    throw new Error('Cannot find motors')
  }
}

/**
 * Run motors forever
 * @param  {Number} speed speed of motor
 * @param  {Object} opts  object of optional params
 */

MoveSteering.prototype.forever = function (speed, turn, opts) {
  speed = speed || motorDefaults.speed
  var speeds = turnToSpeeds(turn, speed)

  this.left.forever(speeds.left, defaults(opts, motorDefaults))
  this.right.forever(speeds.right, defaults(opts, motorDefaults))
}

/**
 * Run drive motors for a number of degrees
 * @param  {Number} degrees degrees to turn motor
 * @param  {Number} speed   speed at which to turn motors
 * @param  {Number} turn    turn direction
 */

MoveSteering.prototype.degrees = function (degrees, speed, turn) {
  speed = speed || motorDefaults.speed

  var opts = turnToDegrees(turn, speed, degrees)
  this.left.degrees(opts.left.degrees, {speed: opts.left.speed, wait: false})
  this.right.degrees(opts.right.degrees, {speed: opts.right.speed, wait: false})
  this.wait()
}

/**
 * Run drive motors for a number of rotations
 * @param  {Number} rotations number of rotations to turn the motor
 * @param  {Number} speed     speed at which to turn motors
 * @param  {Number} turn      turn direction
 */

MoveSteering.prototype.rotations = function (rotations, speed, turn) {
  speed = speed || motorDefaults.speed
  this.degrees(Math.round(rotations * 360), speed, turn)
}

/**
 * Run drive motors for a specified amount of time
 * @param  {Number} time  time to run the motors for (in milliseconds)
 * @param  {Number} speed speed at which to turn motors
 * @param  {Number} turn  turn direction
 */

MoveSteering.prototype.timed = function (time, speed, turn) {
  speed = speed || motorDefaults.speed

  var speeds = turnToSpeeds(turn, speed)
  this.left.timed(time, {speed: speeds.left, wait: false})
  this.right.timed(time, {speed: speeds.right, wait: false})
  this.wait()
}

/**
 * Stops motors
 */

MoveSteering.prototype.stop = function () {
  this.left.stop()
  this.right.stop()
}

/**
 * Reset motors
 */

MoveSteering.prototype.reset = function () {
  this.left.reset()
  this.right.reset()
}

/**
 * Wait for motors to stop
 */

MoveSteering.prototype.wait = function () {
  while (this.left.is('running') || this.right.is('running')) {}
}

/**
 * Convert turn in to left and right speeds
 * @param  {Number} turn  -100 to 100
 * @param  {Number} speed
 * @return {Object}
 */

function turnToSpeeds (turn, speed) {
  turn = Math.max(Math.min(turn, 100), -100)

  var reducedSpeed = otherSpeed(turn, speed)

  return {
    left: turn < 0 ? reducedSpeed : speed,
    right: turn > 0 ? reducedSpeed : speed
  }
}

/**
 * Params for degrees based on turn
 * @param  {Number} turn
 * @param  {Number} speed
 * @param  {Number} degrees
 * @return {Object} opts    object of degrees and speed for each motor
 */

function turnToDegrees (turn, speed, degrees) {
  turn = Math.max(Math.min(turn, 100), -100)

  var opts = turnToSpeeds(turn, speed)
  opts.left = { speed: opts.left }
  opts.right = { speed: opts.right }

  var reducedSpeed = otherSpeed(turn, speed)
  var reducedDegrees = Math.round((reducedSpeed / speed) * degrees)
  reducedSpeed = Math.abs(reducedSpeed)

  opts.left.degrees = turn < 0 ? reducedDegrees : degrees
  opts.right.degrees = turn > 0 ? reducedDegrees : degrees

  return opts
}

/**
 * Calculate off wheel speed
 * @param  {Number} turn
 * @param  {Number} speed
 * @return {Number} speed of the off motor
 */

function otherSpeed (turn, speed) {
  return Math.round(speed * ((100 - (Math.abs(turn) * 2)) / 100))
}
