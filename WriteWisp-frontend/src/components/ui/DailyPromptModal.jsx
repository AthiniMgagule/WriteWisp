import { useState } from 'react';
import { GENRES } from '../../utils/helpers';
import ApiService from '../../services/api';

const DailyPromptModal = ({ show, onClose, onStartWriting, user }) => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePrompt = async () => {
    if (!selectedGenre) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.generatePrompt(selectedGenre);
      setGeneratedPrompt({
        text: response.prompt,
        genre: selectedGenre
      });
    } catch (err) {
      console.error('Failed to generate prompt:', err);
      setError('Failed to generate prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWriting = async () => {
    if (!generatedPrompt) return;
    
    try {
      // Get or create the prompt journal
      const journal = await ApiService.getPromptJournal(user.id, user.username);
      
      // Create a new chapter with the prompt
      const today = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      const chapter = await ApiService.createChapter(journal.NovelID, {
        title: `${generatedPrompt.genre} - ${today}`,
        content: `Prompt: ${generatedPrompt.text}\n\n---\n\nYour response:\n\n`,
        promptText: generatedPrompt.text,
        promptGenre: generatedPrompt.genre
      });
      
      // Navigate to editor with the journal and the new chapter
      onStartWriting(journal, chapter);
    } catch (err) {
      console.error('Failed to start writing:', err);
      setError('Failed to create writing session. Please try again.');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {generatedPrompt ? '✨ Your Daily Writing Prompt' : '📚 Choose Your Genre'}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleSkip}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            {!generatedPrompt ? (
              <>
                <p className="text-muted mb-4">
                  Get inspired with a fresh writing prompt! Select a genre to generate your daily prompt.
                </p>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="row g-3">
                  {GENRES.map((genre) => (
                    <div key={genre} className="col-md-4 col-6">
                      <button
                        className={`btn w-100 ${
                          selectedGenre === genre 
                            ? 'btn-primary' 
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => setSelectedGenre(genre)}
                        disabled={loading}
                      >
                        {genre}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-3">
                  <span className="badge bg-primary fs-6 px-3 py-2">
                    {generatedPrompt.genre}
                  </span>
                </div>
                
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body p-4">
                    <p className="fs-5 mb-0 text-dark" style={{ lineHeight: '1.6' }}>
                      {generatedPrompt.text}
                    </p>
                  </div>
                </div>
                
                <p className="text-muted small">
                  This prompt will be saved in your Writing Prompts journal
                </p>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-link text-muted" 
              onClick={handleSkip}
              disabled={loading}
            >
              Maybe later
            </button>
            
            {!generatedPrompt ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGeneratePrompt}
                disabled={!selectedGenre || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Prompt'
                )}
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setGeneratedPrompt(null);
                    setSelectedGenre('');
                  }}
                >
                  Generate Another
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartWriting}
                >
                  Start Writing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPromptModal;