import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import Lottie from 'react-lottie-player';
import balance from '../lotties/balance.json';
import logo from '../lotties/ltc_logo_1.webp';
import {FaEnvelope, FaExternalLinkAlt, FaInstagram, FaPhone, FaTiktok, FaYoutube} from 'react-icons/fa';
import {IoArrowBackOutline, IoHeartOutline, IoShieldCheckmarkOutline} from 'react-icons/io5';
import theaLeonen from '../data/advocates/thea_leonen.jpg';
import kookieReyes from '../data/advocates/kookie_reyes.jpg';
import neilRaagas from '../data/advocates/neil_regner.jpg';
import keith from '../data/advocates/keith.jpg';
import '../styles/SeekHelp.css';

const sayaLogo =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFlJGfUNyQcRFgpLtNq0WMUp7wGltGnHxXXQ&s';

function SeekHelp() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const script = document.createElement('script');
    script.src = 'https://embed.reddit.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.contains(script) && document.body.removeChild(script);
  }, []);

  const advocates = [
    {name:'Thea Leonen',tiktok:'thealeonen',instagram:'iamthealeonen',image:theaLeonen},
    {name:'Kookie Reyes',tiktok:'mkookier',instagram:'kookie_reyes',youtube:'KookieReyes',image:kookieReyes},
    {name:'Neil Raagas',tiktok:'theneilcutter',instagram:'theneilcutter',youtube:'neilraagas8747',image:neilRaagas},
    {name:'Keith',tiktok:'urkeithysmentalhealth',youtube:'urkeithysmentalhealth',image:keith},
  ];

  const organizations = [
    {name:'Philippine Mental Health Association (PMHA)',description:'Mental health education, advocacy, intervention, and clinical services for Filipino communities.',logo:'https://pmha.org.ph/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fapp-logo.a36624cf.png&w=1080&q=75',website:'https://pmha.org.ph/',contacts:[{type:'email',value:'hello@pmha.org.ph'}]},
    {name:'National Center for Mental Health (NCMH)',description:'Comprehensive mental health services, crisis intervention, and outpatient consultations.',logo:'https://upload.wikimedia.org/wikipedia/commons/f/f7/National_Center_for_Mental_Health_%28NCMH%29.svg',website:'https://ncmh.gov.ph/',contacts:[{type:'phone',value:'1553',label:'Luzon toll-free: 1553'},{type:'phone',value:'+639086392672'},{type:'phone',value:'+639663514518'},{type:'phone',value:'+639178998727'}]},
    {name:'MentalHealthPH',description:'A community promoting and protecting mental health through online and offline initiatives.',logo:'https://mentalhealthph.org/wp-content/uploads/2021/10/logo-new.png',website:'https://mentalhealthph.org/',contacts:[{type:'email',value:'hello@mentalhealthph.org'}]},
    {name:'Natasha Goulbourn Foundation',description:'Support through crisis intervention, counseling, and mental health advocacy.',logo:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe87UUlf1hA8fBvoWA-w5okoolZXlsnczea3Mbkr2vLw&s',website:'https://ngf-mindstrong.com/',contacts:[{type:'phone',value:'09175584673'},{type:'phone',value:'0288044673'},{type:'phone',value:'09188734673'}]},
    {name:'In Touch Community Services',description:'Free, anonymous emotional support and professional counseling, including a 24/7 crisis line.',logo:'https://in-touch.org/wp-content/uploads/2023/02/cropped-intouchlogo1-2.png',website:'https://www.in-touch.org/',contacts:[{type:'phone',value:'+63288937603'},{type:'phone',value:'+639190560709'},{type:'phone',value:'+639178001123'},{type:'phone',value:'+639228938944'},{type:'email',value:'helpline@in-touch.org'}]},
    {name:'Empath',description:'Community-curated mental healthcare services for individuals, workplaces, schools, and nonprofits.',logo:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6Xxt_wbudjUSLClDNpn2-4OASfjBADt1dcauA7IH3wsO5rmNwNyOiOONFgHOC1KtVsTw&usqp=CAU',website:'https://www.empath.ph/',contacts:[{type:'phone',value:'+639175416789'},{type:'email',value:'hello@empath.ph'},{type:'email',value:'consultations@empath.ph'}]},
  ];

  const contactHref = contact => contact.type === 'phone' ? `tel:${contact.value.replace(/[^+\d]/g,'')}` : `mailto:${contact.value}`;

  return (
    <main className="help-page">
      <nav className="help-nav"><Link to="/" className="help-brand"><img src={logo} alt="Letters to Casper" /></Link><Link to="/" className="help-back"><IoArrowBackOutline /><span>Back to letters</span></Link></nav>

      <header className="help-hero">
        <div className="help-hero__copy"><span className="help-eyebrow"><IoHeartOutline /> You deserve support</span><h1>You don’t have to carry everything alone.</h1><p>If you or someone you know is struggling, compassionate and professional support is available. Reaching out can be a strong first step.</p></div>
        <Lottie loop animationData={balance} play className="help-hero__animation" />
      </header>

      <section className="help-crisis" aria-labelledby="crisis-title"><span><IoShieldCheckmarkOutline /></span><div><small>Need immediate support?</small><h2 id="crisis-title">The NCMH Crisis Hotline is available 24/7.</h2><p>If you are in immediate danger, contact local emergency services or go to the nearest emergency room.</p></div><a href="tel:1553"><FaPhone /> Call 1553</a></section>

      <section className="help-featured"><div><span>Online therapy</span><h2>A trusted option for Filipino care.</h2><p>Saya connects people with licensed Filipino psychologists and counselors through an accessible online platform.</p><a href="https://www.talksaya.com/" target="_blank" rel="noopener noreferrer">Visit Saya / Book a session <FaExternalLinkAlt /></a></div><div className="help-featured__mark"><img src={sayaLogo} alt="Saya" /><span>Support that understands your context.</span></div></section>

      <section className="help-section" aria-labelledby="organizations-title"><div className="help-section__heading"><div><span>Professional support</span><h2 id="organizations-title">Government and private resources</h2></div><p>Call, email, or visit the organization that feels right for you.</p></div><div className="help-organizations">{organizations.map(org=><article className="help-organization" key={org.name}><a className="help-organization__head" href={org.website} target="_blank" rel="noopener noreferrer"><span><img src={org.logo} alt="" loading="lazy" /></span><div><h3>{org.name}</h3><small>Visit website <FaExternalLinkAlt /></small></div></a><p>{org.description}</p><div className="help-contacts">{org.contacts.map((contact,index)=><a key={`${contact.value}-${index}`} href={contactHref(contact)}>{contact.type==='phone'?<FaPhone />:<FaEnvelope />}<span>{contact.label||contact.value}</span></a>)}</div></article>)}</div></section>

      <section className="help-section help-advocates" aria-labelledby="advocates-title"><div className="help-section__heading"><div><span>Voices that help</span><h2 id="advocates-title">Breaking barriers and ending stigma</h2></div><p>Follow advocates encouraging healthier conversations around mental well-being.</p></div><div className="help-advocate-grid">{advocates.map(advocate=><article key={advocate.name}><img src={advocate.image} alt={advocate.name} loading="lazy" /><div><h3>{advocate.name}</h3><span>{advocate.tiktok&&<a href={`https://www.tiktok.com/@${advocate.tiktok}`} target="_blank" rel="noopener noreferrer" aria-label={`${advocate.name} on TikTok`}><FaTiktok /></a>}{advocate.instagram&&<a href={`https://www.instagram.com/${advocate.instagram}`} target="_blank" rel="noopener noreferrer" aria-label={`${advocate.name} on Instagram`}><FaInstagram /></a>}{advocate.youtube&&<a href={`https://www.youtube.com/@${advocate.youtube}`} target="_blank" rel="noopener noreferrer" aria-label={`${advocate.name} on YouTube`}><FaYoutube /></a>}</span></div></article>)}</div><p className="help-disclaimer"><strong>Note:</strong> These advocates gave permission to feature their accounts for mental health awareness. They are not affiliated with or sponsored by Letters to Casper.</p></section>

      <section className="help-community"><span>Community</span><h2>Connect with others who understand.</h2><div className="help-reddit"><blockquote className="reddit-embed-bq" data-embed-height="502">Posts from the <a href="https://www.reddit.com/r/MentalHealthPH/">mentalhealthph</a> community on Reddit</blockquote></div></section>

      <footer className="help-footer"><IoHeartOutline /><h2>Seeking help is a sign of strength.</h2><p>You do not have to face mental health challenges alone.</p><Link to="/">Return to Letters to Casper</Link></footer>
    </main>
  );
}

export default SeekHelp;
