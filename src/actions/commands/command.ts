interface ICommand {
    commandId: string;  
}

interface ICommandHandler {
    execute(cmd: ICommand): Promise<void>
}

export {ICommand, ICommandHandler};