'use strict';

const createHandler = require('./util');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');

const func = async ({ event, context, services: { ddb, date } }) => {
    const code = event.queryStringParameters.c;
    const session = event.queryStringParameters.s;
    return ddb.send(new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            "code": { S: code }
        }
    }))
    .then(obj => {
        const item = obj.Item;
        var body;
        if (
          typeof item !== 'undefined' &&
          Math.floor(date.getTime() / 1000) < Number(item.init_ts.N) + 5 * 60 &&
          code == item.code.S &&
          session == item.session.S
        ) {
            body = {
                result: "OK",
                access_token: item.access_token.S,
                album: item.album.S
            };
        } else {
            body = {
                result: "NOK"
            };
        }
        return body;
    })
    .catch(err => {
      console.log("Error reading from DynamoDB");
      console.log(err);
        return {
          result: "NOK"
        };
    })
    .then(res => {
        return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': process.env.WEB_ENDPOINT,
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(res)
        };
    });
};
module.exports = createHandler(func);
