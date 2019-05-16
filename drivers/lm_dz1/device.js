'use strict'

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-meshdriver')

class LM_DZ1 extends ZigBeeDevice {

	onInit() {
		super.onInit()

		this._driver = this.getDriver();

		this._getQueue = []
		this._getRegister = {}
		this._getOngoing = false

		this._triggerFlag = {}
		this.value = {}
	}

	onMeshInit() {
		this.log('LM_DZ1 has been inited')

		// this.printNode()

		// let switch_list = [0]
		// switch_list.forEach((endpoint, index) => {
		// 	let capabilityId = `sw${index + 1}_onoff`
		// 	this.registerCapability(capabilityId, 'genOnOff',
		// 		this._createCapabilityOptions(index + 1, endpoint))
		// })
	}

	// use to change state of a switch
	setState(switchNumber, value) {
		// update to switch
		const clusterId = 2 * (switchNumber - 1)
		const cluster = this.node.endpoints[clusterId].clusters['genOnOff'];
		const command = value ? 'on' : 'off'
		cluster.do(command, [])
			.catch(err => {
				this.error(`Error: could not perform genOnOff on ${clusterId}`, err);
				throw new Error(this.__(i18n.error.could_not_reach_device));
			})
			.catch(this.error)

		// update to app
		this.setCapabilityValue(`sw${switchNumber}_onoff`, value);
	}

	// update a value, prepare to trigger a flow
	_update(switchNumber, value) {
		let old_value = this.value[switchNumber]
		this.value[switchNumber] = value

		if (this._triggerFlag[switchNumber] === undefined)
			this._triggerFlag[switchNumber] = 0

		if (value !== old_value) {
			this.log('New state: ', switchNumber, '. Value: ', value)

			this._triggerFlag[switchNumber]++
			this._runTrigger(switchNumber, value)
		}
	}

	// run the trigger when the user input is stable
	_runTrigger(switchNumber) {
		setTimeout(() => {
			this._triggerFlag[switchNumber]--
			if (this._triggerFlag[switchNumber] === 0) {
				let value = this.value[switchNumber]
				if (switchNumber === 1)
					this.log('Run trigger on switch', switchNumber, '. Value: ', value)
				Homey.app.triggerLumi1(this, {}, { switchNumber, value })
			}
		}, 500)
	}

	// override default functions, replace with a polling queue
	_getCapabilityValue(capabilityId, clusterId) {
		if (this._getRegister[capabilityId]) return
		this._getRegister[capabilityId] = true
		this._getQueue.push({ capabilityId, clusterId })

		if (!this._getOngoing) this._processQueue().catch(this.error)
	}

	// process the queue
	async _processQueue() {
		if (this._getQueue.length < 1) return
		this._getOngoing = true
		let { capabilityId, clusterId } = this._getQueue.shift()
		await super._getCapabilityValue(capabilityId, clusterId)
		this._getRegister[capabilityId] = false

		if (this._getQueue.length > 0) {
			this._processQueue()
		} else {
			this._getOngoing = false
		}
	}

	// create the capability option object for registering
	_createCapabilityOptions(switchNumber, endpoint) {
		return {
			set: value => {
				this._update(switchNumber, value)
				return value ? 'on' : 'off'
			},
			setParser: () => ({}),

			get: 'onOff',
			getParser: () => ({}),

			report: 'onOff',
			reportParser: value => {
				this._update(switchNumber, value === 1)
				return value === 1
			},

			getOpts: {
				getOnStart: true,
				getOnOnline: true,
				pollInterval: 1000
			},

			endpoint
		}
	}
}

module.exports = LM_DZ1
