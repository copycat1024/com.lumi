'use strict'

const Homey = require('homey')
const { ZigBeeDevice } = require('homey-agressive-zigbee')

class LM_SZ4 extends ZigBeeDevice {

	onMeshInit() {
		this.log('LM_SZ4 has been inited')

		let switch_list = [0, 2, 4, 6]
		switch_list.forEach((endpoint, index) =>
			this.registerCapability(`onoff.${index + 1}`, 'genOnOff', {
				getOpts: { pollInterval: 500 },
				endpoint
			})
		)
	}

	onTrigger(capabilityId, value) {
		Homey.app.trigger('trigger_sz4', this, {}, { capabilityId, value })
	}
}

module.exports = LM_SZ4
