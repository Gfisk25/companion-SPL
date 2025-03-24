module.exports = function (self) {
	self.setVariableDefinitions([
		{ variableId: 'current_leq', name: 'Current Leq Value' },
		{ variableId: 'connection_status', name: 'SMAART Connection Status' },
		{ variableId: 'current_window', name: 'Current Leq Time Window' },
	])
}
