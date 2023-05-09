interface TgIntegrationDTO {
    status: string,
    error: {
        code: string,
        message: string,
    } | undefined
}