const CloudService = require('./service')
// eslint-disable-next-line no-unused-vars
const express = require('express')

/**
 * @param {express.request} req
 */
exports.signatureUrls = async (req) => {
  return CloudService.getOssUrls()
}
