import React, {useEffect} from 'react';
import SideAd from './AdComponent';
import blck_logo from '../lotties/black_ltc_logo.webp';

function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{margin: '20px', fontFamily: 'monospace'}}>
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
      <h1>Terms & Conditions</h1>
      <i style={{fontSize: 'smaller'}}>Last updated: June 18, 2024</i>
      <p>
        These Terms and Conditions govern your use
        of our website. By accessing or using our website, you agree to comply
        with these Terms and Conditions.
      </p>

      <h2>1. Use of Website</h2>
      <p>
        You may use our website for lawful purposes and in accordance with these
        Terms and Conditions. You are prohibited from using our website in any
        way that violates applicable laws and regulations.
      </p>

      <h2>2. Privacy Policy</h2>
      <p>
        Your use of our website is also governed by our Privacy Policy. Please
        review our Privacy Policy to understand how we collect, use, and protect
        your information.
      </p>

      <h2>3. Intellectual Property Rights</h2>
      <p>
        The content, features, and functionality of our website are protected by
        copyright, trademark, and other intellectual property laws. You may not
        modify, reproduce, distribute, or exploit any part of our website
        without our prior written consent.
      </p>

      <h2>4. Limitation of Liability</h2>
      <p>
        We do not guarantee the accuracy, completeness, or reliability of any
        content on our website. We disclaim all liability for any errors or
        omissions in the content. Your use of our website is at your own risk.
      </p>

      <h2>5. Governing Law</h2>
      <p>
        These Terms and Conditions are governed by the laws of{' '}
        <a href="https://www.officialgazette.gov.ph/2012/08/15/republic-act-no-10173/">
          (Republic Act No. 10173)
        </a>{' '}
        , without regard to its conflict of law provisions.
      </p>

      <h2>6. Contact Us</h2>
      <p>
        If you have any questions or concerns regarding these Terms and
        Conditions, please contact us at letters2casper@gmail.com.
      </p>
      <SideAd />
    </div>
  );
}

export default TermsAndConditions;
