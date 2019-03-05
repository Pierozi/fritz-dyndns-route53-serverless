'use strict';
const aws = require('aws-sdk');

/**
 * Format API Gateway response
 * @param {number} statusCode
 * @param {object} body
 */
const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*"
    },
    body: body ? JSON.stringify(body) : null
  };
};

exports.handler = async (event, context) => {
  //return createResponse(403, {"error": "Not authorized"});
  return createResponse(200, {"status": true});
};
