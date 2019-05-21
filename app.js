'use strict'

const Homey = require('homey')
const { Coordinator } = require('homey-agressive-zigbee')
const { triggerListeners, conditionListeners, actionListeners } = require('./flow')

class LumiApp extends Homey.App {

	onInit() {
		this.log('Lumi app is running...')

		this.coordinator = new Coordinator()
		this.listeners = {}
		this.cards = {}

		this.registerTrigger('trigger_sz2', 'onoff')
		this.registerTrigger('trigger_sz4', 'onoff')

		this.registerCondition('condition_sz2', 'onoff')
		this.registerCondition('condition_sz4', 'onoff')

		this.registerAction('action_sz2', 'onoff')
		this.registerAction('action_sz4', 'onoff')
	}

	// register triggers
	registerTrigger(name, capabilityId) {
		// prepare trigger tables
		this.cards.trigger = this.cards.trigger || {}
		this.listeners.trigger = this.listeners.trigger || {}

		// load listeners if not already loaded
		if (!this.listeners.trigger[capabilityId])
			this.listeners.trigger[capabilityId] = triggerListeners(capabilityId)

		const card = new Homey.FlowCardTriggerDevice(name).register()
		card.registerRunListener(this.listeners.trigger[capabilityId])
		this.cards.trigger[name] = card
	}

	// register conditions
	registerCondition(name, capabilityId) {
		// prepare condition tables
		this.cards.condition = this.cards.condition || {}
		this.listeners.condition = this.listeners.condition || {}

		// load listeners if not already loaded
		if (!this.listeners.condition[capabilityId])
			this.listeners.condition[capabilityId] = conditionListeners(capabilityId)

		const card = new Homey.FlowCardCondition(name).register()
		card.registerRunListener(this.listeners.condition[capabilityId])
		this.cards.condition[name] = card
	}

	// register actions
	registerAction(name, capabilityId) {
		// prepare action tables
		this.cards.action = this.cards.action || {}
		this.listeners.action = this.listeners.action || {}

		// load listeners if not already loaded
		if (!this.listeners.action[capabilityId])
			this.listeners.action[capabilityId] = actionListeners(capabilityId)

		const card = new Homey.FlowCardAction(name).register()
		card.registerRunListener(this.listeners.action[capabilityId])
		this.cards.action[name] = card
	}

	// start a trigger
	trigger(name, device, token, state) {
		this.cards.trigger[name].trigger(device, token, state).catch(this.error)
	}
}

module.exports = LumiApp