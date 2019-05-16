'use strict'

const Homey = require('homey');

class LM_SZ4_Driver extends Homey.Driver {

    async onInit() {
    }

    async triggerLumi(device, state) {
        let tokens = {}
        Homey.app.triggerLumi(device, tokens, state)
    }

}

module.exports = LM_SZ4_Driver
