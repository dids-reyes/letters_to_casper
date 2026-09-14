import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {FaPhone, FaExternalLinkAlt} from 'react-icons/fa';
import {IoHeartOutline} from 'react-icons/io5';
import logo from '../lotties/ltc_logo_1.webp';
import {useCrisisSupport} from '../context/CrisisSupportContext';
import '../styles/CrisisSupportDialog.css';

const BREATH_CYCLE = [
  {phase: 'inhale', label: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose…'},
  {phase: 'hold', label: 'Hold', duration: 7, instruction: 'Gently hold your breath…'},
  {phase: 'exhale', label: 'Exhale', duration: 8, instruction: 'Release slowly through your mouth…'},
];

const TOTAL_CYCLE_SECONDS = BREATH_CYCLE.reduce((acc, step) => acc + step.duration, 0); // 19s

function CrisisSupportDialog() {
  const {isCrisisModalOpen, closeCrisisModal} = useCrisisSupport();
  const [activeTab, setActiveTab] = useState('grounding'); // 'grounding' | 'breathing'

  // 4-7-8 Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [cycleTime, setCycleTime] = useState(0);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    if (!isCrisisModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeCrisisModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCrisisModalOpen, closeCrisisModal]);

  // Breathing timer
  useEffect(() => {
    if (!isCrisisModalOpen || !isBreathingActive || activeTab !== 'breathing') return;

    const interval = setInterval(() => {
      setCycleTime((prev) => (prev + 1) % TOTAL_CYCLE_SECONDS);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCrisisModalOpen, isBreathingActive, activeTab]);

  // Determine current phase and countdown
  let currentStep = BREATH_CYCLE[0];
  let timeInPhase = cycleTime;

  if (cycleTime < 4) {
    currentStep = BREATH_CYCLE[0];
    timeInPhase = cycleTime;
  } else if (cycleTime < 11) {
    currentStep = BREATH_CYCLE[1];
    timeInPhase = cycleTime - 4;
  } else {
    currentStep = BREATH_CYCLE[2];
    timeInPhase = cycleTime - 11;
  }

  const secondsRemaining = currentStep.duration - timeInPhase;

  if (!isCrisisModalOpen) {
    return null;
  }

  return (
    <div
      className="crisis-overlay"
      role="presentation"
    >
      <div
        className="crisis-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-title"
        aria-describedby="crisis-desc"
      >
        <div className="crisis-header">
          <div className="crisis-brand">
            <img src={logo} alt="Letters to Casper" className="crisis-logo" />
          </div>
          <h2 id="crisis-title" className="crisis-title">
            Take a Gentle Moment
          </h2>
          <div className="crisis-badge">
            <IoHeartOutline /> You Matter
          </div>
          <p id="crisis-desc" className="crisis-desc">
            If things feel heavy right now, you don't have to carry this alone.
            Please take a gentle moment with us, or connect with people ready to listen and help.
          </p>
        </div>

        <div className="crisis-tabs">
          <button
            type="button"
            className={`crisis-tab ${activeTab === 'breathing' ? 'active' : ''}`}
            onClick={() => setActiveTab('breathing')}
          >
            4-7-8 Breathing Pacer
          </button>
          <button
            type="button"
            className={`crisis-tab ${activeTab === 'grounding' ? 'active' : ''}`}
            onClick={() => setActiveTab('grounding')}
          >
            5-4-3-2-1 Grounding Method
          </button>
        </div>

        {activeTab === 'breathing' ? (
          <div className="crisis-breathing-card">
            <div className="crisis-breathing-visual">
              <div
                className={`crisis-breathing-circle ${currentStep.phase}`}
                aria-live="polite"
              >
                <span className="crisis-breathing-phase">{currentStep.label}</span>
                <span className="crisis-breathing-count">{secondsRemaining}</span>
              </div>
            </div>
            <p className="crisis-breathing-instruction">{currentStep.instruction}</p>
            <button
              type="button"
              className="crisis-breathing-toggle-btn"
              onClick={() => setIsBreathingActive((prev) => !prev)}
            >
              {isBreathingActive ? 'Pause Exercise' : 'Resume Exercise'}
            </button>
          </div>
        ) : (
          <div className="crisis-grounding-card">
            <div className="crisis-grounding-item">
              <div className="crisis-grounding-num">5</div>
              <div className="crisis-grounding-text">
                <strong>See</strong>
                <p>Look around and notice 5 things you can see right now (a chair, the light, a shadow, a cup).</p>
              </div>
            </div>
            <div className="crisis-grounding-item">
              <div className="crisis-grounding-num">4</div>
              <div className="crisis-grounding-text">
                <strong>Feel</strong>
                <p>Notice 4 things you can physically touch (the fabric of your clothes, the floor under your feet).</p>
              </div>
            </div>
            <div className="crisis-grounding-item">
              <div className="crisis-grounding-num">3</div>
              <div className="crisis-grounding-text">
                <strong>Hear</strong>
                <p>Listen for 3 distinct sounds around you (a fan humming, distant cars, the wind).</p>
              </div>
            </div>
            <div className="crisis-grounding-item">
              <div className="crisis-grounding-num">2</div>
              <div className="crisis-grounding-text">
                <strong>Smell</strong>
                <p>Notice 2 things you can smell, or 2 scents you find calming and familiar.</p>
              </div>
            </div>
            <div className="crisis-grounding-item">
              <div className="crisis-grounding-num">1</div>
              <div className="crisis-grounding-text">
                <strong>Taste</strong>
                <p>Focus on 1 taste in your mouth, or take a gentle sip of cold water.</p>
              </div>
            </div>
          </div>
        )}

        <div className="crisis-hotlines-section">
          <div className="crisis-section-subtitle">Confidential Crisis & Emotional Support</div>
          <div className="crisis-hotlines-grid">
            <div className="crisis-hotline-box">
              <h4>NCMH Crisis Helpline</h4>
              <p>24/7 free, anonymous crisis intervention & mental health support.</p>
              <div className="crisis-hotline-links">
                <a href="tel:1553" className="crisis-hotline-link">
                  <FaPhone /> 1553 (Toll-Free Luzon)
                </a>
                <a href="tel:09178998727" className="crisis-hotline-link">
                  <FaPhone /> 0917-899-8727 (Globe/TM)
                </a>
                <a href="tel:09086392672" className="crisis-hotline-link">
                  <FaPhone /> 0908-639-2672 (Smart/Sun)
                </a>
              </div>
            </div>

            <div className="crisis-hotline-box">
              <h4>In Touch Community Services</h4>
              <p>Free, confidential 24/7 emotional crisis helpline in the Philippines.</p>
              <div className="crisis-hotline-links">
                <a href="tel:+63288937603" className="crisis-hotline-link">
                  <FaPhone /> +63 2 8893 7603
                </a>
                <a href="tel:+639190560709" className="crisis-hotline-link">
                  <FaPhone /> +63 919 056 0709
                </a>
                <a href="tel:+639178001123" className="crisis-hotline-link">
                  <FaPhone /> +63 917 800 1123
                </a>
              </div>
            </div>
          </div>

          <div className="crisis-intl-row">
            <span>Outside the Philippines?</span>
            <div className="crisis-intl-links">
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="crisis-intl-link"
              >
                Find A Helpline <FaExternalLinkAlt size={10} />
              </a>
              <a
                href="https://www.befrienders.org"
                target="_blank"
                rel="noopener noreferrer"
                className="crisis-intl-link"
              >
                Befrienders Worldwide <FaExternalLinkAlt size={10} />
              </a>
            </div>
          </div>
        </div>

        <div className="crisis-actions">
          <Link
            to="/seek_help"
            className="crisis-seekhelp-link"
            onClick={closeCrisisModal}
          >
            View More Support Resources &rarr;
          </Link>
          <button
            type="button"
            className="crisis-dismiss-btn"
            onClick={closeCrisisModal}
          >
            I'm okay right now
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrisisSupportDialog;

