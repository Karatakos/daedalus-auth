import {Event} from '../events/event.js';
import {EventBus} from '../events/event-bus.js';

class Command {
    userAccount;
    commandId;  // It's up to the client to set this (or not)
    
    constructor(userAccount, commandId) {
        this.userAccount = userAccount;
        this.commandId = commandId;
    }
}

class CommandHandler {
    repository = {};
    publisher = {};
    command = {};

    constructor(repository, publisher, command) {
        this.repository = repository;
        this.publisher = publisher;
        this.command = command;
    }

    async execute() {}
}

export {Command, CommandHandler};