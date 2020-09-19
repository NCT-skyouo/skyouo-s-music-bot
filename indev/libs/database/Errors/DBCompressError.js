module.exports = class extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseCompressError'
    Error.captureStackTrace(this, this.constructor)
  }
}