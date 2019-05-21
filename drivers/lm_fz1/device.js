'use strict'

const Homey = require('homey')
const util = require('../../node_modules/homey-meshdriver/lib/util')
const { ZigBeeDevice } = require('homey-agressive-zigbee')

class LM_FZ1 extends ZigBeeDevice {
	onMeshInit() {
		this.log('LM_FZ1 has been inited')

		this.registerCapability('onoff.1', 'genOnOff', {
			getOpts: { pollInterval: 1000 },
			endpoint: 0
		})
		this.registerCapability('dim.1', 'genLevelCtrl', {
			getOpts: { pollInterval: 1000 },
			setParser: (value, opts = {}) => {
				value = Math.round(value * 4)
				if (value < 4) {
					value = value * 63
				} else {
					value = 255
				}

				if (value === 0) {
					this.setCapabilityValue('onoff', false)
				} else if (this.getCapabilityValue('onoff') === false && value > 0) {
					this.setCapabilityValue('onoff', true)
				}

				return {
					level: value,
					transtime: util.calculateZigBeeDimDuration({ ...opts, duration: 2000 }, this.getSettings()),
				}
			},
			endpoint: 0
		})
	}

	onTrigger(capabilityId, value) {
		// Homey.app.trigger('trigger_fz1', this, {}, { capabilityId, value })
	}
}

module.exports = LM_FZ1
