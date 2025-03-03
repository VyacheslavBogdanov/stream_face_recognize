export interface MessageType {
	class: string;
	message: string;
}
export interface MockAPIResponse {
	error?: string;
	status?: number;
	data?: MessageType[];
}

export interface Face {
	id: string;
	name: string;
	photoUrl: string;
}
