class SuperError extends Error {
  constructor(status, message, data, body) {
    super()
    this.status = status
    this.message = message
    this.data = data
    this.body = body
  }

  /**
   * @param {number} status
   * @return {SuperError}
   */
  status(status) {
    this.status = status
    return this
  }

  /**
   * @param {JSON} data
   * @return {SuperError}
   */
  data(data) {
    this.data = data
    return this
  }

  body(body) {
    this.body = body
    return this
  }

  /**
   * @param {string} message
   * @return {SuperError}
   */
  message(message) {
    this.message = message
    return this
  }

  throw() {
    // eslint-disable-next-line no-throw-literal
    throw this
  }
}

/**
 * @param {number} status
 * @param {string} message
 * @param {JSON} data
 * @param {JSON} body
 * @return {SuperError}
 */
const superError = (status, message, data, body) => new SuperError(status, message, data, body)

module.exports = {
  superError
}
