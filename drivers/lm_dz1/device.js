'use strict'

const Homey = require('homey')
const { ZigBeeDevice } = require('homey-agressive-zigbee')

class LM_DZ1 extends ZigBeeDevice {

	onMeshInit() {
		this.log('LM_DZ1 has been inited')

		this.registerCapability('onoff.1', 'genOnOff', {
			getOpts: { pollInterval: 1000 },
			endpoint: 0
		})
		this.registerCapability('dim.1', 'genLevelCtrl', {
			getOpts: { pollInterval: 1000 },
			endpoint: 0
		})
	}

	onTrigger(capabilityId, value) {
		// Homey.app.trigger('trigger_dz1', this, {}, { capabilityId, value })
	}
}

module.exports = LM_DZ1
