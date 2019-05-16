'use strict';

const Homey = require('homey');

class MyApp extends Homey.App {

	async onInit() {
		this.log('MyApp is running...')

		// listeners
		const triggerListener = function (args, state) {
			this.log('Trigger on ', args.my_device.id, ':', state.switchNumber, '. State:', state.value)
			return Promise.resolve(this.matchSwitch(args, state))
		}

		const conditionListener = function (args, state) {
			state.switchNumber = this._getSwitchNumber(args)
			state.value = args.my_device.value[state.switchNumber]
			this.log('Condition on switch:', state.switchNumber, '. State:', state.value)
			return Promise.resolve(this.matchSwitch(args, state))
		}

		const actionListener = function (args) {
			let switch_number = this._getSwitchNumber(args)
			let switch_state = args.switch_state === 'state_on'
			this.log('Action on switch:', switch_number, '. State:', switch_state)

			let device = args.my_device
			device.setState(switch_number, switch_state)

			return Promise.resolve(true)
		}

		// register triggers
		this.lumiTrigger4 = new Homey.FlowCardTriggerDevice('trigger_sz4').register()
		this.lumiTrigger4.registerRunListener(triggerListener)

		this.lumiTrigger2 = new Homey.FlowCardTriggerDevice('trigger_sz2').register()
		this.lumiTrigger2.registerRunListener(triggerListener)

		this.lumiTrigger1 = new Homey.FlowCardTriggerDevice('trigger_sz1').register()
		this.lumiTrigger1.registerRunListener(triggerListener)

		// register conditions
		this.lumiCondition4 = new Homey.FlowCardCondition('condition_sz4').register()
		this.lumiCondition4.registerRunListener(conditionListener)

		this.lumiCondition2 = new Homey.FlowCardCondition('condition_sz2').register()
		this.lumiCondition2.registerRunListener(conditionListener)

		this.lumiCondition1 = new Homey.FlowCardCondition('condition_sz1').register()
		this.lumiCondition1.registerRunListener(conditionListener)

		// register actions
		this.lumiAction4 = new Homey.FlowCardAction('action_sz4').register()
		this.lumiAction4.registerRunListener(actionListener)

		this.lumiAction2 = new Homey.FlowCardAction('action_sz2').register()
		this.lumiAction2.registerRunListener(actionListener)

		this.lumiAction1 = new Homey.FlowCardAction('action_sz1').register()
		this.lumiAction1.registerRunListener(actionListener)
	}

	// match args with switch's state
	matchSwitch(args, state) {
		let switch_number = this._getSwitchNumber(args)
		let switch_state = args.switch_state === 'state_on'

		let con1 = state.switchNumber === switch_number
		let con2 = state.value === switch_state
		let next = con1 && con2

		this.log('Match: ', switch_number, state.switchNumber, switch_state, state.value,
			'. Result', next)

		return next
	}

	// get switch number
	_getSwitchNumber(args) {
		return parseInt(args.switch_number.substr(-1, 1))
	}

	// shared function to trigger Lumi
	triggerLumi4(device, token, state) {
		this.lumiTrigger4.trigger(device, token, state).catch(this.error)
	}

	triggerLumi2(device, token, state) {
		this.lumiTrigger2.trigger(device, token, state).catch(this.error)
	}

	triggerLumi1(device, token, state) {
		this.lumiTrigger1.trigger(device, token, state).catch(this.error)
	}

}

module.exports = MyApp;