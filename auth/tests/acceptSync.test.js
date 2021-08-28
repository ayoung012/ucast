const { PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { ddb } = require('./localDbClient');
const acceptSync = require('../src/acceptSync');

const services = {
  ddb: ddb,
  date: new Date()
};

test('accept valid sync code', async () => {
  const sync = {
    code: "windowsill",
    access_token: "boardroom",
    exp: "300",
    album: "oykot2020"
  };
  const event = {
    'body': JSON.stringify(sync)
  };
  const context = {
    awsRequestId: "somecontext"
  };

  await ddb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        'id': {S: context.awsRequestId},
        'init_ts': {N: Math.floor(services.date.getTime() / 1000).toString()},
        'code': {S: sync.code},
        'session': {S: "garthnader"}
      }
  }));
  
  return acceptSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    expect(body.message).toBe("OK");

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
      expect(obj.Item).toHaveProperty("sync_ts");
      expect(obj.Item).toHaveProperty("exp");
      expect(obj.Item).toHaveProperty("album");

      expect(obj.Item.access_token).toStrictEqual({S: sync.access_token});
      expect(obj.Item.sync_ts).toStrictEqual({N: Math.floor(services.date.getTime() / 1000).toString()});
      expect(obj.Item.exp).toStrictEqual({N: sync.exp});
      expect(obj.Item.album).toStrictEqual({S: sync.album});
    });
  });
});

test('reject invalid sync code', async () => {
  const sync = {
    code: "windowsill",
    access_token: "boardroom",
    exp: "300",
    album: "oykot2020"
  };
  const event = {
    'body': JSON.stringify(sync)
  };
  const context = {
    awsRequestId: "somecontext"
  };

  await ddb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        'id': {S: context.awsRequestId},
        'init_ts': {N: Math.floor(services.date.getTime() / 1000).toString()},
        'code': {S: sync.code + "invalid"},
        'session': {S: "garthnader"}
      }
  }));
  
  return acceptSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    expect(body.message).toBe("NOK");

    // database contents
    ddb.send(new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          "code": { S: sync.code + "invalid" }
        }
    }))
    .then(obj => {
      expect(obj).toHaveProperty("Item");
      expect(obj.Item).not.toHaveProperty("access_token");
      expect(obj.Item).not.toHaveProperty("sync_ts");
      expect(obj.Item).not.toHaveProperty("exp");
      expect(obj.Item).not.toHaveProperty("album");
    });
  });
});

test('reject expired sync code', async () => {
  const sync = {
    code: "windowsill",
    access_token: "boardroom",
    exp: "300",
    album: "oykot2020"
  };
  const event = {
    'body': JSON.stringify(sync)
  };
  const context = {
    awsRequestId: "somecontext"
  };

  await ddb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        'id': {S: context.awsRequestId},
        'init_ts': {N: (Math.floor(services.date.getTime() / 1000) - 6*60).toString()},
        'code': {S: sync.code},
        'session': {S: "garthnader"}
      }
  }));
  
  return acceptSync(services)(event, context)
  .then(res => {
    // web response
    expect(res).toHaveProperty('body')
    const body = JSON.parse(res.body);
    expect(body.message).toBe("NOK");

    // database contents
    ddb.send(new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          "code": { S: sync.code }
        }
    }))
    .then(obj => {
      expect(obj).toHaveProperty("Item");
      expect(obj.Item).not.toHaveProperty("access_token");
      expect(obj.Item).not.toHaveProperty("sync_ts");
      expect(obj.Item).not.toHaveProperty("exp");
      expect(obj.Item).not.toHaveProperty("album");
    });
  });
});

