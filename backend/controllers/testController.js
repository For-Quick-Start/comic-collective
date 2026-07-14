const testService = require('../services/testService');

const getTest = (req, res) => {
  const data = testService.getTestMessage();
  res.json(data);
};

module.exports = { getTest };
