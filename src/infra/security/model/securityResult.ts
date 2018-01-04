enum SecurityResultReason {
    noEnoughAccess,
    wrongPIN,
    accessGrant
}

export class SecurityResult {
    public isValid: boolean;
    public reason: SecurityResultReason;
}