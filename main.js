const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const WebSocket = require('ws')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.ws = null
		this.connected = false
		this.pollInterval = null
	}

	async init(config) {
		this.config = config
		this._initConnection()

		this.updateStatus(InstanceStatus.Ok)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	async destroy() {
		this.log('debug', 'destroy')
		if (this.pollInterval) {
			clearInterval(this.pollInterval)
		}
		if (this.ws) {
			this.ws.close()
		}
	}

	async configUpdated(config) {
		this.config = config
		this._initConnection()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'SMAART IP',
				width: 8,
				regex: Regex.IP,
				default: '127.0.0.1',
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'SMAART Port',
				width: 4,
				regex: Regex.PORT,
				default: '26000',
			},
			{
				type: 'dropdown',
				id: 'leqWindow',
				label: 'Leq Time Window',
				width: 6,
				default: '1s',
				choices: [
					{ id: '1s', label: '1 Second' },
					{ id: '5s', label: '5 Seconds' },
					{ id: '15s', label: '15 Seconds' },
					{ id: '30s', label: '30 Seconds' },
					{ id: '1m', label: '1 Minute' }
				]
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Polling Interval (ms)',
				width: 6,
				default: 500,
				min: 100,
				max: 5000,
				step: 100
			}
		]
	}

	_initConnection() {
		if (this.pollInterval) {
			clearInterval(this.pollInterval)
		}
		if (this.ws) {
			this.ws.close()
		}

		this.updateStatus(InstanceStatus.Connecting)

		const wsUrl = `ws://${this.config.host}:${this.config.port}/api`
		this.ws = new WebSocket(wsUrl)

		this.ws.on('open', () => {
			this.connected = true
			this.updateStatus(InstanceStatus.Ok)
			this.log('info', 'Connected to SMAART')
			this.setVariableValues({
				'connection_status': 'Connected',
				'current_window': this.config.leqWindow
			})
			this._subscribeMeasurements()
		})

		this.ws.on('close', () => {
			this.connected = false
			this.updateStatus(InstanceStatus.Disconnected)
			this.log('error', 'Disconnected from SMAART')
			this.setVariableValues({
				'connection_status': 'Disconnected'
			})
			setTimeout(() => this._initConnection(), 5000)
		})

		this.ws.on('error', (error) => {
			this.log('error', `WebSocket error: ${error.message}`)
		})

		this.ws.on('message', (data) => {
			try {
				const message = JSON.parse(data)
				this._handleMessage(message)
			} catch (e) {
				this.log('error', `Failed to parse message: ${e.message}`)
			}
		})
	}

	_subscribeMeasurements() {
		if (this.connected) {
			const subscribeMessage = {
				command: 'subscribe',
				type: 'measurement',
				data: {
					metric: 'leq',
					window: this.config.leqWindow
				}
			}
			this.ws.send(JSON.stringify(subscribeMessage))
		}
	}

	_requestMeasurement() {
		if (this.connected) {
			const requestMessage = {
				command: 'get_measurement',
				type: 'measurement',
				data: {
					metric: 'leq',
					window: this.config.leqWindow
				}
			}
			this.ws.send(JSON.stringify(requestMessage))
		}
	}

	_handleMessage(message) {
		if (message.type === 'measurement' && message.data?.leq) {
			this.setVariableValues({
				'current_leq': message.data.leq.toFixed(1)
			})
		}
	}

	startPolling() {
		if (!this.pollInterval) {
			this.pollInterval = setInterval(() => {
				if (this.connected) {
					this._requestMeasurement()
				}
			}, this.config.pollInterval)
		}
	}

	stopPolling() {
		if (this.pollInterval) {
			clearInterval(this.pollInterval)
			this.pollInterval = null
		}
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
