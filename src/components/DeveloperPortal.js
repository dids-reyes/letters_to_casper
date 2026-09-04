import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {FaReact} from 'react-icons/fa';
import {
  SiAxios,
  SiExpress,
  SiJest,
  SiMongodb,
  SiMongoose,
  SiSentry,
} from 'react-icons/si';
import {
  IoArrowBackOutline,
  IoCodeSlashOutline,
  IoGitBranchOutline,
  IoLogoJavascript,
  IoMailOutline,
  IoPeopleOutline,
  IoRocketOutline,
} from 'react-icons/io5';
import logo from '../lotties/ltc_logo_1.webp';
import dids_img from '../devs_data/dids_img.jpg';
import jayar_img from '../devs_data/jayar_img.jpg';
import joshua_img from '../devs_data/joshua_img.jpg';
import christian_img from '../devs_data/christian_img.jpg';
import joseph_img from '../devs_data/joseph_img.jpg';
import daniel_img from '../devs_data/daniel_img.jpg';
import arexon_img from '../devs_data/arexon_img_1.jpg';
import blen_img from '../devs_data/blen_img.jpg';
import SideAd from './AdComponent';
import '../styles/DeveloperPortal.css';

function DeveloperPortal() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    {name: 'Dids Irwyn T. Reyes', role: 'Lead Developer', image: dids_img},
    {name: 'Jay-ar Dagooc', position: 'Contributor', role: 'UI/UX · Frontend', image: jayar_img},
    {name: 'Joshua Dela Cruz', position: 'Contributor', role: 'Frontend Developer', image: joshua_img},
    {name: 'Christian Santos', position: 'Contributor', role: 'Data Analyst', image: christian_img},
    {name: 'Joseph Canilao', position: 'Contributor', role: 'DevOps', image: joseph_img},
    {name: 'Daniel Andrei Tubu', position: 'Contributor', role: 'DevOps', image: daniel_img},
    {name: 'Arexon Mortel', position: 'Contributor', role: 'Frontend Developer', image: arexon_img},
    {name: 'Blen Alis', position: 'Contributor', role: 'Frontend · Moderator', image: blen_img},
  ];

  const technologies = [
    {icon: <FaReact />, name: 'React'},
    {icon: <SiAxios />, name: 'Axios'},
    {icon: <SiExpress />, name: 'Express'},
    {icon: <SiMongodb />, name: 'MongoDB'},
    {icon: <IoLogoJavascript />, name: 'JavaScript'},
    {icon: <SiJest />, name: 'Jest'},
    {icon: <SiMongoose />, name: 'Mongoose'},
    {icon: <SiSentry />, name: 'Sentry'},
  ];

  const contributionAreas = [
    'User Interface (UI)',
    'User Experience (UX)',
    'Search Engine Optimization',
    'Frontend Development',
    'Backend Development',
    'Security Operations',
    'Neural Network Development',
    'Moderation',
  ];

  return (
    <main className="developers-page">
      <nav className="developers-nav" aria-label="Developer page navigation">
        <Link to="/" className="developers-brand" aria-label="Letters to Casper home">
          <img src={logo} alt="Letters to Casper" />
        </Link>
        <Link to="/" className="developers-back">
          <IoArrowBackOutline aria-hidden="true" />
          <span>Back to letters</span>
        </Link>
      </nav>

      <header className="developers-hero">
        <span className="developers-eyebrow"><IoCodeSlashOutline /> Behind the platform</span>
        <h1>Meet the people building Letters to Casper.</h1>
        <p>
          A growing team of developers and contributors creating a thoughtful
          place for unspoken words, human connection, and emotional expression.
        </p>
        <div className="developers-hero__meta">
          <span><IoPeopleOutline /><strong>{teamMembers.length}</strong> team members</span>
          <span><IoGitBranchOutline /><strong>{technologies.length}</strong> core technologies</span>
        </div>
      </header>

      <section className="developers-section developers-team" aria-labelledby="team-title">
        <div className="developers-section__heading">
          <div><span>01 / The team</span><h2 id="team-title">People behind the letters</h2></div>
          <p>Different disciplines, one shared purpose.</p>
        </div>
        <div className="developers-team-grid">
          {teamMembers.map(member => (
            <article key={member.name} className="developer-card">
              <div className="developer-card__photo">
                <img src={member.image} alt={member.name} loading="lazy" />
                {member.position && <span>{member.position}</span>}
              </div>
              <div className="developer-card__copy">
                <strong>{member.name}</strong>
                <p>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="developers-section developers-stack" aria-labelledby="stack-title">
        <div className="developers-section__heading">
          <div><span>02 / Our stack</span><h2 id="stack-title">Tools that power the platform</h2></div>
          <p>A practical stack built for a reliable, evolving experience.</p>
        </div>
        <div className="developers-tech-grid">
          {technologies.map(tech => (
            <article key={tech.name} className="developer-tech">
              <span>{tech.icon}</span><strong>{tech.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="developers-about">
        <div>
          <span className="developers-eyebrow"><IoRocketOutline /> Who we are</span>
          <h2>Built with purpose, open to fresh perspectives.</h2>
          <p>
            We are a passionate team dedicated to giving Filipinos—and anyone
            who finds us—a platform to express their emotions. The project is
            closed-source, but we welcome contributors who share our commitment
            to thoughtful, creative work.
          </p>
          <p>
            The initiative also gives new graduates and aspiring web developers
            meaningful experience they can carry into their portfolios and
            future careers.
          </p>
        </div>
        <aside>
          <span>Ways to contribute</span>
          <ul>
            {contributionAreas.map(area => <li key={area}>{area}</li>)}
          </ul>
        </aside>
      </section>

      <section className="developers-contact">
        <span><IoMailOutline /></span>
        <div>
          <small>Have an idea or want to contribute?</small>
          <h2>Let’s build something meaningful together.</h2>
          <p>Repository access is available to approved contributors. Tell us how you would like to help.</p>
        </div>
        <a href="mailto:letters2casper@gmail.com">Contact the team</a>
      </section>

      <div className="developers-ad"><SideAd /></div>
    </main>
  );
}

export default DeveloperPortal;
