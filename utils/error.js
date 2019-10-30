class SuperError {
  constructor(status, message, data, body) {
    this.error = new Error()
    this.error.status = status
    this.error.message = message
    this.error.data = data
    this.error.body = body
  }

  /**
   * @param {number} status
   * @return {SuperError}
   */
  status(status) {
    this.error.status = status
    return this
  }

  /**
   * @param {JSON} data
   * @return {SuperError}
   */
  data(data) {
    this.error.data = data
    return this
  }

  body(body) {
    this.error.body = body
    return this
  }

  /**
   * @param {string} message
   * @return {SuperError}
   */
  message(message) {
    this.error.message = message
    return this
  }

  throw() {
    throw this.error
  }
}

/**
 * @param {number} status
 * @param {string} message
 * @param {JSON} data
 * @param {JSON} body
 * @return {SuperError}
 */
exports.superError = (status, message, data, body) => new SuperError(status, message, data, body)
