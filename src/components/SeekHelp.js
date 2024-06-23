import {React, useEffect} from 'react';
import Lottie from 'react-lottie-player';
import balance from '../lotties/balance.json';
import SideAd from './AdComponent';
import { FaPhone, FaEnvelope } from 'react-icons/fa';
import blck_logo from '../lotties/black_ltc_logo.webp';
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import thea_leonen from '../data/advocates/thea_leonen.jpg';
import kookie_reyes from '../data/advocates/kookie_reyes.jpg';
import '../styles/SeekHelp.css';

function SeekHelp() {
  // let calendarific_api_key = process.env.REACT_APP_CLNDR_API_KEY;
  useEffect(() => {
    window.scrollTo(0, 0);
    const script = document.createElement("script");
    script.src = "https://embed.reddit.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

  // fetch(`https://calendarific.com/api/v2/holidays?&api_key=${calendarific_api_key}&country=PH&year=2024&month=04`, options)
  //   .then(response => response.json())
  //   .then(response => console.log(response))
  //   .catch(err => console.error(err));

  //   return () => {
  //     document.body.removeChild(script);
  //   };
  }, []);

  // const options = {method: 'GET'};
  
  const advocates = [
    { name: 'Thea Leonen', tiktok: 'thealeonen', instagram: 'iamthealeonen', image: thea_leonen },
    { name: 'Kookie Reyes', tiktok: 'mkookier', instagram: 'kookie_reyes', youtube: 'KookieReyes', image: kookie_reyes },
  ];


  return (
    <div style={{ margin: '20px', textAlign: 'center', fontFamily: 'monospace' }}>
      <h2>Mental Health Resources</h2>
      <center>
        <Lottie
          loop
          animationData={balance}
          play
          style={{width: 300, height: 300}}
        />
      </center>
      <br/>
      <center>
        <a href="https://letterstocasper.ph">
          <img
            id="logo-ltc"
            className="blck_logo"
            src={blck_logo}
            alt="Letters to Casper"
          />
        </a>
      </center>
      <p>We believe in valuing mental health and well-being. If you or someone you know is struggling with mental health issues, there are resources available to help. <br/><br/> Please reach out to the organizations/individuals below for support and assistance.</p>
      <p><h3><b>Breaking Barriers, Ending Stigma</b></h3> Follow Passionate Advocates igniting positive conversations about Mental Health</p>
      <div className="advocates-container">
        {advocates.map((member, index) => (
          <div key={index} className="advocates-member" style={{ fontFamily: 'monospace' }}>
            <a href={`https://www.tiktok.com/@${member.tiktok}`} target="_blank" rel="noopener noreferrer"><img src={member.image} alt={member.name} className="advocates-member-image" /></a>
            <br/>
            <br/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              { member.tiktok &&
              <p style={{ margin: '0 5px' }}>
                <b>
                  <a href={`https://www.tiktok.com/@${member.tiktok}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <FaTiktok size='18px' />
                  </a>
                </b>
              </p>
              }
              { member.instagram &&
              <p style={{ margin: '0 5px' }}>
                <b>
                  <a href={`https://www.instagram.com/${member.instagram}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <FaInstagram size='20px' />
                  </a>
                </b>
              </p>
              }
              { member.youtube &&
              <p style={{ margin: '0 5px' }}>
                <b>
                  <a href={`https://www.youtube.com/@${member.youtube}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <FaYoutube size='20px' />
                  </a>
                </b>
              </p>
              }
            </div>
            <p style={{ fontSize: '14px' }}><b>{member.name}</b></p>
          </div>
        ))}
      </div>
      <p><small><b>DISCLAIMER:<br/></b> They have permitted us to showcase their accounts to promote mental health awareness.<br/> Featured advocates are not affiliated with or sponsored by this website.<br/> Their views are their own; inclusion here does not imply endorsement. <br/> We appreciate their contributions in inspiring and educating others about mental health.</small></p>
      <hr/>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://pmha.org.ph/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://pmha.org.ph/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fapp-logo.a36624cf.png&w=1080&q=75" alt="PMHA Logo" style={{ width: '100px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>Philippine Mental Health Association (PMHA)</span>
        </a>
        <p>PMHA offers mental health education, preventive services, and therapeutic services to individuals and communities in the Philippines.</p>
      </div>

      <hr/>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://mentalhealthph.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://mentalhealthph.org/wp-content/uploads/2021/10/logo-new.png" alt="MentalHealthPH Logo" style={{ width: '150px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>Mental Health PH</span>
        </a>
        <p>A community of mental health advocates that aims to promote and protect mental health in the Philippines through online and offline initiatives.</p>
      </div>

      <hr/>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://ncmh.gov.ph/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://ncmh.gov.ph/images/content/90years.jpg" alt="NCMH Logo" style={{ width: '100px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>National Center for Mental Health (NCMH)</span>
        </a>
        <p>The NCMH provides comprehensive mental health services for Filipinos, including crisis intervention and outpatient consultations.</p>

        <p><strong>NCMH Crisis Hotlines:</strong></p>
        <p>Luzon Landline (toll-free): 1553 <FaPhone size='10px'/></p>
          <p>+639086392672 <FaPhone size='10px'/></p>
          <p>+639663514518 <FaPhone size='10px'/></p>
          <p>+639178998727 <FaPhone size='10px'/></p>
      </div>

      <hr/>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://ngf-mindstrong.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe87UUlf1hA8fBvoWA-w5okoolZXlsnczea3Mbkr2vLw&s" alt="NGF Logo" style={{ width: '120px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>Natasha Goulbourn Foundation (NGF)</span>
        </a>
        <p>The NGF provides support through crisis intervention and counseling services.</p>

        <p><strong>NGF Hopeline:</strong></p>
          <p>0917 5584673 <FaPhone size='10px'/></p>
          <p>02-8804-4673 <FaPhone size='10px'/></p>
          <p>0918-873-4673 <FaPhone size='10px'/></p>
      </div>

      <hr/>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://www.in-touch.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://in-touch.org/wp-content/uploads/2023/02/cropped-intouchlogo1-2.png" alt="NGF Logo" style={{ width: '120px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>In Touch Community Services</span>
        </a>
        <p>In Touch provides mental health services including crisis intervention and counseling.</p>

        <p><strong>In Touch Crisis Hotlines:</strong></p>
          <p>+63288937303 <FaPhone size='10px'/></p>
          <p>+639190560709 <FaPhone size='10px'/></p>
          <p>+639178001123 <FaPhone size='10px'/></p>
          <p>+639228938944 <FaPhone size='10px'/></p>
          <p>helpline@in-touch.org <FaEnvelope size='10px'/></p>
      </div>

      <hr/>
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block', marginBottom: '20px', marginTop: '40px' }}>Social Media Communities</span>

        <blockquote className="reddit-embed-bq" data-embed-height="502">Posts from the <a href="https://www.reddit.com/r/MentalHealthPH/">mentalhealthph</a><br/> community on Reddit</blockquote><script async="" src="https://embed.reddit.com/widgets.js" charSet="UTF-8"></script>

      <br/>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <img src="https://play-lh.googleusercontent.com/g6Jk6tFSGmWJ7rLRIk6j_5Cdsn3OrOgOvcvJa8Bch8wARYOIGup1H9cvQQkjFxH1Lg" alt="Vent Logo" style={{ width: '120px', height: 'auto', marginBottom: '10px' }} />
        <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block', marginBottom: '20px' }}>Vent - Express yourself freely</span>
        <span style={{ fontSize: '0.9em', display: 'block', marginBottom: '20px' }}>Vent helps you connect to a supportive, positive, and understanding community, making it easy to share your feelings with people around the world.</span>
        <div style={{ display: 'flex', justifyContent: 'center'}}>
            <a href='https://play.google.com/store/apps/details?id=com.vent&hl=en&gl=US&pli=1&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' width='130px' height='auto'/></a>
            <a href="https://apps.apple.com/us/app/vent-express-your-feelings/id780298346?itsct=apps_box_badge&itscg=30200" style={{ display: 'inline-block', overflow: 'hidden' }} target="_blank" rel="noopener noreferrer">
              <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1388361600" alt="Download on the App Store" style={{margin: '6%', width: '88%', height: 'auto' }} />
            </a>
        </div>
        <SideAd />
      </div>
    </div>
);
}

export default SeekHelp;
