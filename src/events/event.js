class Event {
    commandId; 
    userId;
    broadcast;
    type;
    
    constructor(userId, commandId, type, shouldBroadcast = false) {
        this.userId = userId;
        this.commandId = commandId;
        this.type = type;
        this.broadcast = shouldBroadcast;
    }
}

export {Event};