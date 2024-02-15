interface IEvent {
    readonly userId: string;
    readonly commandId: string; 
    readonly type: string;
    readonly shouldBroadcast: boolean;
}

export {IEvent};