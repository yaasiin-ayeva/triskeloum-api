export interface UserStatus {
    userId: number;
    status: string;
}

export interface TypingStatus {
    userId: number;
    roomId: number;
    isTyping: boolean;
}

export interface MessageEvent {
    messageId: number;
    roomId: number;
}

export interface MessageReceivedEvent {
    message: any;
    roomId: number;
}

export interface MessageDeliveredEvent {
    messageId: number;
    deliveredAt: Date;
}

export interface MessageSeenEvent {
    messageId: number;
    seenAt: Date;
    userId: number;
}

export interface MessageEditedEvent {
    messageId: number;
    content: string;
    editedAt: Date;
}

export interface MessageDeletedEvent {
    messageId: number;
    roomId: number;
}

export interface CallSignalData {
    roomId: number;
    signal: any;
    to: number;
}

export interface CallSignalEvent {
    from: number;
    signal: any;
    roomId: number;
}

export interface CallIncomingEvent {
    call: any;
    roomId: number;
    caller: any;
}

export interface CallEndedEvent {
    callId: number;
    roomId: number;
    durationMin: number;
}

export interface RoomUserEvent {
    userId: number;
    roomId: number;
}