const createHandler = handler => services => (event, context) =>
      handler({ event, context, services });

module.exports = createHandler;
