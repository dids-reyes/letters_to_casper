import React from 'react';
import Lottie from 'react-lottie-player';
import balance from '../lotties/balance.json';
import { FaPhone } from 'react-icons/fa';

function SeekHelp() {
  return (
    <div style={{ margin: '20px' }}>
      <h2>Mental Health Resources</h2>
      <center>
        <Lottie
          loop
          animationData={balance}
          play
          style={{width: 300, height: 300}}
        />
      </center>
      <p>We believe in valuing mental health and well-being. If you or someone you know is struggling with mental health issues, there are resources available to help. Please reach out to the organizations below for support and assistance:</p>

      <li>
        <a href="https://mentalhealthph.org/" target="_blank" rel="noopener noreferrer">
          MentalHealthPH
        </a>
        <p>A community of mental health advocates that aims to promote and protect mental health in the Philippines through online and offline initiatives.</p>
      </li>
      <li>
        <a href="https://ncmh.gov.ph/" target="_blank" rel="noopener noreferrer">
          National Center for Mental Health (NCMH)
        </a>
        <p>The NCMH provides comprehensive mental health services for Filipinos, including crisis intervention and outpatient consultations.</p>
        <p><strong>NCMH Crisis Hotlines:</strong></p>
        <ul>
          <li>1553 (toll-free) <FaPhone size='10px'/></li>
          <li>Globe: 0917-8001123 <FaPhone size='10px'/></li>
          <li>Sun: 0922-893-8944 <FaPhone size='10px'/></li>
        </ul>
      </li>
      <li>
        <a href="https://pmha.org.ph/" target="_blank" rel="noopener noreferrer">
          Philippine Mental Health Association (PMHA)
        </a>
        <p>PMHA offers mental health education, preventive services, and therapeutic services to individuals and communities in the Philippines.</p>
      </li>
      <li>
        <a href="https://www.ngf-hope.org/" target="_blank" rel="noopener noreferrer">
          Natasha Goulbourn Foundation (NGF) / Hopeline Philippines
        </a>
        <p>The NGF provides support through crisis intervention and counseling services.</p>
        <p><strong>NGF / Hopeline Philippines Hotlines:</strong></p>
        <ul>
          <li>(02) 804-HOPE (4673) <FaPhone size='10px'/></li>
          <li>0917 5584673 <FaPhone size='10px'/></li>
          <li>2919 (toll-free for Globe and TM subscribers) <FaPhone size='10px'/></li>
        </ul>
      </li>
      <li>
        <a href="https://www.in-touch.org/" target="_blank" rel="noopener noreferrer">
          In Touch Community Services
        </a>
        <p>In Touch provides mental health services including crisis intervention and counseling.</p>
        <p><strong>In Touch Crisis Line:</strong></p>
        <ul>
          <li>0922-893-8944 <FaPhone size='10px'/></li>
        </ul>
      </li>
      <br/>
    </div>
  );
}

export default SeekHelp;
