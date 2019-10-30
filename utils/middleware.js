const joi = require('joi')
const passport = require('passport')
const db = require('../database/models')
const {superError} = require('./error')
// eslint-disable-next-line no-unused-vars
const express = require('express')
const Logger = require('./logger')

/**
 *
 * @param {json} value
 * @param {joi} schema
 * @param {joi.options} options
 * @param {number} errorStatus
 * @return {json}
 */
function validateSchema(value, schema, options = {abortEarly: false}, errorStatus = 400) {
  const result = joi.validate(value, schema, options)
  if (result.error) {
    superError().status(errorStatus).message(result.error.message)
    /**
         * Will throw 500 when data can't be JSON.stringify, such as value from sequelize without raw: true
         */
        .data({details: result.error.details})
        .throw()
  }
  return result.value
}

/**
 * @param {{schema: joi.AnySchema, options: joi.ValidationOptions, apiOptions: {queryMode: boolean}}} a
 * @param {function} operation
 * @param {{schema: joi.AnySchema, options: joi.ValidationOptions, apiOptions: {queryMode: boolean}}} b
 * @param {{number}} status
 * @return {*}
 */
exports.validateSchemas = (
    {schema: reqSchema, options: reqSchemaOptions, apiOptions = {}},
    operation,
    {schema: resSchema, options: resSchemaOptions = {stripUnknown: true, abortEarly: false}} = {},
    status = 200) => {
  /**
   * @param {express.request} req
   * @param {express.response} res
   * @param {*} next
   */
  return async (req, res, next) => {
    try {
      if (apiOptions.queryMode) {
        req.query = validateSchema(req.query, reqSchema, reqSchemaOptions)
      } else {
        req.body = validateSchema(req.body, reqSchema, reqSchemaOptions)
      }
      let body = await operation(req)
      body = validateSchema(body, resSchema, resSchemaOptions, 510)
      res.status(status).send(body)
    } catch (error) {
      next(error)
    }
  }
}

exports.validateSchemasAndSetTrans = (
    {schema: reqSchema, options: reqSchemaOptions, apiOptions = {}},
    operation,
    {schema: resSchema, options: resSchemaOptions = {stripUnknown: true, abortEarly: false}},
    status = 200) => {
  /**
   * @param {express.request} req
   * @param {express.response} res
   * @param {*} next
   */
  return async (req, res, next) => {
    try {
      if (apiOptions.queryMode) {
        req.query = validateSchema(req.query, reqSchema, reqSchemaOptions)
      } else {
        req.body = validateSchema(req.body, reqSchema, reqSchemaOptions)
      }
      req.transaction = await db.createDbTransaction()
      let body = await operation(req, res)
      body = validateSchema(body, resSchema, resSchemaOptions, 510)
      await req.transaction.commit()
      res.status(status).send(body)
    } catch (error) {
      req.transaction && !req.transaction.finished && await req.transaction.rollback()
      next(error)
    }
  }
}

exports.validateToken = () => passport.authenticate('jwt', {session: false})

exports.validateTokenAndSchemas = (reqSchema, operation, resSchema, status = 200) => {
  return [
    exports.validateToken(),
    exports.validateSchemas(reqSchema, operation, resSchema, status)
  ]
}

/**
 * @param {{schema: joi.schema, options: joi.options}} reqSchemeObject
 * @param {function} operation
 * @param {{schema: joi.schema, options: joi.options}} resSchemeObject
 * @param {number} status
 * @return {Array}
 */
exports.validateTokenAndSchemasAndSetTrans = (reqSchemeObject, operation, resSchemeObject, status = 200) => {
  return [
    exports.validateToken(),
    exports.validateSchemasAndSetTrans(reqSchemeObject, operation, resSchemeObject, status)
  ]
}

/**
 * @param {express.request} req
 * @param {express.response} res
 * @param {*} next
 */
exports.requestLogger = (req, res, next) => {
  try {
    Logger.info('received request', {
      header: {
        'host': req.headers.host,
        'origin': req.headers.origin,
        'user-agent': req.headers['user-agent'],
        'authorization:': req.headers.authorization,
        'referer': req.headers.referer
      },
      method: req.method,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body
    })
    next()
  } catch (error) {
    next(error)
  }
}
