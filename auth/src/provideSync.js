'use strict';

const createHandler = require('./util');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const crypto = require('crypto');

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

const func = async ({ event, context, services: { ddb, date } }) => {
    const code = randomString(6, '123456789ABCDEFGHJKLMNPQRSTUVWXYZ');
    const session = crypto.randomBytes(32).toString('base64');

    return ddb.send(new PutItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          'id': {S: context.awsRequestId},
          'init_ts': {N: Math.floor(date.getTime() / 1000).toString()},
          'code': {S: code},
          'session': {S: session}
        }
      }))
    .then(res => {
      return {result: "OK"};
    })
    .catch(err => {
      console.log("Error writing to DynamoDB");
      console.log(err);
      return {result: "NOK"};
    })
    .then(res => {
        return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': process.env.WEB_ENDPOINT,
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                message: res.result,
                c: code,
                s: session
            })
        };
    });
}
module.exports = createHandler(func);
