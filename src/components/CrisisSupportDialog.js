import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {FaPhone, FaExternalLinkAlt} from 'react-icons/fa';
import {IoCheckmarkOutline, IoHeartOutline, IoInformationCircleOutline} from 'react-icons/io5';
import logo from '../lotties/ltc_logo_1.webp';
import {useCrisisSupport} from '../context/CrisisSupportContext';
import '../styles/CrisisSupportDialog.css';

const BREATH_CYCLE = [
  {phase: 'inhale', label: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose…'},
  {phase: 'hold', label: 'Hold', duration: 7, instruction: 'Gently hold your breath…'},
  {phase: 'exhale', label: 'Exhale', duration: 8, instruction: 'Release slowly through your mouth…'},
];

const TOTAL_CYCLE_SECONDS = BREATH_CYCLE.reduce((acc, step) => acc + step.duration, 0); // 19s

const GROUNDING_STEPS = [
  {count: 5, sense: 'See', instruction: 'Look around and notice 5 things you can see right now, such as a chair, the light, a shadow, or a cup.'},
  {count: 4, sense: 'Feel', instruction: 'Notice 4 things you can physically touch, such as your clothes or the floor under your feet.'},
  {count: 3, sense: 'Hear', instruction: 'Listen for 3 distinct sounds around you, such as a fan, distant cars, or the wind.'},
  {count: 2, sense: 'Smell', instruction: 'Notice 2 things you can smell, or imagine 2 scents that feel calming and familiar.'},
  {count: 1, sense: 'Taste', instruction: 'Focus on 1 taste in your mouth, or take a gentle sip of cold water.'},
];

function CrisisSupportDialog() {
  const {isCrisisModalOpen, closeCrisisModal} = useCrisisSupport();
  const [activeTab, setActiveTab] = useState('grounding'); // 'grounding' | 'breathing'

  // 4-7-8 Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [cycleTime, setCycleTime] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingComplete, setGroundingComplete] = useState(false);
  const [showPrankCallGuide, setShowPrankCallGuide] = useState(false);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    if (!isCrisisModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showPrankCallGuide) {
          setShowPrankCallGuide(false);
          return;
        }
        closeCrisisModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCrisisModalOpen, closeCrisisModal, showPrankCallGuide]);

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
  const currentGroundingStep = GROUNDING_STEPS[groundingStep];

  const completeGroundingStep = () => {
    if (groundingStep === GROUNDING_STEPS.length - 1) {
      setGroundingComplete(true);
      return;
    }
    setGroundingStep((step) => step + 1);
  };

  const restartGrounding = () => {
    setGroundingStep(0);
    setGroundingComplete(false);
  };

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
            {!groundingComplete ? (
              <>
                <div className="crisis-grounding-progress" aria-label={`Grounding step ${groundingStep + 1} of ${GROUNDING_STEPS.length}`}>
                  {GROUNDING_STEPS.map((step, index) => (
                    <span key={step.count} className={index <= groundingStep ? 'is-active' : ''} aria-hidden="true" />
                  ))}
                  <small>{groundingStep + 1} of {GROUNDING_STEPS.length}</small>
                </div>
                <div className="crisis-grounding-task" aria-live="polite">
                  <div className="crisis-grounding-num">{currentGroundingStep.count}</div>
                  <div className="crisis-grounding-text">
                    <strong>{currentGroundingStep.sense}</strong>
                    <p>{currentGroundingStep.instruction}</p>
                  </div>
                </div>
                <button type="button" className="crisis-grounding-complete" onClick={completeGroundingStep}>
                  <IoCheckmarkOutline aria-hidden="true" />
                  {groundingStep === GROUNDING_STEPS.length - 1 ? 'Finish exercise' : 'Done, continue'}
                </button>
              </>
            ) : (
              <div className="crisis-grounding-finished" role="status">
                <IoHeartOutline aria-hidden="true" />
                <strong>You made it through the exercise.</strong>
                <p>We hope you feel a little steadier. If you still need support, please reach out to one of the services below.</p>
                <button type="button" onClick={restartGrounding}>Start again</button>
              </div>
            )}
          </div>
        )}

        <div className="crisis-hotlines-section">
          <div className="crisis-section-heading">
            <div className="crisis-section-subtitle">Confidential Crisis & Emotional Support</div>
            <button type="button" className="crisis-prank-guide-trigger" onClick={() => setShowPrankCallGuide(true)} aria-label="About prank calls">
              <IoInformationCircleOutline aria-hidden="true" />
              <span>Prank calls</span>
            </button>
          </div>
          <div className="crisis-hotlines-grid">
            <div className="crisis-hotline-box crisis-hotline-box--priority">
              <div className="crisis-hotline-heading">
                <h4>Hopeline PH</h4>
                <div className="crisis-hotline-badges">
                  <span className="crisis-hotline-status"><i aria-hidden="true" />Online 24/7</span>
                  <span className="crisis-hotline-free">Free</span>
                </div>
              </div>
              <p>Immediate, confidential emotional and crisis support.</p>
              <div className="crisis-hotline-links">
                <a href="tel:09175584673" className="crisis-hotline-link crisis-hotline-link--primary">
                  <FaPhone /> Call 0917-558-4673
                </a>
              </div>
            </div>

            <div className="crisis-hotline-box">
              <div className="crisis-hotline-heading">
                <h4>NCMH Crisis Helpline</h4>
                <div className="crisis-hotline-badges">
                  <span className="crisis-hotline-status"><i aria-hidden="true" />Online 24/7</span>
                  <span className="crisis-hotline-free">Free</span>
                </div>
              </div>
              <p>Free nationwide crisis and mental-health support.</p>
              <div className="crisis-hotline-links">
                <a href="tel:1553" className="crisis-hotline-link crisis-hotline-link--primary">
                  <FaPhone /> Call 1553
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

        {showPrankCallGuide && (
          <div className="crisis-prank-guide-overlay" role="presentation" onClick={() => setShowPrankCallGuide(false)}>
            <section className="crisis-prank-guide" role="dialog" aria-modal="true" aria-labelledby="crisis-prank-guide-title" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="crisis-prank-guide-close" aria-label="Close prank call information" onClick={() => setShowPrankCallGuide(false)}>×</button>
              <div className="crisis-prank-guide-heading">
                <IoInformationCircleOutline className="crisis-prank-guide-icon" aria-hidden="true" />
                <h3 id="crisis-prank-guide-title">Prank calls</h3>
              </div>
              <p>These lines are for people who may need immediate emotional or crisis support. Prank calls can delay help for someone in danger and will not be taken lightly.</p>
              <p>Interactions initiated from this site may be recorded in security logs, and deliberate misuse may result in blocked access. If you opened this by mistake, please close this guide and do not place a prank call.</p>
              <button type="button" className="crisis-prank-guide-dismiss" onClick={() => setShowPrankCallGuide(false)}>I understand</button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrisisSupportDialog;
