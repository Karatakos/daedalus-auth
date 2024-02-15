import { IEvent } from './event.js';

type EventCallback = (event: IEvent) => void;

class EventBus {
    constructor() {}

    log: IEvent[] = [];
    callbacks: EventCallback[] = [];

    subscribe(callback: EventCallback) {
        this.callbacks.push(callback);
    }

    publish(event: IEvent) {
        this.log.push(event)
        
        this.callbacks.forEach((callback) => {
            callback(event);
        });
    }
}

export {EventBus};