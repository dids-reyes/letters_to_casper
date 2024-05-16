import React from 'react';
import Lottie from 'react-lottie-player';
import balance from '../lotties/balance.json';
import { FaPhone } from 'react-icons/fa';

function SeekHelp() {
  return (
    <div style={{ margin: '20px', textAlign: 'center' }}>
      <h2>Mental Health Resources</h2>
      <center>
        <Lottie
          loop
          animationData={balance}
          play
          style={{width: 300, height: 300}}
        />
      </center>
      <p>We believe in valuing mental health and well-being. If you or someone you know is struggling with mental health issues, there are resources available to help. <br/><br/>Please reach out to the organizations below for support and assistance:</p>

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

        <p><strong>MentalHealthPH Crisis Hotlines:</strong></p>
          <li>(02) 1553  <FaPhone size='10px'/></li>
          <li>(02) 7-989-8727 <FaPhone size='10px'/></li>
          <li>0917-899-8727 <FaPhone size='10px'/></li>
      </div>

      <hr/>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://ncmh.gov.ph/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://ncmh.gov.ph/images/content/90years.jpg" alt="NCMH Logo" style={{ width: '100px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>National Center for Mental Health (NCMH)</span>
        </a>
        <p>The NCMH provides comprehensive mental health services for Filipinos, including crisis intervention and outpatient consultations.</p>

        <p><strong>NCMH Crisis Hotlines:</strong></p>
          <li>1553 (toll-free) <FaPhone size='10px'/></li>
          <li>Globe: 0917-8001123 <FaPhone size='10px'/></li>
          <li>Sun: 0922-893-8944 <FaPhone size='10px'/></li>
      </div>

      <hr/>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://ngf-mindstrong.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe87UUlf1hA8fBvoWA-w5okoolZXlsnczea3Mbkr2vLw&s" alt="NGF Logo" style={{ width: '120px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>Natasha Goulbourn Foundation (NGF)</span>
        </a>
        <p>The NGF provides support through crisis intervention and counseling services.</p>

        <p><strong>NGF Hotlines:</strong></p>
          <li>(02) 804-HOPE (4673) <FaPhone size='10px'/></li>
          <li>0917 5584673 <FaPhone size='10px'/></li>
          <li>2919 (toll-free for Globe and TM subscribers) <FaPhone size='10px'/></li>
      </div>

      <hr/>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a href="https://www.in-touch.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <img src="https://in-touch.org/wp-content/uploads/2023/02/cropped-intouchlogo1-2.png" alt="NGF Logo" style={{ width: '120px', height: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', display: 'block' }}>In Touch Community Services</span>
        </a>
        <p>In Touch provides mental health services including crisis intervention and counseling.</p>

        <p><strong>In Touch Hotlines:</strong></p>
          <li>0922-893-8944 <FaPhone size='10px'/></li>
      </div>
      <br/>
    </div>
  );
}

export default SeekHelp;
