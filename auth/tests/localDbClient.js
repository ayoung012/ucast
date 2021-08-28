const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

exports.ddb = new DynamoDBClient({
  convertEmptyValues: true,
  endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
  tls: false,
  region: "local",
});
