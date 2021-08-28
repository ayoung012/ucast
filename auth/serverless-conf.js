module.exports = async ({ resolveVariable }) => {
  const tableName = await resolveVariable('self:provider.environment.DYNAMODB_TABLE');
  return {
    codesTableDef: {
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: "code",
          KeyType: "HASH"
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: "code",
          AttributeType: "S"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  };
};
