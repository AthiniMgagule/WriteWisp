const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  static getAuthToken() {
    const user = localStorage.getItem('writewisp_user');
    return user ? JSON.parse(user).token : null;
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  static async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints
  static async getUsers() {
    return this.request('/users');
  }

  static async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  static async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Novel endpoints
  static async createNovel(userID, novelData) {
    return this.request(`/novels/${userID}`, {
      method: 'POST',
      body: JSON.stringify(novelData),
    });
  }

  static async getUserNovels(userID) {
    return this.request(`/novels/user/${userID}`);
  }

  static async getNovelById(novelID) {
    return this.request(`/novels/${novelID}`);
  }

  static async updateNovel(novelID, updates) {
    return this.request(`/novels/${novelID}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteNovel(novelID) {
    return this.request(`/novels/${novelID}`, {
      method: 'DELETE',
    });
  }

  // Chapter endpoints
  static async createChapter(novelID, chapterData) {
    return this.request(`/chapters/${novelID}`, {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
  }

  static async getNovelChapters(novelID) {
    return this.request(`/chapters/${novelID}`);
  }

  static async getChapterById(chapterID) {
    return this.request(`/chapters/chapter/${chapterID}`);
  }

  static async updateChapter(chapterID, updates) {
    return this.request(`/chapters/${chapterID}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteChapter(chapterID) {
    return this.request(`/chapters/${chapterID}`, {
      method: 'DELETE',
    });
  }

  // Character endpoints
  static async createCharacter(novelID, characterData) {
    return this.request(`/characters/${novelID}`, {
      method: 'POST',
      body: JSON.stringify(characterData),
    });
  }

  static async getNovelCharacters(novelID) {
    return this.request(`/characters/${novelID}`);
  }

  static async getCharacterById(characterID) {
    return this.request(`/characters/character/${characterID}`);
  }

  static async updateCharacter(characterID, updates) {
    return this.request(`/characters/${characterID}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteCharacter(characterID) {
    return this.request(`/characters/${characterID}`, {
      method: 'DELETE',
    });
  }

  // Note endpoints
  static async createNote(novelID, noteData) {
    return this.request(`/notes/${novelID}`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  static async getNotes(novelID) {
    return this.request(`/notes/${novelID}`);
  }

  static async getNoteById(noteID) {
    return this.request(`/notes/note/${noteID}`);
  }

  static async updateNote(noteID, updates) {
    return this.request(`/notes/${noteID}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteNote(noteID) {
    return this.request(`/notes/${noteID}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;