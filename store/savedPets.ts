import { create } from 'zustand';
import { PetReport } from '@/types/pet';

interface SavedPetsState {
  savedPets: Set<string>;
  savedPetsData: PetReport[];
  toggleSavedPet: (petId: string, petData: PetReport) => void;
  isPetSaved: (petId: string) => boolean;
  getSavedPets: () => PetReport[];
}

export const useSavedPets = create<SavedPetsState>((set, get) => ({
  savedPets: new Set<string>(),
  savedPetsData: [],

  toggleSavedPet: (petId: string, petData: PetReport) => {
    set((state) => {
      const newSavedPets = new Set(state.savedPets);
      const newSavedPetsData = [...state.savedPetsData];

      if (newSavedPets.has(petId)) {
        newSavedPets.delete(petId);
        const index = newSavedPetsData.findIndex((pet) => pet.id === petId);
        if (index !== -1) {
          newSavedPetsData.splice(index, 1);
        }
      } else {
        newSavedPets.add(petId);
        newSavedPetsData.push(petData);
      }

      return {
        savedPets: newSavedPets,
        savedPetsData: newSavedPetsData
      };
    });
  },

  isPetSaved: (petId: string) => {
    return get().savedPets.has(petId);
  },

  getSavedPets: () => {
    return get().savedPetsData;
  },
}));