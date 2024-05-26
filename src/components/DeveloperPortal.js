import React, { useEffect } from 'react';
import { FaGithub, FaEnvelope, FaReact } from 'react-icons/fa';
import { SiAxios, SiExpress, SiMongodb, SiJest, SiMongoose, SiSentry } from 'react-icons/si';
import { IoLogoJavascript } from 'react-icons/io5';
import blck_logo from '../lotties/black_ltc_logo.webp';
import dids_img from '../devs_data/dids_img.jpg';
import jayar_img from '../devs_data/jayar_img.jpg';
import arexon_img from '../devs_data/arexon_img_1.jpg';
import joshua_img from '../devs_data/joshua_img.jpg';
import '../styles/DeveloperPortal.css';

function DeveloperPortal() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    { name: 'Dids Irwyn T. Reyes', position: 'Founder', role: 'Lead Developer', image: dids_img },
    { name: 'Jay-ar Dagooc', position: 'Contributor', role: 'UI/UX/Frontend Dev', image: jayar_img },
    { name: 'Arexon Mortel', position: 'Contributor', role: 'Frontend Developer', image: arexon_img },
    { name: 'Joshua Dela Cruz', position: 'Contributor', role: 'Frontend Developer', image: joshua_img },
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
    <div style={{ margin: '10px' }}>
      <h2 style={{ textAlign: 'center' }}>Meet the developers behind</h2>
      <center>
        <img
          id="logo-ltc"
          className="logo"
          src={blck_logo}
          alt="Letters to Casper"
          width="200"
          height="35"
        />
      </center>
      <br />
      <div className="team-container">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member" style={{ fontFamily: 'monospace' }}>
            <img src={member.image} alt={member.name} className="team-member-image" />
            <p><b>{member.position}</b></p>
            <p className="team-member-role"><b>{member.role}</b></p>
            <p>{member.name}</p>
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
      <h2>How to Contribute</h2>
      <p>Frontend is hosted in GitHub as a Private Repository, to gain access contact us below</p>
      <p>We encourage contributions to our project! <br/><br/> You can contribute by:</p>
      <ol>
        <li>Cloning/Forking Repo</li>
        <li>Create a PR with your changes.</li>
      </ol>
      <h2>Contact Us</h2>
      <p>If you have any questions or suggestions, feel free to reach out at:</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FaGithub style={{ marginRight: '10px' }} />
        <a href="https://github.com/dids-reyes" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        <FaEnvelope style={{ marginRight: '10px' }} />
        <a href="mailto:letters2casper@gmail.com">letters2casper@gmail.com</a>
      </div>
      <br />
    </div>
  );
}

export default DeveloperPortal;
