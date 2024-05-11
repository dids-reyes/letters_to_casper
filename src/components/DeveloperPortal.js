import React from 'react';
import {FaGithub, FaEnvelope} from 'react-icons/fa';
import {FaReact} from 'react-icons/fa';
import {SiAxios} from 'react-icons/si';
import {SiExpress} from 'react-icons/si';
import {SiMongodb} from 'react-icons/si';
import {IoLogoJavascript} from 'react-icons/io5';
import {SiJest} from 'react-icons/si';
import {SiMongoose} from 'react-icons/si';
import {SiSentry} from 'react-icons/si';

function DeveloperPortal() {
  return (
    <div style={{margin: '20px'}}>
      <h1>Developers</h1>
      <i style={{fontSize: 'smaller'}}>Last updated: May 09, 2024</i>
      <p>
        I welcome developers from all backgrounds, though currently, I
        prioritize Filipino developers as the app caters specifically to the
        Filipino audience. This page highlights the tools utilized and offers
        guidance on contributing to this project. As the owner of the website, I
        am the sole maintainer and developer of the project, and any assistance
        is greatly appreciated.
      </p>
      <h1>Technologies</h1>
      <FaReact size="30px" />
      &nbsp;
      <SiAxios size="30px" />
      &nbsp;
      <SiExpress size="30px" />
      &nbsp;
      <SiMongodb size="30px" />
      &nbsp;
      <IoLogoJavascript size="30px" />
      &nbsp;
      <SiJest size="30px" />
      &nbsp;
      <SiMongoose size="30px" />
      &nbsp;
      <SiSentry size="30px" />
      <h2>Contribute</h2>
      <p>
        Frontend is hosted in GitHub as a private repository, to gain access
        please contact me.
      </p>
      <p>We encourage contributions to our project! You can contribute by:</p>
      <ol>
        <li>Cloning/Forking Repo</li>
        <li>Create a PR with your changes.</li>
      </ol>
      <h2>Contact Us</h2>
      <p>
        If you have any questions or suggestions, feel free to reach out at
        letters2casper@gmail.com.
      </p>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <FaGithub style={{marginRight: '10px'}} />
        <a
          href="https://github.com/dids-reyes"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
      <div style={{display: 'flex', alignItems: 'center', marginTop: '10px'}}>
        <FaEnvelope style={{marginRight: '10px'}} />
        <a href="mailto:letters2casper@gmail.com">letters2casper@gmail.com</a>
      </div>
      <br />
    </div>
  );
}

export default DeveloperPortal;
