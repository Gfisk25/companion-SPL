module.exports = function (self) {
	self.setActionDefinitions({
		reconnect: {
			name: 'Reconnect to SMAART',
			options: [],
			callback: async () => {
				self.initConnection()
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
						{ id: '10s', label: '10 Seconds' },
					],
					default: '1s',
				},
			],
			callback: async (event) => {
				if (self.connected) {
					const message = {
						command: 'configure',
						type: 'measurement',
						data: {
							metric: 'leq',
							window: event.options.window
						}
					}
					self.ws.send(JSON.stringify(message))
				}
			},
		},
	})
}
