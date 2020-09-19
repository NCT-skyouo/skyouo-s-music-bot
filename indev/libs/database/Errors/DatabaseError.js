module.exports = class extends Error {
  /**
  * @param {string} message - message of error.
  */
  constructor(message) {
    super(message)
    this.name = 'DatabaseError'
    Error.captureStackTrace(this, this.constructor)
  }
}