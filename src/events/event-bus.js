class EventBus {
    constructor() {}

    log = [];
    callbacks = [];

    subscribe(callback) {
        this.callbacks.push(callback);
    }

    publish(event) {
        this.log.push(event)
        
        this.callbacks.forEach((callback) => {
            callback(event);
        });
    }
}

export {EventBus};