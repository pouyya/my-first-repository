export enum SecurityResultReason {
	notEnoughAccess,
	wrongPIN,
	accessGrant
}

export class SecurityResult {
	public isValid: boolean;
	public reason: SecurityResultReason;

	constructor(isValid: boolean, reason: SecurityResultReason) {
		this.isValid = isValid;
		this.reason = reason;
	}
}