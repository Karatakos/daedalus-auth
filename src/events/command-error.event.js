import {Event} from './event.js';

class CommandErrorEvent extends Event {
    entityId;
    timestamp;
    error;

    constructor(entityId, userId, timestamp, errorMessage, commandId) {
        super(userId, commandId, "CommandError", false);

        this.entityId = entityId;
        this.timestamp = timestamp;
        this.error = errorMessage;
    }
}

export {CommandErrorEvent};