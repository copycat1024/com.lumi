'use strict'

const Homey = require('homey')

function argsToCapabilityId(args, capabilityId) {
    return `${capabilityId}.${args.switch_number.substr(-1, 1)}`
}

// match args with switch's state for triggers
const matchTrigger = {
    onoff: (args, state) => {
        const args_id = argsToCapabilityId(args, 'onoff')
        const args_value = args.switch_state === 'state_on' ? 1 : 0
        const next = args_id === state.capabilityId && args_value === state.value

        Homey.app.log(`Match ${args_id}==${state.capabilityId}&${args_value}==${state.value} => ${next}`)
        return next
    }
}

// match args with switch's state for condition
const matchCondition = {
    onoff: (args) => {
        const args_value = args.switch_state === 'state_on' ? 1 : 0
        const device_value = args.my_device.value[argsToCapabilityId(args, 'onoff')]
        const next = args_value === device_value

        Homey.app.log(`Match ${args_value}==${device_value} => ${next}`)
        return next
    }
}

const matchAction = {
    onoff: (args) => {
        const capabilityId = argsToCapabilityId(args, 'onoff')
        const value = args.switch_state === 'state_on'
        Homey.app.log(`Action ${capabilityId}->${value}`)

        let device = args.my_device
        try {
            device.setState(capabilityId, 'genOnOff', value)
        } catch (err) {
            Homey.app.log(err)
        }
    }
}

// listener for triggers
function triggerListeners(capabilityId) {
    return (args, state) => {
        const { my_device } = args
        const { capabilityId: _capabilityId } = state
        Homey.app.log(`Catch trigger on ${_capabilityId} of ${my_device.id}.`)
        return Promise.resolve(matchTrigger[capabilityId](args, state))
    }
}

// listener for conditions
function conditionListeners(capabilityId) {
    return (args, _) => {
        const { my_device, switch_number } = args
        Homey.app.log(`Catch condtion on ${switch_number} of ${my_device.id}.`)
        return Promise.resolve(matchCondition[capabilityId](args))
    }
}

function actionListeners(capabilityId) {
    return (args, _) => {
        const { my_device, switch_number } = args
        Homey.app.log(`Catch action on ${switch_number} of ${my_device.id}.`)
        matchAction[capabilityId](args)
        return Promise.resolve(true)
    }

}

module.exports = {
    triggerListeners,
    conditionListeners,
    actionListeners
}