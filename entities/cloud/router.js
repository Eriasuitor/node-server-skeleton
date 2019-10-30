const joi = require('joi')
const CloudController = require('./controller')
const {validateSchemas} = require('../../utils/middleware')
// eslint-disable-next-line no-unused-vars
const express = require('express')

/**
 * @param {express.application} app
 */
exports.router = (app) => {
  app.get(
      '/cloud/oss/bulk-url-generator',
      validateSchemas({
        schema: joi.any()
      },
      CloudController.signatureUrls,
      {
        schema: joi.object().keys({
          success: joi.boolean().required()
        }).required()
      }
      )
  )
}
