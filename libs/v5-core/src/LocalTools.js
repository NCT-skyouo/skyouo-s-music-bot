function s2ms(s) {
  return parseInt(s) * 1000
}

/*function ms2mmss (ms) {
  if (!ms && !(ms <= 0)) return "0:00"
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}*/

function ms2mmss(ms) {
  if (!ms && !(ms <= 0)) return "00:00"
  var hhmmss = new Date(ms).toISOString().slice(11,19).split(":")
  if (hhmmss[0] === "00") return hhmmss.slice(1).join(":")
  else return hhmmss.join(":")
}

function hmmss2ms(duration) {
  const args = duration.split(':')
  if (args.length === 3) {
    return parseInt(args[0]) * 60 * 60 * 1000 +
      parseInt(args[1]) * 60 * 1000 +
      parseInt(args[2]) * 1000
  } else if (args.length === 2) {
    return parseInt(args[0]) * 60 * 1000 +
      parseInt(args[1]) * 1000
  } else {
    return parseInt(args[0]) * 1000
  }
}

module.exports = {
  s2ms,
  ms2mmss,
  hmmss2ms
}
