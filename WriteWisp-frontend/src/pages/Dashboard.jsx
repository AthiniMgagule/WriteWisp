import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNovels } from '../hooks/useApi';
import { GENRES, truncateText } from '../utils/helpers';
import DailyPromptModal from '../components/ui/DailyPromptModal';

const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    novels,
    loading,
    error,
    loadNovels,
    createNovel,
    updateNovel,
    deleteNovel,
    clearError
  } = useNovels();

  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const [selectedNovel, setSelectedNovel] = useState(null);
  const [formData, setFormData] = useState({ title: '', genre: '', summary: '' });
  const [formErrors, setFormErrors] = useState({});
  const [creatingNovel, setCreatingNovel] = useState(false);
  const [editingNovel, setEditingNovel] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', genre: '', summary: '' });
  const [editingNovelLoading, setEditingNovelLoading] = useState(false);

  // Load novels and check for daily prompt
  useEffect(() => {
    if (user?.id) {
      loadNovels(user.id);
      
      const lastPromptDate = localStorage.getItem(`lastPrompt_${user.id}`);
      const today = new Date().toDateString();
      
      if (lastPromptDate !== today) {
        setTimeout(() => setShowPromptModal(true), 500);
      }
    }
  }, [user?.id, loadNovels]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNovel = async () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.genre) errors.genre = 'Genre is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCreatingNovel(true);
    try {
      await createNovel(user.id, {
        title: formData.title.trim(),
        genre: formData.genre,
        summary: formData.summary.trim()
      });
      setShowCreateModal(false);
      setFormData({ title: '', genre: '', summary: '' });
    } finally {
      setCreatingNovel(false);
    }
  };

  const handleUpdateNovel = async () => {
    if (!editingNovel) return;
    if (!editFormData.title.trim() || !editFormData.genre) return;

    setEditingNovelLoading(true);
    try {
      await updateNovel(editingNovel.NovelID, {
        title: editFormData.title.trim(),
        genre: editFormData.genre,
        summary: editFormData.summary.trim()
      });
      setShowEditModal(false);
      setEditingNovel(null);
    } finally {
      setEditingNovelLoading(false);
    }
  };

  const handleDeleteNovel = async () => {
    if (!selectedNovel) return;
    try {
      await deleteNovel(selectedNovel.NovelID);
      setShowDeleteModal(false);
      setSelectedNovel(null);
    } catch (err) {
      console.error('Delete novel failed:', err);
    }
  };

  const handlePromptStartWriting = (journal, chapter) => {
    const today = new Date().toDateString();
    localStorage.setItem(`lastPrompt_${user.id}`, today);
    setShowPromptModal(false);
    onNavigate('editor', { ...journal, activeChapterId: chapter.ChapterID });
  };

  const handleClosePromptModal = () => {
    const today = new Date().toDateString();
    localStorage.setItem(`lastPrompt_${user.id}`, today);
    setShowPromptModal(false);
  };

  // Filter novels
  const promptJournal = novels.find(n => n.IsPromptJournal === 1);
  const regularNovels = novels.filter(n => n.IsPromptJournal !== 1);
  
  const filteredNovels = filter === 'prompts' 
    ? (promptJournal ? [promptJournal] : [])
    : filter === 'recent'
    ? regularNovels.slice(0, 3)
    : regularNovels;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Loading your novels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white border-bottom sticky-top">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0 fw-normal">
                Hello, <span className="fw-semibold">{user?.username}</span> ✨
              </h4>
            </div>
            <button 
              className="btn btn-primary btn-sm rounded-pill px-4"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              New Project
            </button>
          </div>
        </div>
      </header>

      <div className="container py-4">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
            <span>{error}</span>
            <button type="button" className="btn-close" onClick={clearError}></button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Projects</p>
                    <h3 className="mb-0">{regularNovels.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-journal-text text-primary fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Prompts</p>
                    <h3 className="mb-0">{promptJournal ? '1' : '0'}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-lightbulb text-warning fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Total Novels</p>
                    <h3 className="mb-0">{novels.length}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-book text-success fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Genres</p>
                    <h3 className="mb-0">{new Set(novels.map(n => n.Genre)).size}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-tags text-info fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and View Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="btn-group btn-group-sm" role="group">
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All Projects
            </button>
            <button
              className={`btn ${filter === 'recent' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('recent')}
            >
              Recent
            </button>
            <button
              className={`btn ${filter === 'prompts' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('prompts')}
            >
              Prompts
            </button>
          </div>

          <div className="btn-group btn-group-sm" role="group">
            <button
              className={`btn ${view === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setView('grid')}
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </button>
            <button
              className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setView('list')}
            >
              <i className="bi bi-list-ul"></i>
            </button>
          </div>
        </div>

        {/* Prompt Journal CTA */}
        {filter !== 'prompts' && promptJournal && (
          <div className="card border-0 bg-primary bg-gradient mb-4 text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">
                    <i className="bi bi-stars me-2"></i>
                    Daily Writing Prompt
                  </h5>
                  <p className="mb-0 opacity-75">Get inspired with AI-generated prompts</p>
                </div>
                <button 
                  className="btn btn-light"
                  onClick={() => setShowPromptModal(true)}
                >
                  Get Prompt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid/List */}
        {filteredNovels.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-journal-text text-muted" style={{ fontSize: '4rem' }}></i>
            </div>
            <h5 className="text-muted mb-3">No projects yet</h5>
            <p className="text-muted mb-4">Start your writing journey by creating your first project</p>
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-primary rounded-pill px-4"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Project
              </button>
              <button 
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={() => setShowPromptModal(true)}
              >
                Try a Writing Prompt
              </button>
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className="row g-3">
            {filteredNovels.map((novel) => (
              <div className="col-md-4 col-sm-6" key={novel.NovelID}>
                <div className="card border-0 shadow-sm h-100 hover-shadow" style={{ transition: 'all 0.2s' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="badge bg-primary">{novel.Genre}</span>
                      <div className="dropdown">
                        <button className="btn btn-sm btn-link text-muted p-0" type="button" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => {
                                setEditingNovel(novel);
                                setEditFormData({
                                  title: novel.Title,
                                  genre: novel.Genre,
                                  summary: novel.Summary || ''
                                });
                                setShowEditModal(true);
                              }}
                            >
                              <i className="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => {
                                setSelectedNovel(novel);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="bi bi-trash me-2"></i>Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <h5 className="card-title mb-2">{novel.Title}</h5>
                    <p className="card-text text-muted small mb-3" style={{ minHeight: '40px' }}>
                      {novel.Summary ? truncateText(novel.Summary, 80) : 'No description'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {novel.UpdatedAt ? new Date(novel.UpdatedAt).toLocaleDateString() : 'Just now'}
                      </small>
                      <button 
                        className="btn btn-sm btn-primary rounded-pill px-3"
                        onClick={() => onNavigate('editor', novel)}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="list-group list-group-flush">
              {filteredNovels.map((novel, index) => (
                <div 
                  key={novel.NovelID} 
                  className={`list-group-item ${index !== filteredNovels.length - 1 ? 'border-bottom' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mb-0">{novel.Title}</h6>
                        <span className="badge bg-primary small">{novel.Genre}</span>
                        {novel.IsPromptJournal === 1 && (
                          <i className="bi bi-lightbulb-fill text-warning"></i>
                        )}
                      </div>
                      <p className="text-muted small mb-1">
                        {novel.Summary ? truncateText(novel.Summary, 120) : 'No description'}
                      </p>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        Updated {novel.UpdatedAt ? new Date(novel.UpdatedAt).toLocaleDateString() : 'just now'}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-primary rounded-pill px-3"
                        onClick={() => onNavigate('editor', novel)}
                      >
                        Open
                      </button>
                      <div className="dropdown">
                        <button className="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => {
                                setEditingNovel(novel);
                                setEditFormData({
                                  title: novel.Title,
                                  genre: novel.Genre,
                                  summary: novel.Summary || ''
                                });
                                setShowEditModal(true);
                              }}
                            >
                              <i className="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => {
                                setSelectedNovel(novel);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="bi bi-trash me-2"></i>Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Prompt Modal */}
      <DailyPromptModal
        show={showPromptModal}
        onClose={handleClosePromptModal}
        onStartWriting={handlePromptStartWriting}
        user={user}
      />

      {/* Create Novel Modal */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Create New Project</h5>
                  <button 
                    className="btn-close" 
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      placeholder="Enter your project title"
                      value={formData.title}
                      onChange={handleFormChange}
                    />
                    {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Genre *</label>
                    <select
                      name="genre"
                      className={`form-select ${formErrors.genre ? 'is-invalid' : ''}`}
                      value={formData.genre}
                      onChange={handleFormChange}
                    >
                      <option value="">Select a genre</option>
                      {GENRES.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    {formErrors.genre && <div className="invalid-feedback">{formErrors.genre}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      name="summary"
                      className="form-control"
                      rows="3"
                      placeholder="Brief description of your project"
                      value={formData.summary}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={creatingNovel}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleCreateNovel}
                    disabled={creatingNovel}
                  >
                    {creatingNovel ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Edit Project</h5>
                  <button 
                    className="btn-close" 
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={editFormData.title}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Genre *</label>
                    <select
                      name="genre"
                      className="form-select"
                      value={editFormData.genre}
                      onChange={handleEditFormChange}
                    >
                      <option value="">Select a genre</option>
                      {GENRES.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      name="summary"
                      className="form-control"
                      rows="3"
                      value={editFormData.summary}
                      onChange={handleEditFormChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowEditModal(false)}
                    disabled={editingNovelLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpdateNovel}
                    disabled={editingNovelLoading}
                  >
                    {editingNovelLoading ? 'Updating...' : 'Update Project'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Delete Project</h5>
                  <button 
                    className="btn-close" 
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>"{selectedNovel?.Title}"</strong>? This action cannot be undone.
                </div>
                <div className="modal-footer border-0">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={handleDeleteNovel}
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;