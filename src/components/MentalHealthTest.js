import React, {useEffect, useMemo, useRef, useState} from 'react';
import {IoArrowBack, IoArrowForward, IoCheckmark, IoRefresh} from 'react-icons/io5';
import logo from '../lotties/ltc_logo_1.webp';
import noticingCover from '../assets/book-noticing.jpeg';
import bigPandaCover from '../assets/book-big-panda.jpeg';
import togetherCover from '../assets/book-together.jpeg';
import lastTreeCover from '../assets/book-last-tree.jpeg';
import '../styles/MentalHealthTest.css';

const questions = [
  {id:'mood', text:'I felt low or hopeless.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'interest', text:'I lost interest in things I usually enjoy.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'worry', text:'I felt anxious or unable to stop worrying.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'calm', text:'It was hard to relax or feel calm.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'sleep', text:'My sleep left me tired or unrested.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'energy', text:'I had very little energy.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'focus', text:'I struggled to focus or make decisions.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'connection', text:'I felt alone or disconnected from others.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'dailyLife', text:'My feelings made daily life harder.', options:['Not at all','Some days','Often','Nearly every day']},
  {id:'safety', text:'I thought I might be better off gone or might hurt myself.', options:['Not at all','Once or twice','More than once','Nearly every day']},
];

const resultBands = [
  {max:7, title:'Your answers suggest lighter strain', body:'You may be coping fairly well right now. Keep checking in with yourself and protect the routines and relationships that help you feel steady.', book:{title:'Noticing', author:'Kobi Yamada and Elise Hurst', cover:noticingCover, description:'A gently illustrated reminder to slow down, breathe, and notice the small, beautiful things that are easy to miss.'}},
  {max:15, title:'Your answers suggest some strain', body:'A few parts of life may be weighing on you. Consider talking with someone you trust and making space for rest, movement, food, and connection.', book:{title:'The Journey: Big Panda and Tiny Dragon', author:'James Norbury', cover:bigPandaCover, description:'Two friends travel through changing seasons in a quiet story about friendship, hope, and finding a way forward.'}},
  {max:22, title:'Your answers suggest significant strain', body:'Things may feel difficult across several areas. Reaching out to a mental health professional could give you support and a clearer next step.', book:{title:'Together', author:'Luke Adam Hawker', cover:togetherCover, description:'A man and his dog move through uncertainty and change, finding strength through companionship and connection.'}},
  {max:30, title:'Your answers suggest heavy strain', body:'You may be carrying a lot right now. Please consider speaking with a mental health professional soon, and lean on someone you trust today.', book:{title:'The Last Tree: A Seed of Hope', author:'Luke Adam Hawker', cover:lastTreeCover, description:'A quiet, hopeful story about a girl who imagines life returning to a world without trees—and begins planting it herself.'}},
];

function MentalHealthTest() {
  const [stage, setStage] = useState('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [moving, setMoving] = useState(false);
  const advanceTimer = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, [stage, index]);
  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const score = useMemo(() => Object.values(answers).reduce((sum, value) => sum + value, 0), [answers]);
  const result = resultBands.find(band => score <= band.max) || resultBands[resultBands.length - 1];
  const safetyConcern = (answers.safety || 0) > 0;

  const start = () => { setStage('questions'); setIndex(0); };
  const choose = value => {
    if (moving) return;
    const question = questions[index];
    const nextAnswers = {...answers, [question.id]: value};
    setAnswers(nextAnswers);
    setMoving(true);
    advanceTimer.current = window.setTimeout(() => {
      if (index === questions.length - 1) setStage('result');
      else setIndex(current => current + 1);
      setMoving(false);
    }, 160);
  };
  const goBack = () => {
    if (moving) return;
    if (index === 0) setStage('intro');
    else setIndex(current => current - 1);
  };
  const reset = () => { setAnswers({}); setIndex(0); setStage('intro'); };

  return (
    <main className="mh-test">
      <div className="mh-test__shell">
        <a className="mh-test__brand" href="https://letterstocasper.com/" aria-label="Go to Letters to Casper"><img src={logo} alt="Letters to Casper" /></a>

        {stage === 'intro' && (
          <section className="mh-intro" aria-labelledby="mh-intro-title">
            <p className="mh-kicker">A private check-in</p>
            <h1 id="mh-intro-title">How have you really been?</h1>
            <p className="mh-intro__lead">Ten gentle questions about the past two weeks. Your answers stay on this device and disappear when you leave.</p>
            <div className="mh-intro__facts" aria-label="Assessment details">
              <span>10 questions</span><span>About 2 minutes</span><span>No sign-in</span>
            </div>
            <button className="mh-primary" type="button" onClick={start}>Begin check-in <IoArrowForward /></button>
            <p className="mh-note">This is a general reflection tool, not a diagnosis or a replacement for professional care.</p>
          </section>
        )}

        {stage === 'questions' && (
          <section className="mh-question" aria-live="polite">
            <div className="mh-progress" aria-label={`Question ${index + 1} of ${questions.length}`}>
              <span>{index + 1} of {questions.length}</span>
              <div><i style={{width:`${((index + 1) / questions.length) * 100}%`}} /></div>
            </div>
            <p className="mh-period">Over the past two weeks…</p>
            <h1>{questions[index].text}</h1>
            <div className="mh-options" role="radiogroup" aria-label={questions[index].text}>
              {questions[index].options.map((option, value) => {
                const selected = answers[questions[index].id] === value;
                return <button key={option} type="button" role="radio" aria-checked={selected} disabled={moving} className={selected ? 'is-selected' : ''} onClick={() => choose(value)}><span>{option}</span>{selected && <IoCheckmark aria-hidden="true" />}</button>;
              })}
            </div>
            <button className="mh-back" type="button" onClick={goBack}><IoArrowBack /> Back</button>
          </section>
        )}

        {stage === 'result' && (
          <section className="mh-result" aria-labelledby="mh-result-title">
            <p className="mh-kicker">Your check-in</p>
            <h1 id="mh-result-title">{result.title}</h1>
            <p className="mh-result__body">{result.body}</p>

            {safetyConcern && (
              <div className="mh-urgent" role="alert">
                <h2>Your safety matters right now.</h2>
                <p>Your answer suggests you may have had thoughts of harming yourself. Please tell someone you trust and contact immediate support. If you might act on these thoughts, call emergency services or go to the nearest emergency room now.</p>
                <a href="tel:1553">Call NCMH Crisis Hotline — 1553</a>
              </div>
            )}

            <div className="mh-next">
              <h2>A useful next step</h2>
              <p>{score <= 7 ? 'Notice what has been helping, and check in again when things change.' : score <= 15 ? 'Share how you have been feeling with someone safe this week.' : 'Consider booking time with a licensed mental health professional.'}</p>
            </div>
            <section className="mh-book" aria-labelledby="mh-book-title">
              <img src={result.book.cover} alt={`Cover of ${result.book.title}`} />
              <div>
                <p>You may like to read</p>
                <h2 id="mh-book-title">{result.book.title}</h2>
                <p className="mh-book__author">by {result.book.author}</p>
                <p className="mh-book__description">{result.book.description}</p>
              </div>
            </section>
            {!safetyConcern && <p className="mh-support">If you feel unsafe at any point, contact local emergency services or the NCMH Crisis Hotline at <a href="tel:1553">1553</a>.</p>}
            <button className="mh-restart" type="button" onClick={reset}><IoRefresh /> Start again</button>
            <p className="mh-note">This result is based only on your responses. It is not a clinical diagnosis.</p>
          </section>
        )}
      </div>
    </main>
  );
}

export default MentalHealthTest;
