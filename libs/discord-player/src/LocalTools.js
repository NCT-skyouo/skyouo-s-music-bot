function s2ms (s) {
  return parseInt(s) * 1000
}
function ms2mmss (ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

module.exports = {
  s2ms: s2ms,
  ms2mmss: ms2mmss
}
