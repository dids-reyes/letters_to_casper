import React, { useEffect } from 'react';
import SideAd from './AdComponent';
import blck_logo from '../lotties/black_ltc_logo.webp';

function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ margin: '20px', fontFamily: 'monospace' }}>
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
      {/* <h2>Terms & Conditions</h2> */}
      <br/>
      <p style={{ fontSize: 'smaller' }}>Last updated: June 18, 2024</p>
      <p>
        These <u>Terms and Conditions</u> govern your use of our website. By accessing or using our website, you agree to comply with these Terms and Conditions.
      </p>

      <h3>1. Use of Website</h3>
      <p>
        You may use our website for lawful purposes and in accordance with these Terms and Conditions. You are prohibited from using our website in any way that violates applicable laws and regulations, including but not limited to:
        <ul>
          <li>Engaging in any fraudulent activity</li>
          <li>Uploading or transmitting viruses or malicious code</li>
          <li>Violating any intellectual property rights</li>
          <li>Harassing, abusing, or harming another person</li>
        </ul>
      </p>

      <h3>2. Privacy Policy</h3>
      <p>
        Your use of our website is also governed by our <a href="/privacy_policy">Privacy Policy</a>. Please review our Privacy Policy to understand how we collect, use, and protect your information.
      </p>

      <h3>3. Intellectual Property Rights</h3>
      <p>
        The content, features, and functionality of our website are protected by copyright, trademark, and other intellectual property laws. You may not modify, reproduce, distribute, or exploit any part of our website without our prior written consent. This includes but is not limited to:
        <ul>
          <li>Text, graphics, logos, images, and videos</li>
          <li>Design and layout of the website</li>
          <li>Software and code used on the website</li>
        </ul>
      </p>

      <h3>4. User-Generated Content</h3>
      <p>
        By submitting letters or other content to our website, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, display, reproduce, and distribute your content. You represent and warrant that you own or have the necessary rights to submit the content and that it does not infringe on any third-party rights.
      </p>

      <h3>5. Limitation of Liability</h3>
      <p>
        We do not guarantee the accuracy, completeness, or reliability of any content on our website. We disclaim all liability for any errors or omissions in the content. Your use of our website is at your own risk. We are not liable for any damages arising from your use of the website, including but not limited to:
        <ul>
          <li>Direct, indirect, incidental, or consequential damages</li>
          <li>Loss of data or profits</li>
          <li>Damages resulting from interruptions or errors in the website</li>
        </ul>
      </p>

      <h3>6. Governing Law</h3>
      <p>
        These Terms and Conditions are governed by and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the courts located in the Philippines for any disputes arising out of or related to these Terms and Conditions.
      </p>

      <h3>7. Changes to Terms and Conditions</h3>
      <p>
        We may update these Terms and Conditions from time to time. We will notify you of any changes by posting the new Terms and Conditions on this page. Changes are effective immediately upon posting.
      </p>

      <h3>8. Contact Us</h3>
      <p>
        If you have any questions or concerns regarding these Terms and Conditions, please contact us at letters2casper@gmail.com.
      </p>
      <SideAd />
    </div>
  );
}

export default TermsAndConditions;
