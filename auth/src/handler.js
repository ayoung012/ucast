const provideSync = require('./provideSync');
const acceptSync = require('./acceptSync');
const checkSync = require('./checkSync');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

module.exports.endpoint = (event, context) => {
    console.log(event);
    console.log(event.path);
  const router = {
    '/sync': provideSync,
    '/code': acceptSync,
    '/check': checkSync
  };

  if (!router.hasOwnProperty(event.path)) {
    return {
      statusCode: 404,
      body: "404 Not found"
    }
  }
  const ddb = new DynamoDBClient({
    region: process.env.DYNAMODB_REGION
  });
  const services = {
    ddb: ddb,
    date: new Date()
  };
  return router[event.path](services)(event, context);
};
