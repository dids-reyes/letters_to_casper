import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoMailOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import SideAd from './AdComponent';
import logo from '../lotties/ltc_logo_1.webp';
import '../styles/LegalPages.css';

function TermsAndConditions() {
  useEffect(() => window.scrollTo(0, 0), []);

  const sections = [
    {id:'use', title:'Use of Website', content:<><p>You may use our website for lawful purposes and in accordance with these Terms and Conditions. You may not use the website to:</p><ul><li>Engage in fraudulent activity</li><li>Upload or transmit viruses or malicious code</li><li>Violate intellectual property rights</li><li>Harass, abuse, or harm another person</li></ul></>},
    {id:'privacy', title:'Privacy Policy', content:<p>Your use of the website is also governed by our <Link to="/privacy_policy">Privacy Policy</Link>. Please review it to understand how we collect, use, and protect information.</p>},
    {id:'property', title:'Intellectual Property Rights', content:<><p>The content, features, and functionality of our website are protected by copyright, trademark, and other intellectual property laws. You may not modify, reproduce, distribute, or exploit them without prior written consent. This includes:</p><ul><li>Text, graphics, logos, images, and videos</li><li>The design and layout of the website</li><li>Software and code used on the website</li></ul></>},
    {id:'user-content', title:'User-Generated Content', content:<p>By submitting letters or other content, you grant us a non-exclusive, royalty-free, perpetual, worldwide license to use, display, reproduce, and distribute that content. You represent that you own or have the necessary rights to submit it and that it does not infringe third-party rights.</p>},
    {id:'liability', title:'Limitation of Liability', content:<><p>We do not guarantee the accuracy, completeness, or reliability of website content. Your use of the website is at your own risk. We are not liable for damages arising from its use, including:</p><ul><li>Direct, indirect, incidental, or consequential damages</li><li>Loss of data or profits</li><li>Damage resulting from interruptions or website errors</li></ul></>},
    {id:'law', title:'Governing Law', content:<p>These Terms and Conditions are governed by the laws of the Philippines, without regard to conflict-of-law provisions. You agree to the exclusive jurisdiction of courts located in the Philippines for disputes related to these Terms.</p>},
    {id:'changes', title:'Changes to These Terms', content:<p>We may update these Terms and Conditions from time to time. Changes will be posted on this page and become effective immediately upon posting.</p>},
  ];

  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <Link to="/" className="legal-brand"><img src={logo} alt="Letters to Casper" /></Link>
        <Link to="/" className="legal-back"><IoArrowBackOutline /><span>Back to letters</span></Link>
      </nav>
      <header className="legal-hero">
        <span className="legal-eyebrow"><IoDocumentTextOutline /> Using the platform</span>
        <h1>Terms &amp; Conditions</h1>
        <p>The guidelines that help keep Letters to Casper respectful, lawful, and safe for everyone who writes or reads here.</p>
        <span className="legal-updated"><IoTimeOutline /> Last updated June 18, 2024</span>
      </header>
      <div className="legal-overview"><IoDocumentTextOutline /><div><strong>Before you continue</strong><p>By accessing or using Letters to Casper, you agree to follow these Terms and Conditions.</p></div></div>
      <div className="legal-layout">
        <aside className="legal-index"><span>On this page</span>{sections.map((section,index)=><a key={section.id} href={`#${section.id}`}><small>{String(index+1).padStart(2,'0')}</small>{section.title}</a>)}</aside>
        <article className="legal-content">
          <p className="legal-intro">These Terms and Conditions govern your use of our website. Please read them carefully before submitting or interacting with content.</p>
          {sections.map((section,index)=><section id={section.id} key={section.id}><span>{String(index+1).padStart(2,'0')}</span><h2>{section.title}</h2>{section.content}</section>)}
        </article>
      </div>
      <section className="legal-contact"><IoMailOutline /><div><small>Need clarification?</small><h2>Talk to our team.</h2><p>Contact us if you have a question or concern about these Terms and Conditions.</p></div><a href="mailto:letters2casper@gmail.com">Email us</a></section>
      <div className="legal-ad"><SideAd /></div>
    </main>
  );
}

export default TermsAndConditions;
