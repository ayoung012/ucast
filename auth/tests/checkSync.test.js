const { PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { ddb } = require('./localDbClient');
const checkSync = require('../src/checkSync');

const services = {
  ddb: ddb,
  date: new Date()
};

const sync = {
  code: "windowsill",
  session: "garthnader",
  access_token: "boardroom",
  exp: "300",
  album: "oykot2020"
};
const event = {
  queryStringParameters: {
    c: sync.code,
    s: sync.session
  }
};
const context = {
  awsRequestId: "somecontext"
};

test('check validated sync code returns access token', async () => {
  await ddb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        'id': {S: context.awsRequestId},
        'init_ts': {N: Math.floor(services.date.getTime() / 1000).toString()},
        'code': {S: sync.code},
        'session': {S: sync.session},
        'access_token': {S: sync.access_token},
        'album': {S: sync.album}
      }
  }));
  
  return checkSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    expect(body.result).toBe("OK");
    expect(body.access_token).toBe(sync.access_token);
    expect(body.album).toBe(sync.album);

    // database contents
    ddb.send(new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          "code": { S: sync.code}
        }
    }))
    .then(obj => {
      expect(obj).toHaveProperty("Item");
      expect(obj.Item).toHaveProperty("access_token");
      expect(obj.Item).toHaveProperty("album");

      expect(obj.Item.access_token).toStrictEqual({S: sync.access_token});
      expect(obj.Item.album).toStrictEqual({S: sync.album});
    });
  });
});

test('reject check with invalid sync code', async () => {
  await ddb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        'id': {S: context.awsRequestId},
        'init_ts': {N: Math.floor(services.date.getTime() / 1000).toString()},
        'code': {S: sync.code + "invalid"},
        'session': {S: sync.session},
        'access_token': {S: sync.access_token},
        'album': {S: sync.album}
      }
  }));
  
  return checkSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    expect(body.result).toBe("NOK");
  });
});

test('reject check with invalid session', async () => {
  await ddb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        'id': {S: context.awsRequestId},
        'init_ts': {N: Math.floor(services.date.getTime() / 1000).toString()},
        'code': {S: sync.code},
        'session': {S: sync.session + "invalid"},
        'access_token': {S: sync.access_token},
        'album': {S: sync.album}
      }
  }));
  
  return checkSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    expect(body.result).toBe("NOK");
  });
});

test('reject expired sync code', async () => {
  await ddb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        'id': {S: context.awsRequestId},
        'init_ts': {N: (Math.floor(services.date.getTime() / 1000) - 6*60).toString()},
        'code': {S: sync.code},
        'session': {S: sync.session},
        'access_token': {S: sync.access_token},
        'album': {S: sync.album}
      }
  }));
  
  return checkSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    expect(body.result).toBe("NOK");
  });
});

