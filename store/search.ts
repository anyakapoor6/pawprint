import { create } from 'zustand';
import { PetReport } from '../types/pet';

interface SearchState {
	searchQuery: string;
	searchResults: PetReport[];
	setSearchQuery: (query: string) => void;
	setSearchResults: (results: PetReport[]) => void;
}

export const useSearch = create<SearchState>((set) => ({
	searchQuery: '',
	searchResults: [],
	setSearchQuery: (query) => set({ searchQuery: query }),
	setSearchResults: (results) => set({ searchResults: results }),
}));
