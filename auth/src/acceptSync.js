'use strict';

const createHandler = require('./util');
const { UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const func = async ({ event, context, services: { ddb, date } }) => {
    const body = JSON.parse(event.body);
    return ddb.send(new UpdateItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {code: {S: body.code}},
        UpdateExpression: 'SET access_token = :t, sync_ts = :ts, exp = :exp, album = :album',
        ConditionExpression: 'code = :c AND :init_exp < init_ts',
        ExpressionAttributeValues: {
            ':t': {S: body.access_token},
            ':c': {S: body.code},
            ':init_exp': {N: (Math.floor(date.getTime() / 1000) - 300).toString()},
            ':ts': {N: Math.floor(date.getTime() / 1000).toString()},
            ':exp': {N: body.exp},
            ':album': {S: body.album}
        }
      }))
    .then(res => {
      return {result: "OK"};
    })
    .catch(err => {
      if (err.name !== 'ConditionalCheckFailedException') {
        console.log("Error writing to DynamoDB");
        console.log(err);
      }
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
                message: res.result
            })
        };
    });
};
module.exports = createHandler(func);
