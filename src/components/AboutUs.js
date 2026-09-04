import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoHeartOutline,
  IoMailOpenOutline,
  IoPeopleOutline,
  IoSparklesOutline,
} from 'react-icons/io5';
import SideAd from './AdComponent';
import logo from '../lotties/ltc_logo_1.webp';

function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="about-page">
      <nav className="about-nav" aria-label="About page navigation">
        <Link to="/" className="about-brand" aria-label="Letters to Casper home">
          <img src={logo} alt="Letters to Casper" />
        </Link>
        <Link to="/" className="about-back">
          <IoArrowBackOutline aria-hidden="true" />
          <span>Back to letters</span>
        </Link>
      </nav>

      <section className="about-hero">
        <div className="about-hero__copy">
          <span className="about-eyebrow">
            <IoSparklesOutline aria-hidden="true" /> Our story
          </span>
          <h1>A quiet home for the words you never got to say.</h1>
          <p>
            Letters to Casper is a sanctuary where heartfelt sentiments find
            expression in the embrace of anonymity. Created with Filipinos in
            mind and open to everyone, it is a safe space for letters to someone
            special—or someone from the past.
          </p>
        </div>
        <div className="about-hero__letter" aria-hidden="true">
          <span>Dear Casper,</span><i /><i /><i />
          <strong>some words still deserve somewhere to go.</strong>
        </div>
      </section>

      <section className="about-values" aria-label="What we value">
        <article><span><IoMailOpenOutline /></span><div><strong>Open expression</strong><p>Write honestly, gently, and without judgment.</p></div></article>
        <article><span><IoHeartOutline /></span><div><strong>Emotional release</strong><p>Give unresolved feelings a place to breathe.</p></div></article>
        <article><span><IoPeopleOutline /></span><div><strong>Human connection</strong><p>Find understanding in words shared by others.</p></div></article>
      </section>

      <section className="about-story">
        <div className="about-story__content">
          <span className="about-section-number">01 / The inspiration</span>
          <h2>Why Casper?</h2>
          <p>
            The inspiration behind our platform comes from Casper, the friendly
            ghost. Created by Seymour Reit and Joe Oriolo, Casper embodies
            gentleness and compassion—an ideal symbol for connection and
            understanding.
          </p>
          <p>
            Originally imagined for a children's storybook, Casper's journey
            moved beyond the page. Here, that spirit lives on as a quiet
            companion for thoughts that might otherwise remain unheard.
          </p>
        </div>
        <aside className="about-definition">
          <span>cas·per</span><p>/ˈkas-pər/</p><strong>noun</strong>
          <blockquote>
            The intended recipient of a letter—someone who may have faded from
            your life, leaving unresolved emotions and unspoken words behind.
          </blockquote>
        </aside>
      </section>

      <section className="about-purpose">
        <span className="about-section-number">02 / What we believe</span>
        <h2>Writing can be its own kind of healing.</h2>
        <div className="about-purpose__columns">
          <p>
            Just as Casper moves between worlds, our users move between past and
            present—seeking closure, reconciliation, gratitude, or simply a way
            to finally put a feeling into words.
          </p>
          <p>
            We believe in the transformative power of expression. By creating a
            place for catharsis and connection, we hope to foster empathy,
            healing, and understanding in a world of fleeting encounters and
            missed opportunities to communicate.
          </p>
        </div>
      </section>

      <section className="about-closing">
        <IoHeartOutline aria-hidden="true" />
        <h2>Let your words find their way.</h2>
        <p>
          Whether you are seeking closure, expressing gratitude, or reaching
          across time and distance, your letter has a place here.
        </p>
        <Link to="/">Read and write letters</Link>
      </section>
      <div className="about-ad"><SideAd /></div>
    </main>
  );
}

export default AboutUs;
