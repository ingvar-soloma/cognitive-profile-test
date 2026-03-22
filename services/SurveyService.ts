import { SurveyDefinition } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

const surveyCache: Record<string, Promise<SurveyDefinition | undefined>> = {};

export const SurveyService = {
  // Get list of all available surveys
  getAvailableSurveys: async (): Promise<SurveyDefinition[]> => {
    try {
      const response = await fetch(`${API_URL}/api/tests`);
      if (!response.ok) throw new Error('Failed to fetch surveys');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SurveyService.getAvailableSurveys error:', error);
      return [];
    }
  },

  // Get full details of a specific survey by its ID
  getSurveyById: async (surveyId: string): Promise<SurveyDefinition | undefined> => {
    if (surveyCache[surveyId]) return surveyCache[surveyId];

    surveyCache[surveyId] = (async () => {
        try {
          const response = await fetch(`${API_URL}/api/tests/${surveyId}`);
          if (!response.ok) {
             if (response.status === 404) {
                console.warn(`Survey ${surveyId} not found, fetching list to fallback...`);
                // Clear from cache to allow retry if needed (though fallback usually means permanent issue)
                const all = await SurveyService.getAvailableSurveys();
                return all[0];
             }
             throw new Error('Failed to fetch survey details');
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('SurveyService.getSurveyById error:', error);
          delete surveyCache[surveyId]; // Allow retry on error
          return undefined;
        }
    })();

    return surveyCache[surveyId];
  },
};
