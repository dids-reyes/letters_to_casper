import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import SideAd from './AdComponent';
import logo from '../lotties/ltc_logo_1.webp';
import '../styles/LegalPages.css';

function PrivacyPolicy() {
  useEffect(() => window.scrollTo(0, 0), []);

  const sections = [
    {
      id: 'information',
      title: 'Information Collection and Use',
      content: <>
        <p>At Letters to Casper, we respect your privacy and operate on a principle of minimal data collection. We don't require sign-ups or logins, and you can post letters anonymously without disclosing personal details.</p>
        <p>We store submitted letters so they can be reviewed, displayed, and shared on the website. We also collect the sender's city and region for confirmation purposes if they later request deletion of a letter. We don't use this information for commercial purposes or to extract personal information from users.</p>
        <p>We may display advertisements from approved advertising networks, including Google AdSense. We don't process online payments or offer services for sale through the website.</p>
      </>,
    },
    {id:'compliance', title:'Compliance Statements', content:<p>We are committed to adhering to privacy regulations to protect your data and rights. Letters to Casper complies with the California Online Privacy Protection Act (CalOPPA), the General Data Protection Regulation (GDPR) for European Union citizens, the California Consumer Privacy Act (CCPA), and the Philippine Data Privacy Act of 2012 <a href="https://www.officialgazette.gov.ph/2012/08/15/republic-act-no-10173/" target="_blank" rel="noopener noreferrer">(Republic Act No. 10173)</a>.</p>},
    {id:'cookies', title:'Cookies and Tracking', content:<p>We use cookies and similar technologies to improve your experience and understand how visitors interact with the site. You may disable cookies through your browser settings, although doing so may affect some website functionality.</p>},
    {id:'security', title:'Data Security', content:<p>We take data security seriously and implement measures intended to protect information from unauthorized access, alteration, or destruction. The website uses SSL encryption to safeguard data transmitted between your device and our servers.</p>},
    {id:'third-parties', title:'Third-Party Services', content:<p>Our website may contain links to third-party sites or services. We are not responsible for their privacy practices or content. We recommend reviewing the privacy policies of external sites you visit.</p>},
    {id:'children', title:"Children's Privacy", content:<p>Our website is not intended for children under 13. We do not knowingly collect personal information from children. If we learn that a child under 13 has provided personal information, we will take steps to delete it.</p>},
    {id:'changes', title:'Changes to This Policy', content:<p>We may update this Privacy Policy from time to time. Changes will be posted on this page and become effective immediately upon posting.</p>},
  ];

  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <Link to="/" className="legal-brand"><img src={logo} alt="Letters to Casper" /></Link>
        <Link to="/" className="legal-back"><IoArrowBackOutline /><span>Back to letters</span></Link>
      </nav>
      <header className="legal-hero">
        <span className="legal-eyebrow"><IoShieldCheckmarkOutline /> Your privacy</span>
        <h1>Privacy Policy</h1>
        <p>A clear overview of the information connected to your use of Letters to Casper and how we work to protect it.</p>
        <span className="legal-updated"><IoTimeOutline /> Last updated June 18, 2024</span>
      </header>
      <div className="legal-overview"><IoLockClosedOutline /><div><strong>Privacy, in brief</strong><p>No account is required. Letters are submitted anonymously, and we aim to collect only what is needed to operate and safeguard the platform.</p></div></div>
      <div className="legal-layout">
        <aside className="legal-index"><span>On this page</span>{sections.map((section,index)=><a key={section.id} href={`#${section.id}`}><small>{String(index+1).padStart(2,'0')}</small>{section.title}</a>)}</aside>
        <article className="legal-content">
          <p className="legal-intro">Protecting your privacy is fundamental to us. This Privacy Policy explains how we collect, use, and safeguard information when you use our website.</p>
          {sections.map((section,index)=><section id={section.id} key={section.id}><span>{String(index+1).padStart(2,'0')}</span><h2>{section.title}</h2>{section.content}</section>)}
        </article>
      </div>
      <section className="legal-contact"><IoMailOutline /><div><small>Questions or concerns?</small><h2>We’re here to help.</h2><p>Your privacy matters to us. Contact the Letters to Casper team for any policy-related inquiry.</p></div><a href="mailto:letters2casper@gmail.com">Email us</a></section>
      <div className="legal-ad"><SideAd /></div>
    </main>
  );
}

export default PrivacyPolicy;
