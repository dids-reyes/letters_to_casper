import React, { useEffect } from 'react';
import { FaEnvelope, FaReact } from 'react-icons/fa';
import { SiAxios, SiExpress, SiMongodb, SiJest, SiMongoose, SiSentry } from 'react-icons/si';
import { IoLogoJavascript } from 'react-icons/io5';
import blck_logo from '../lotties/black_ltc_logo.webp';
import dids_img from '../devs_data/dids_img.jpg';
import jayar_img from '../devs_data/jayar_img.jpg';
import arexon_img from '../devs_data/arexon_img_1.jpg';
import joshua_img from '../devs_data/joshua_img.jpg';
import christian_img from '../devs_data/christian_img.jpg';
import joseph_img from '../devs_data/joseph_img.png';
import karizza_img from '../devs_data/karriza_img.png';
import daniel_img from '../devs_data/daniel_img.png';
import angelica_img from '../devs_data/angelica_img.jpg';
import SideAd from './AdComponent';
import '../styles/DeveloperPortal.css';

function DeveloperPortal() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    { name: 'Dids Irwyn T. Reyes', position: 'Founder', role: 'Lead Dev', image: dids_img },
    { name: 'Jay-ar Dagooc', position: 'Contributor', role: 'UI/UX/Frontend', image: jayar_img },
    { name: 'Joshua Dela Cruz', position: 'Contributor', role: 'Frontend Dev', image: joshua_img },
    { name: 'Arexon Mortel', position: 'Contributor', role: 'Frontend Dev', image: arexon_img },
    { name: 'Christian Santos', position: 'Contributor', role: 'Data Analyst', image: christian_img },
    { name: 'Joseph Canilao', position: 'Contributor', role: 'DevOps', image: joseph_img },
    { name: 'Karizza B. Hipolito', position: 'Contributor', role: 'SEO Specialist', image: karizza_img },
    { name: 'Angelica Paez', position: 'Contributor', role: 'SEO Specialist', image: angelica_img },
    { name: 'Daniel Andrei Tubu', position: 'Contributor', role: 'DevOps', image: daniel_img },
  ];

  const technologies = [
    { icon: <FaReact size="30px" />, name: 'React' },
    { icon: <SiAxios size="30px" />, name: 'Axios' },
    { icon: <SiExpress size="30px" />, name: 'Express' },
    { icon: <SiMongodb size="30px" />, name: 'MongoDB' },
    { icon: <IoLogoJavascript size="30px" />, name: 'JavaScript' },
    { icon: <SiJest size="30px" />, name: 'Jest' },
    { icon: <SiMongoose size="30px" />, name: 'Mongoose' },
    { icon: <SiSentry size="30px" />, name: 'Sentry' },
  ];

  return (
    <div style={{ margin: '10px', fontFamily: 'monospace' }}>
      <h2 style={{ textAlign: 'center' }}>Meet the Developers Behind</h2>
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
      <br />
      <div className="team-container">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member" style={{ fontFamily: 'monospace' }}>
            <img src={member.image} alt={member.name} className="team-member-image" />
            {/* <p><b>{member.position}</b></p> */}
            <p className="team-member-role"><b>{member.role}</b></p>
            <p className="team-member-name">{member.name}</p>
          </div>
        ))}
      </div>
      <h2 align="center">Technologies | Frameworks</h2>
      <div className="technologies-container">
        {technologies.map((tech, index) => (
          <div key={index} className="technology">
            {tech.icon}
          </div>
        ))}
      </div>
      <hr/>
      <h2>Who We Are</h2>
      <p>We are a passionate team of developers dedicated to providing Filipinos a platform to express their emotions.</p> 
      <p>While our project is closed-source, we welcome new contributors who share our commitment to creativity.</p> 
      <p>This initiative also supports new graduates and aspiring web developers, offering valuable experience for their portfolios.</p>
      <hr/>
      <h2>How to Contribute</h2>
      <p>Feel Free to Contribute to the Project</p>
      <p>Frontend is hosted in GitHub as a Private Repository, to gain access contact us below</p>
      <p>You can contribute in any of the following:</p>
      <ol>
        <li>User Interface (UI)</li>
        <li>User Experience (UX)</li>
        <li>Search Engine Optimization (SEO)</li>
        <li>Frontend Development</li>
        <li>Backend Development</li>
        <li>Security Operations (SecOps)</li>
        <li>Neural Network Development</li>
        <li>Moderation</li>
      </ol>
      <h2>Contact Us</h2>
      <p>If you have any questions or suggestions, feel free to reach out at:</p>
      {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
      {/*   <FaGithub style={{ marginRight: '10px' }} /> */}
      {/*   <a href="https://github.com/dids-reyes" target="_blank" rel="noopener noreferrer">GitHub</a> */}
      {/* </div> */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        <FaEnvelope style={{ marginRight: '10px' }} />
        <a href="mailto:letters2casper@gmail.com">letters2casper@gmail.com</a>
      </div>
      <br />
      <SideAd />
    </div>
  );
}

export default DeveloperPortal;
