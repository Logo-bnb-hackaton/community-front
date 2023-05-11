export interface TgIntegrationDTO {
    status: string,
    error: {
        code: string,
        message: string,
    } | undefined
}

export interface TgChatDTO {
    status: ChatBindingStatus,
    chat: {
        title: string,
        link: string,
    } | undefined
}

export enum ChatBindingStatus {
    BINDED,
    NOT_BINDED
}