module.exports = class extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseFullError'
    Error.captureStackTrace(this, this.constructor)
  }
}