import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNovels } from '../hooks/useApi';
import { GENRES, truncateText } from '../utils/helpers';

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedNovel, setSelectedNovel] = useState(null);
  const [formData, setFormData] = useState({ title: '', genre: '', summary: '' });
  const [formErrors, setFormErrors] = useState({});
  const [creatingNovel, setCreatingNovel] = useState(false);
  const [editingNovel, setEditingNovel] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', genre: '', summary: '' });
  const [editingNovelLoading, setEditingNovelLoading] = useState(false);

  // Fixed: Use user from context directly, no localStorage read needed
  useEffect(() => {
    if (user?.id) {
      loadNovels(user.id);
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
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3">Welcome back, {user?.username}!</h1>
          <p className="text-muted">Ready to continue your writing journey?</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          New Novel
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button type="button" className="btn-close" onClick={clearError}></button>
        </div>
      )}

      {/* Novels */}
      {novels.length === 0 ? (
        <div className="text-center py-5">
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 96, height: 96 }}>
            <i className="bi bi-journal-text fs-1 text-muted"></i>
          </div>
          <h4>No novels yet</h4>
          <p className="text-muted">Start your writing journey by creating your first novel.</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Your First Novel
          </button>
        </div>
      ) : (
        <>
          <h5 className="mb-3">Your Novels ({novels.length})</h5>
          <div className="row g-4">
            {novels.map((novel) => (
              <div className="col-md-6 col-lg-4" key={novel.NovelID}>
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title text-truncate">{novel.Title}</h6>
                        <span className="badge bg-primary">{novel.Genre}</span>
                      </div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => { setSelectedNovel(novel); setShowDeleteModal(true); }}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <p className="card-text text-muted mt-2 flex-grow-1">
                      {novel.Summary ? truncateText(novel.Summary, 120) : 'No summary available'}
                    </p>
                  </div>
                  <div className="card-footer d-flex gap-2">
                    <button className="btn btn-primary flex-grow-1" onClick={() => onNavigate('editor', novel)}>
                      Open Editor
                    </button>
                    <button className="btn btn-outline-secondary flex-grow-1" onClick={() => { setEditingNovel(novel); setEditFormData({ title: novel.Title, genre: novel.Genre, summary: novel.Summary || '' }); setShowEditModal(true); }}>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Novel</h5>
                <button className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                    value={formData.title}
                    onChange={handleFormChange}
                  />
                  {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Genre *</label>
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
                  <label className="form-label">Summary</label>
                  <textarea
                    name="summary"
                    rows="3"
                    className="form-control"
                    value={formData.summary}
                    onChange={handleFormChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={creatingNovel}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateNovel} disabled={creatingNovel}>
                  {creatingNovel ? 'Creating...' : 'Create Novel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Novel</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Genre *</label>
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
                  <label className="form-label">Summary</label>
                  <textarea
                    name="summary"
                    rows="3"
                    className="form-control"
                    value={editFormData.summary}
                    onChange={handleEditFormChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)} disabled={editingNovelLoading}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleUpdateNovel} disabled={editingNovelLoading}>
                  {editingNovelLoading ? 'Updating...' : 'Update Novel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Novel</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete <strong>"{selectedNovel?.Title}"</strong>? This action cannot be undone.
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteNovel}>
                  Delete Novel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;