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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  }, [novelId, loadChapters, loadCharacters, loadNotes]);

  // Set first chapter as active or check for activeChapterId
  useEffect(() => {
    if (chapters.length > 0 && !activeChapter) {
      // Check if there's a specific chapter to open (from daily prompt)
      const targetChapter = novel?.activeChapterId 
        ? chapters.find(c => c.ChapterID === novel.activeChapterId)
        : chapters[0];
      
      const chapterToOpen = targetChapter || chapters[0];
      setActiveChapter(chapterToOpen.ChapterID);
      setEditorContent(chapterToOpen.Content || '');
    }
  }, [chapters, activeChapter, novel?.activeChapterId]);

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

  const handleManualSave = async () => {
    if (!activeChapter || isSaving) return;

    setIsSaving(true);
    try {
      await updateChapter(activeChapter, { content: editorContent });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
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
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <p className="text-muted">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Minimalist Header */}
      <header className="bg-white border-bottom">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3 px-4">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-sm btn-outline-secondary rounded-pill px-3" 
                onClick={onBack}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </button>
              <div className="vr d-none d-md-block"></div>
              <div>
                <h6 className="mb-0 fw-semibold">{novel?.Title}</h6>
                <small className="text-muted">{novel?.Genre}</small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-md-flex align-items-center gap-3 text-muted small">
                <span className={isSaving ? 'text-primary' : ''}>
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : lastSaved ? (
                    <>
                      <i className="bi bi-check-circle me-1"></i>
                      Saved {lastSaved.toLocaleTimeString()}
                    </>
                  ) : (
                    'No changes'
                  )}
                </span>
                <span className="text-muted">|</span>
                <span><strong>{wordCount}</strong> words</span>
                <span><strong>{charCount}</strong> chars</span>
              </div>
              
              <button 
                className="btn btn-sm btn-primary rounded-pill px-3"
                onClick={() => handleManualSave()}
                disabled={!activeChapter || isSaving}
              >
                <i className="bi bi-floppy me-2"></i>
                Save
              </button>
              
              <button 
                className="btn btn-sm btn-outline-secondary d-md-none"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <i className="bi bi-layout-sidebar"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow-1 d-flex overflow-hidden">
        {/* Minimalist Sidebar */}
        <aside 
          className={`border-end bg-white ${sidebarCollapsed ? 'd-none d-md-block' : ''}`}
          style={{ width: '320px', transition: 'all 0.3s' }}
        >
          {/* Simplified Tabs */}
          <div className="border-bottom">
            <div className="d-flex">
              <button
                className={`flex-fill btn btn-link text-decoration-none py-3 border-0 rounded-0 ${
                  activeTab === 'chapters' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'
                }`}
                onClick={() => setActiveTab('chapters')}
              >
                <i className="bi bi-journal-text me-2"></i>
                Chapters
              </button>
              <button
                className={`flex-fill btn btn-link text-decoration-none py-3 border-0 rounded-0 ${
                  activeTab === 'characters' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'
                }`}
                onClick={() => setActiveTab('characters')}
              >
                <i className="bi bi-people me-2"></i>
                Characters
              </button>
              <button
                className={`flex-fill btn btn-link text-decoration-none py-3 border-0 rounded-0 ${
                  activeTab === 'notes' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'
                }`}
                onClick={() => setActiveTab('notes')}
              >
                <i className="bi bi-sticky me-2"></i>
                Notes
              </button>
            </div>
          </div>

          <div className="p-3 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
            {/* Chapters */}
            {activeTab === 'chapters' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 text-muted small text-uppercase">Chapters ({chapters.length})</h6>
                  <button 
                    className="btn btn-sm btn-primary rounded-pill px-3" 
                    onClick={() => setShowChapterModal(true)}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    New
                  </button>
                </div>
                {chapters.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-journal-text fs-1 mb-2 d-block"></i>
                    <p className="small mb-0">No chapters yet</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {chapters.map((chapter) => (
                      <div
                        key={chapter.ChapterID}
                        onClick={() => switchChapter(chapter.ChapterID)}
                        className={`p-3 rounded cursor-pointer transition ${
                          activeChapter === chapter.ChapterID 
                            ? 'bg-primary bg-opacity-10 border border-primary' 
                            : 'bg-light hover-shadow'
                        }`}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="fw-semibold small flex-grow-1">{chapter.Title}</div>
                          {activeChapter === chapter.ChapterID && (
                            <i className="bi bi-chevron-right text-primary"></i>
                          )}
                        </div>
                        <div className="text-muted small">
                          <i className="bi bi-file-text me-1"></i>
                          {getWordCount(chapter.Content || '')} words
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Characters */}
            {activeTab === 'characters' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 text-muted small text-uppercase">Characters ({characters.length})</h6>
                  <button 
                    className="btn btn-sm btn-primary rounded-pill px-3" 
                    onClick={() => setShowCharacterModal(true)}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    New
                  </button>
                </div>
                {characters.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 mb-2 d-block"></i>
                    <p className="small mb-0">No characters yet</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {characters.map((character) => (
                      <div key={character.CharacterID} className="card border-0 shadow-sm">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-start gap-2">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                              <i className="bi bi-person text-primary"></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold">{character.Name}</div>
                              <div className="badge bg-primary bg-opacity-10 text-primary small">{character.Role}</div>
                              {character.Description && (
                                <p className="text-muted small mb-0 mt-2">{character.Description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 text-muted small text-uppercase">Notes ({notes.length})</h6>
                  <button 
                    className="btn btn-sm btn-primary rounded-pill px-3" 
                    onClick={() => setShowNoteModal(true)}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    New
                  </button>
                </div>
                {notes.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-sticky fs-1 mb-2 d-block"></i>
                    <p className="small mb-0">No notes yet</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {notes.map((note) => (
                      <div key={note.NoteID} className="card border-0 shadow-sm">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-sticky text-warning fs-5"></i>
                            <div className="flex-grow-1">
                              <div className="fw-semibold small">{note.Title}</div>
                              {note.Content && (
                                <p className="text-muted small mb-0 mt-1">{note.Content.substring(0, 80)}...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Minimalist Editor */}
        <main className="flex-grow-1 d-flex flex-column bg-white">
          {activeChapter ? (
            <>
              <div className="border-bottom px-4 py-3 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-semibold">{currentChapter?.Title}</h5>
                  <div className="d-md-none text-muted small">
                    <span><strong>{wordCount}</strong> words</span>
                  </div>
                </div>
              </div>
              <div className="flex-grow-1 p-4" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <textarea
                  className="form-control h-100 border-0 shadow-none"
                  value={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Start writing your story here..."
                  style={{ 
                    resize: 'none', 
                    fontSize: '1.1rem', 
                    lineHeight: '1.8',
                    outline: 'none'
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-grow-1 d-flex justify-content-center align-items-center">
              <div className="text-center text-muted">
                <i className="bi bi-pencil-square" style={{ fontSize: '4rem' }}></i>
                <h5 className="mt-3 mb-2">Select a Chapter</h5>
                <p className="text-muted">Choose a chapter from the sidebar to start writing</p>
                <button 
                  className="btn btn-primary rounded-pill px-4 mt-2"
                  onClick={() => setShowChapterModal(true)}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Create Your First Chapter
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals with backdrop */}
      {/* Chapter Modal */}
      {showChapterModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Create New Chapter</h5>
                  <button className="btn-close" onClick={() => setShowChapterModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Chapter Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter chapter title"
                      value={chapterForm.title} 
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Initial Content (Optional)</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      placeholder="Add some initial content or leave blank"
                      value={chapterForm.content} 
                      onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button className="btn btn-secondary" onClick={() => setShowChapterModal(false)}>Cancel</button>
                  <button className="btn btn-primary" disabled={!chapterForm.title.trim()} onClick={handleCreateChapter}>
                    Create Chapter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Character Modal */}
      {showCharacterModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Create New Character</h5>
                  <button className="btn-close" onClick={() => setShowCharacterModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Character Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter character name"
                      value={characterForm.name} 
                      onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Role</label>
                    <select 
                      className="form-select" 
                      value={characterForm.role} 
                      onChange={(e) => setCharacterForm({ ...characterForm, role: e.target.value })}
                    >
                      <option value="">Select role</option>
                      {CHARACTER_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      placeholder="Describe this character"
                      value={characterForm.description} 
                      onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button className="btn btn-secondary" onClick={() => setShowCharacterModal(false)}>Cancel</button>
                  <button className="btn btn-primary" disabled={!characterForm.name.trim()} onClick={handleCreateCharacter}>
                    Create Character
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Create New Note</h5>
                  <button className="btn-close" onClick={() => setShowNoteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Note Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter note title"
                      value={noteForm.title} 
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Content</label>
                    <textarea 
                      className="form-control" 
                      rows="6" 
                      placeholder="Write your note"
                      value={noteForm.content} 
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
                  <button className="btn btn-primary" disabled={!noteForm.title.trim()} onClick={handleCreateNote}>
                    Create Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default EditorPage;