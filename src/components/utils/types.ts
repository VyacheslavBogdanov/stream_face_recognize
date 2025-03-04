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


  export interface ComparisonResponse {
	request_id: string;
	detected_faces?: Face[];
	message?: string;
  }

  export interface ComparisonResult {
	message: string;
	detected_faces?: Face[];
  }

