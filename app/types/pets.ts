export interface Pet {
	id: string;
	name: string;
	species: string;
	breed?: string;
	age?: number;
	description?: string;
	images?: string[];
	user_id: string;
	created_at: string;
} 