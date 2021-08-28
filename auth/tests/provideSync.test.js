const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { ddb } = require('./localDbClient');
const provideSync = require('../src/provideSync')

test('Request sync code', async () => {
  const services = {
    ddb: ddb,
    date: new Date()
  };

  const event = null;
  const context = {
    awsRequestId: "somecontext"
  };
  
  return provideSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    //expect(body).toBe({result: "OK"});
    expect(body.message).toBe("OK");

    // database contents
    ddb.send(new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            "code": { S: body.c}
        }
    }))
    .then(obj => {
      expect(obj).toHaveProperty("Item");
      expect(obj.Item).toHaveProperty("code");
      expect(obj.Item).toHaveProperty("session");
      expect(obj.Item).toStrictEqual({
          'id': {S: context.awsRequestId},
          'init_ts': {N: Math.floor(services.date.getTime() / 1000).toString()},
          'code': {S: body.c},
          'session': {S: body.s}
      });
    });
  });
});

