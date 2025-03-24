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
	}

	async init(config) {
		this.config = config
		this.initConnection()

		this.updateStatus(InstanceStatus.Ok)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	async destroy() {
		if (this.ws) {
			this.ws.close()
		}
	}

	async configUpdated(config) {
		this.config = config
		this.initConnection()
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
				default: '9000',
			},
		]
	}

	initConnection() {
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
			this.subscribeMeasurements()
		})

		this.ws.on('close', () => {
			this.connected = false
			this.updateStatus(InstanceStatus.Disconnected)
			this.log('error', 'Disconnected from SMAART')
			setTimeout(() => this.initConnection(), 5000)
		})

		this.ws.on('error', (error) => {
			this.log('error', `WebSocket error: ${error.message}`)
		})

		this.ws.on('message', (data) => {
			try {
				const message = JSON.parse(data)
				this.handleMessage(message)
			} catch (e) {
				this.log('error', `Failed to parse message: ${e.message}`)
			}
		})
	}

	subscribeMeasurements() {
		if (this.connected) {
			const subscribeMessage = {
				command: 'subscribe',
				type: 'measurement',
				data: {
					metric: 'leq',
					window: '1s'
				}
			}
			this.ws.send(JSON.stringify(subscribeMessage))
		}
	}

	handleMessage(message) {
		if (message.type === 'measurement' && message.data?.leq) {
			this.setVariableValues({
				'current_leq': message.data.leq.toFixed(1)
			})
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
