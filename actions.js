module.exports = function (self) {
	self.setActionDefinitions({
		reconnect: {
			name: 'Reconnect to SMAART',
			options: [],
			callback: async () => {
				self._initConnection()
			},
		},
		changeLeqWindow: {
			name: 'Change Leq Time Window',
			options: [
				{
					id: 'window',
					type: 'dropdown',
					label: 'Time Window',
					choices: [
						{ id: '1s', label: '1 Second' },
						{ id: '5s', label: '5 Seconds' },
						{ id: '15s', label: '15 Seconds' },
						{ id: '30s', label: '30 Seconds' },
						{ id: '1m', label: '1 Minute' }
					],
					default: '1s',
				},
			],
			callback: async (event) => {
				if (self.connected) {
					self.config.leqWindow = event.options.window
					self.setVariableValues({
						'current_window': event.options.window
					})
					self._subscribeMeasurements()
				}
			},
		},
		startMonitoring: {
			name: 'Start Monitoring',
			options: [],
			callback: async () => {
				if (self.connected) {
					self._subscribeMeasurements()
					self.startPolling()
				}
			},
		},
		stopMonitoring: {
			name: 'Stop Monitoring',
			options: [],
			callback: async () => {
				self.stopPolling()
			},
		},
	})
}
