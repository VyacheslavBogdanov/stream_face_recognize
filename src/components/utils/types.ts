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
	bbox: number[];
	dist: number;
	real: boolean;
}

export interface FaceDB {
	id: string;
	name: string;
	photoUrl: string;
}
