import { useState, useCallback } from 'react';
import ApiService from '../services/api';
import { ERROR_MESSAGES } from '../utils/helpers';

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      setLoading(false);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, request, clearError };
};

// Hook for managing novels
export const useNovels = () => {
  const [novels, setNovels] = useState([]);
  const { loading, error, request, clearError } = useApi();

  const loadNovels = useCallback(async (userID) => {
    const data = await request(ApiService.getUserNovels.bind(ApiService), userID);
    setNovels(data || []);
    return data;
  }, [request]);

  const createNovel = useCallback(async (userID, novelData) => {
    console.log('ApiService.createNovel:', ApiService.createNovel);
    const newNovel = await request(ApiService.createNovel.bind(ApiService), userID, novelData);
    setNovels(prev => [...prev, newNovel]);
    return newNovel;
  }, [request]);

  const updateNovel = useCallback(async (novelID, updates) => {
    const updatedNovel = await request(ApiService.updateNovel.bind(ApiService), novelID, updates);
    setNovels(prev => prev.map(novel => 
      novel.NovelID === novelID ? { ...novel, ...updates } : novel
    ));
    return updatedNovel;
  }, [request]);

  const deleteNovel = useCallback(async (novelID) => {
    await request(ApiService.deleteNovel.bind(ApiService), novelID);
    setNovels(prev => prev.filter(novel => novel.NovelID !== novelID));
  }, [request]);

  return {
    novels,
    loading,
    error,
    loadNovels,
    createNovel,
    updateNovel,
    deleteNovel,
    clearError
  };
};

// Hook for managing chapters
export const useChapters = () => {
  const [chapters, setChapters] = useState([]);
  const { loading, error, request, clearError } = useApi();

  const loadChapters = useCallback(async (novelID) => {
    const data = await request(ApiService.getNovelChapters.bind(ApiService), novelID);
    setChapters(data || []);
    return data;
  }, [request]);

  const createChapter = useCallback(async (novelID, chapterData) => {
    const newChapter = await request(ApiService.createChapter.bind(ApiService), novelID, chapterData);
    setChapters(prev => [...prev, newChapter]);
    return newChapter;
  }, [request]);

  const updateChapter = useCallback(async (chapterID, updates) => {
    const updatedChapter = await request(ApiService.updateChapter.bind(ApiService), chapterID, updates);
    setChapters(prev => prev.map(chapter => 
      chapter.ChapterID === chapterID ? { ...chapter, ...updates } : chapter
    ));
    return updatedChapter;
  }, [request]);

  const deleteChapter = useCallback(async (chapterID) => {
    await request(ApiService.deleteChapter.bind(ApiService), chapterID);
    setChapters(prev => prev.filter(chapter => chapter.ChapterID !== chapterID));
  }, [request]);

  const getChapterById = useCallback((chapterID) => {
    return chapters.find(chapter => chapter.ChapterID === chapterID);
  }, [chapters]);

  return {
    chapters,
    loading,
    error,
    loadChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    getChapterById,
    clearError
  };
};

// Hook for managing characters
export const useCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const { loading, error, request, clearError } = useApi();

  const loadCharacters = useCallback(async (novelID) => {
    const data = await request(ApiService.getNovelCharacters.bind(ApiService), novelID);
    setCharacters(data || []);
    return data;
  }, [request]);

  const createCharacter = useCallback(async (novelID, characterData) => {
    const newCharacter = await request(ApiService.createCharacter.bind(ApiService), novelID, characterData);
    setCharacters(prev => [...prev, newCharacter]);
    return newCharacter;
  }, [request]);

  const updateCharacter = useCallback(async (characterID, updates) => {
    const updatedCharacter = await request(ApiService.updateCharacter.bind(ApiService), characterID, updates);
    setCharacters(prev => prev.map(character => 
      character.CharacterID === characterID ? { ...character, ...updates } : character
    ));
    return updatedCharacter;
  }, [request]);

  const deleteCharacter = useCallback(async (characterID) => {
    await request(ApiService.deleteCharacter.bind(ApiService), characterID);
    setCharacters(prev => prev.filter(character => character.CharacterID !== characterID));
  }, [request]);

  return {
    characters,
    loading,
    error,
    loadCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    clearError
  };
};

// Hook for managing notes
export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const { loading, error, request, clearError } = useApi();

  const loadNotes = useCallback(async (novelID) => {
    const data = await request(ApiService.getNotes.bind(ApiService), novelID);
    setNotes(data || []);
    return data;
  }, [request]);

  const createNote = useCallback(async (novelID, noteData) => {
    const newNote = await request(ApiService.createNote.bind(ApiService), novelID, noteData);
    setNotes(prev => [...prev, newNote]);
    return newNote;
  }, [request]);

  const updateNote = useCallback(async (noteID, updates) => {
    const updatedNote = await request(ApiService.updateNote.bind(ApiService), noteID, updates);
    setNotes(prev => prev.map(note => 
      note.NoteID === noteID ? { ...note, ...updates } : note
    ));
    return updatedNote;
  }, [request]);

  const deleteNote = useCallback(async (noteID) => {
    await request(ApiService.deleteNote.bind(ApiService), noteID);
    setNotes(prev => prev.filter(note => note.NoteID !== noteID));
  }, [request]);

  return {
    notes,
    loading,
    error,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    clearError
  };
};