import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizResponses } from '../types';

type QuizState = {
  currentIndex: number;
  responses: QuizResponses;
  setAnswer: (qid: keyof QuizResponses, value: number) => void;
  setCurrentIndex: (idx: number) => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      currentIndex: 0,
      responses: {},
      setAnswer: (qid, value) =>
        set((s) => ({
          responses: { ...s.responses, [qid]: value },
        })),
      setCurrentIndex: (idx) => set({ currentIndex: idx }),
      resetQuiz: () => set({ currentIndex: 0, responses: {} }),
    }),
    {
      name: 'carbon27_quiz',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

