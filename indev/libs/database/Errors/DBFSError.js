module.exports = class extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseFileSystemError'
    Error.captureStackTrace(this, this.constructor)
  }
}