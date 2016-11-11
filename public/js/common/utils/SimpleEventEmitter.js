/**
 * Simple event emitter, which doesn't handle running context or concurrency.
 */
class SimpleEventEmitter {
	constructor() {
		this.handlers = [];
	}

	addHandler(handler) {
		this.handlers.push(handler);
	}

	trigger() {
		this.handlers.forEach(handler => handler.apply(null, arguments));
	}
}

module.exports = SimpleEventEmitter;
