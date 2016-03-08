while (true) {
  motors()
}

function motors () {
  var rand = Math.floor(Math.random() * 100) + 1
  if (rand === 5) {
    throw new Error('break')
  }
}
