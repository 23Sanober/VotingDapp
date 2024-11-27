const ElectionManagement = artifacts.require("ElectionManagement");

module.exports = function (deployer) {
  deployer.deploy(ElectionManagement);
};
