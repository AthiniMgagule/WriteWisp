import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { useChapters, useCharacters, useNotes } from '../hooks/useApi';
import { getWordCount, getCharacterCount, CHARACTER_ROLES, debounce } from '../utils/helpers';

const EditorPage = ({ novel, onBack }) => {
  const { user } = useAuth();
  const {
    chapters,
    loading: chaptersLoading,
    loadChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    getChapterById
  } = useChapters();

  const {
    characters,
    loading: charactersLoading,
    loadCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter
  } = useCharacters();

  const {
    notes,
    loadNotes,
    createNote,
    updateNote,
    deleteNote
  } = useNotes();

  // unused variables marked
  void user;
  void deleteChapter;
  void charactersLoading;
  void updateCharacter;
  void deleteCharacter;
  void updateNote;
  void deleteNote;

  // Editor state
  const [activeChapter, setActiveChapter] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('chapters');

  // Modal states
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Form states
  const [chapterForm, setChapterForm] = useState({ title: '', content: '' });
  const [characterForm, setCharacterForm] = useState({ name: '', role: '', description: '' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  const novelId = novel?.NovelID || novel?.id;

  // Load data on mount
  useEffect(() => {
    if (novelId) {
      loadChapters(novelId);
      loadCharacters(novelId);
      loadNotes(novelId);
    }
  }, [novelId]);

  // Set first chapter as active
  useEffect(() => {
    if (chapters.length > 0 && !activeChapter) {
      const firstChapter = chapters[0];
      setActiveChapter(firstChapter.ChapterID);
      setEditorContent(firstChapter.Content || '');
    }
  }, [chapters, activeChapter]);

  // Auto-save
  const debouncedSave = useCallback(
    debounce(async (chapterId, content) => {
      if (!chapterId) return;

      setIsSaving(true);
      try {
        await updateChapter(chapterId, { content });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [updateChapter]
  );

  const handleEditorChange = (e) => {
    const content = e.target.value;
    setEditorContent(content);
    if (activeChapter) {
      debouncedSave(activeChapter, content);
    }
  };

  const switchChapter = (chapterId) => {
    const chapter = getChapterById(chapterId);
    if (chapter) {
      setActiveChapter(chapterId);
      setEditorContent(chapter.Content || '');
    }
  };

  const handleCreateChapter = async () => {
    if (!chapterForm.title.trim()) return;

    try {
      const newChapter = await createChapter(novelId, {
        title: chapterForm.title.trim(),
        content: chapterForm.content || 'Start writing your chapter here...'
      });
      setShowChapterModal(false);
      setChapterForm({ title: '', content: '' });
      setActiveChapter(newChapter.ChapterID);
      setEditorContent(newChapter.Content || '');
    } catch (error) {
      console.error('Failed to create chapter:', error);
    }
  };

  const handleCreateCharacter = async () => {
    if (!characterForm.name.trim()) return;

    try {
      await createCharacter(novelId, {
        name: characterForm.name.trim(),
        role: characterForm.role || 'Character',
        description: characterForm.description.trim()
      });
      setShowCharacterModal(false);
      setCharacterForm({ name: '', role: '', description: '' });
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const handleCreateNote = async () => {
    if (!noteForm.title.trim()) return;

    try {
      await createNote(novelId, {
        title: noteForm.title.trim(),
        content: noteForm.content.trim()
      });
      setShowNoteModal(false);
      setNoteForm({ title: '', content: '' });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const currentChapter = getChapterById(activeChapter);
  const wordCount = getWordCount(editorContent);
  const charCount = getCharacterCount(editorContent);

  if (chaptersLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Header */}
      <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
          </button>
          <div>
            <h5 className="mb-0">{novel?.Title}</h5>
            <small className="text-muted">{novel?.Genre}</small>
          </div>
        </div>
        <div className="d-flex gap-4 small text-muted">
          <div>{isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'No changes'}</div>
          <div>{wordCount} words, {charCount} characters</div>
        </div>
      </header>

      <div className="flex-grow-1 d-flex overflow-hidden">
        {/* Sidebar */}
        <aside className="border-end bg-white" style={{ width: '280px' }}>
          {/* Tabs */}
          <ul className="nav nav-tabs nav-fill">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'chapters' ? 'active' : ''}`} onClick={() => setActiveTab('chapters')}>
                Chapters
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'characters' ? 'active' : ''}`} onClick={() => setActiveTab('characters')}>
                Characters
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                Notes
              </button>
            </li>
          </ul>

          <div className="p-3 overflow-auto" style={{ height: 'calc(100% - 42px)' }}>
            {/* Chapters */}
            {activeTab === 'chapters' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Chapters</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowChapterModal(true)}>
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
                {chapters.length === 0 ? (
                  <p className="text-muted small">No chapters yet</p>
                ) : (
                  chapters.map((chapter) => (
                    <div
                      key={chapter.ChapterID}
                      onClick={() => switchChapter(chapter.ChapterID)}
                      className={`p-2 rounded mb-2 ${activeChapter === chapter.ChapterID ? 'bg-light border' : 'hover-bg-light cursor-pointer'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="fw-semibold small">{chapter.Title}</div>
                      <div className="text-muted small">{getWordCount(chapter.Content || '')} words</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Characters */}
            {activeTab === 'characters' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Characters</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowCharacterModal(true)}>
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
                {characters.length === 0 ? (
                  <p className="text-muted small">No characters yet</p>
                ) : (
                  characters.map((character) => (
                    <div key={character.CharacterID} className="card mb-2">
                      <div className="card-body p-2">
                        <div className="fw-semibold small">{character.Name}</div>
                        <div className="text-primary small">{character.Role}</div>
                        {character.Description && <div className="text-muted small">{character.Description}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Notes</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowNoteModal(true)}>
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
                {notes.length === 0 ? (
                  <p className="text-muted small">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.NoteID} className="card mb-2">
                      <div className="card-body p-2">
                        <div className="fw-semibold small">{note.Title}</div>
                        {note.Content && <div className="text-muted small">{note.Content}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-grow-1 d-flex flex-column">
          {activeChapter ? (
            <>
              <div className="bg-white border-bottom px-4 py-3">
                <h6 className="mb-0">{currentChapter?.Title}</h6>
              </div>
              <div className="flex-grow-1 p-3">
                <textarea
                  className="form-control h-100 border-0"
                  value={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Start writing your story here..."
                  style={{ resize: 'none' }}
                />
              </div>
            </>
          ) : (
            <div className="flex-grow-1 d-flex justify-content-center align-items-center">
              <div className="text-center text-muted">
                <i className="bi bi-pencil fs-1 mb-3"></i>
                <h6>Select a Chapter</h6>
                <p className="small">Choose a chapter from the sidebar to start writing</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Create New Chapter</h5>
                <button className="btn-close" onClick={() => setShowChapterModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Chapter Title</label>
                  <input type="text" className="form-control" value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Initial Content</label>
                  <textarea className="form-control" rows="4" value={chapterForm.content} onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowChapterModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={!chapterForm.title.trim()} onClick={handleCreateChapter}>Create Chapter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character Modal */}
      {showCharacterModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Create New Character</h5>
                <button className="btn-close" onClick={() => setShowCharacterModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Character Name</label>
                  <input type="text" className="form-control" value={characterForm.name} onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={characterForm.role} onChange={(e) => setCharacterForm({ ...characterForm, role: e.target.value })}>
                    <option value="">Select role</option>
                    {CHARACTER_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="4" value={characterForm.description} onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCharacterModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={!characterForm.name.trim()} onClick={handleCreateCharacter}>Create Character</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Create New Note</h5>
                <button className="btn-close" onClick={() => setShowNoteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Note Title</label>
                  <input type="text" className="form-control" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea className="form-control" rows="6" value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={!noteForm.title.trim()} onClick={handleCreateNote}>Create Note</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
