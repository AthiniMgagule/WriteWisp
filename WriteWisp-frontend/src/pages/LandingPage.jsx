import { useState } from 'react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { GENRES } from '../utils/helpers';
import ApiService from '../services/api';

const LandingPage = ({ onNavigate }) => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    setLoading(true);
    setError(null);
    
    try {
      const data = await ApiService.generatePublicPrompt(genre);
      setCurrentPrompt(data.prompt || data.PromptText);
    } catch (err) {
      console.error('Error generating prompt:', err);
      setError('Failed to generate prompt. Please try again.');
      setCurrentPrompt('');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Intuitive Writing Tools',
      description: 'Distraction-free editor with rich formatting options and auto-save functionality.',
      icon: (
        <i className="bi bi-pencil-square fs-1 text-primary"></i>
      )
    },
    {
      title: 'Character Development',
      description: 'Create detailed character profiles and track their evolution throughout your story.',
      icon: (
        <i className="bi bi-person-badge fs-1 text-primary"></i>
      )
    },
    {
      title: 'Story Organization',
      description: 'Organize chapters, plotlines, and notes in one centralized workspace.',
      icon: (
        <i className="bi bi-journal-bookmark fs-1 text-primary"></i>
      )
    }
  ];

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5 text-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">WriteWisp</h1>
          <p className="lead mb-4">Where Stories Come to Life</p>
          <p className="fs-5 mb-5">
            Your complete writing companion. Craft novels, develop characters, 
            and organize your creative process in one beautiful platform.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Button
              size="lg"
              onClick={() => onNavigate('signup')}
              className="btn btn-light text-primary"
            >
              Start Writing for Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('login')}
              className="btn btn-outline-light"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Everything You Need to Write</h2>
          <p className="text-muted mb-5">
            Professional writing tools designed to help you focus on what matters most: your story.
          </p>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-4">
                <Card className="h-100 p-4 shadow-sm">
                  <CardContent>
                    <div className="mb-3">{feature.icon}</div>
                    <h3 className="h5 fw-semibold">{feature.title}</h3>
                    <p className="text-muted">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Writing Prompts Section */}
      <section className="bg-white py-5">
        <div className="container text-center">
          <div className="mb-4">
            <span className="badge bg-primary mb-2 px-3 py-2">
              <i className="bi bi-stars me-2"></i>
              AI-Powered
            </span>
            <h2 className="fw-bold mb-3">Need Inspiration?</h2>
            <p className="text-muted mb-4">
              Get your creativity flowing with AI-generated writing prompts tailored to your favorite genres.
            </p>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
            {GENRES.slice(0, 8).map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                disabled={loading}
                className={`btn btn-sm rounded-pill px-3 ${
                  selectedGenre === genre
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                }`}
              >
                {loading && selectedGenre === genre ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {genre}
                  </>
                ) : (
                  genre
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="alert alert-danger mx-auto mb-4" style={{ maxWidth: '600px' }}>
              {error}
            </div>
          )}

          {currentPrompt && !loading && (
            <Card className="mx-auto" style={{ maxWidth: '700px' }}>
              <CardContent className="p-4 text-center">
                <div className="mb-3">
                  <span className="badge bg-primary">
                    <i className="bi bi-lightbulb me-1"></i>
                    {selectedGenre} Prompt
                  </span>
                </div>
                <div className="bg-light rounded p-4 mb-4">
                  <p className="fs-5 text-dark mb-0" style={{ lineHeight: '1.7' }}>
                    {currentPrompt}
                  </p>
                </div>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Button 
                    className="btn btn-primary" 
                    onClick={() => onNavigate('signup')}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Start Writing This Story
                  </Button>
                  <Button 
                    variant="outline" 
                    className="btn btn-outline-secondary"
                    onClick={() => handleGenreClick(selectedGenre)}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Generate Another
                  </Button>
                </div>
                <p className="text-muted small mt-3 mb-0">
                  <i className="bi bi-magic me-1"></i>
                  Generated by AI • Sign up to save and write more prompts
                </p>
              </CardContent>
            </Card>
          )}

          {!currentPrompt && !loading && !error && (
            <div className="text-muted">
              <i className="bi bi-arrow-up-circle fs-4 mb-2"></i>
              <p>Select a genre above to generate an AI-powered writing prompt</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient text-white py-5 text-center bg-primary">
        <div className="container">
          <h2 className="fw-bold mb-3">Ready to Start Your Writing Journey?</h2>
          <p className="lead mb-4">Join thousands of writers who trust WriteWisp with their stories.</p>
          <Button
            size="lg"
            onClick={() => onNavigate('signup')}
            className="btn btn-light text-primary"
          >
            Get Started Today
          </Button>
          <p className="mt-3 small">Free to use. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-auto">
        <div className="container text-center">
          <h3 className="fw-bold text-primary mb-2">WriteWisp</h3>
          <p className="text-muted">Empowering writers to tell their stories beautifully.</p>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <a href="#" className="text-muted text-decoration-none">Privacy Policy</a>
            <a href="#" className="text-muted text-decoration-none">Terms of Service</a>
            <a href="#" className="text-muted text-decoration-none">Support</a>
          </div>
          <small className="text-secondary">&copy; 2024 WriteWisp. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;