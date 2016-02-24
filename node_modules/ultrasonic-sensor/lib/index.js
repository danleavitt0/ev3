/**
 * Imports
 */

var inherit = require('component-inherit')
var devices = require('ev3-js-devices')
var Device = require('ev3-js-device')

/**
 * Expose USSensor
 */

module.exports = USSensor['default'] = USSensor

/**
 * USSensor Device
 * @param {Number} port number of touch sensor port
 */
function USSensor (port) {
  try {
    if (!(this instanceof USSensor)) {
      return new USSensor(port)
    }
    Device.call(this, devices(port))
  } catch (e) {
    throw new Error('Can not find ultrasonic sensor in port ' + port)
  }
}

inherit(USSensor, Device)

Object.defineProperties(USSensor.prototype, {
  inches: {
    get: getInches
  },
  cm: {
    get: getCM
  }
})

/**
 * use ultrasonic sensor to get distance in inches
 * @return {Number} distance in inches
 */
function getInches () {
  this.write('mode', 'US-DIST-IN')
  return Number(this.read('value0')) / 10
}

/**
 * use ultrasonic sensor to get distance in cm
 * @return {Number} distance in cm
 */
function getCM () {
  this.write('mode', 'US-DIST-CM')
  var denominator = Math.pow(10, Number(this.read('decimals')))
  return Number(this.read('value0')) / denominator
}
