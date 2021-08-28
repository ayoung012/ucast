const tableDefProvider = require('./serverless-conf');

/* Define table name env variable for test runtime. */
process.env.DYNAMODB_TABLE = "tokens";

// Please note, this function is resolved
// once per test file
module.exports = {
  tables: async () => {
    const { codesTableDef } = await tableDefProvider(
      {
        resolveVariable: () => new Promise(
          (res) => res(process.env.DYNAMODB_TABLE)
        )
      }
    );

    return [codesTableDef];
  },
  basePort: 8000
};
