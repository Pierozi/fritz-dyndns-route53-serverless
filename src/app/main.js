'use strict';
const AWS = require('aws-sdk');
const route53 = new AWS.Route53({apiVersion: '2013-04-01'});
const { hostedZoneId, rsDomain, username, password } = process.env;

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

const updateRecord = (ip, callback) => {
  const params = {
    ChangeBatch: {
      Changes: [{
        Action: "UPSERT",
        ResourceRecordSet: {
          Name: rsDomain,
          ResourceRecords: [{
            Value: ip
          }],
          TTL: 60,
          Type: "A"
        }
      }],
      Comment: "FRITZ!Box record"
    },
    HostedZoneId: hostedZoneId
  };
  route53.changeResourceRecordSets(params, (err, data) => {
    callback(err, data && data.hasOwnProperty('ChangeInfo') ? data.ChangeInfo.Status : 'FAIL');
  });
};

const checkBasicAuth = (headers) => {
  if (!headers.hasOwnProperty('Authorization')) {
    return false;
  }
  const basic = new Buffer(headers.Authorization.split(' ')[1], 'base64').toString();
  const reqCredentials = basic.split(':');

  return !(reqCredentials[0] !== username || reqCredentials[1] !== password);
};

exports.handler = (event, context, callback) => {
  if (false === checkBasicAuth(event.headers)) {
    callback(null, createResponse(403, {"error": "Not authorized"}));
  }
  if (!event.headers.hasOwnProperty('X-Forwarded-For')) {
    callback(null, createResponse(500, {"error": "missing ip in proxy http headers"}));
  }
  updateRecord(event.headers['X-Forwarded-For'], (err, success) => {
    if (err) {
      console.error(err);
    }
    callback(err, createResponse(200, {"status": success}));
  });
};
