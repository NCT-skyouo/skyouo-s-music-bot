const FRONT_COLOR = {
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m'
}

const CLEAR_COLOR = '\x1b[0m'

function gulpColor (text, color) {
  if (!color) {
    return text
  } else if (text && typeof FRONT_COLOR[color] === 'string') {
    return FRONT_COLOR[color.toUpperCase()] + text + CLEAR_COLOR
  }
}

module.exports = gulpColor
