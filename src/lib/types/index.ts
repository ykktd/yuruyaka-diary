export interface Entry {
	id: string;
	date: string; // ISO 8601: "YYYY-MM-DD"
	mood: number; // 0-100
	sleptWell: boolean;
	busy: boolean;
	wentOut: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Prompt {
	id: string;
	type: 'daily_question' | 'free_note';
	text: string;
	isActive: boolean;
	createdAt: string;
}

export interface DiaryResponse {
	id: string;
	entryId: string;
	promptId: string;
	content: string;
	createdAt: string;
}

export interface EntryWithResponses {
	entry: Entry;
	responses: DiaryResponse[];
}
