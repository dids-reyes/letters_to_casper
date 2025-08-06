import React, { useEffect } from 'react';
import SideAd from './AdComponent';
import blck_logo from '../lotties/black_ltc_logo.webp';

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ margin: '20px', fontFamily: 'monospace' }}>
      <center>
        <a href="https://letterstocasper.com">
          <img
            id="logo-ltc"
            className="blck_logo"
            src={blck_logo}
            alt="Letters to Casper"
          />
        </a>
      </center>
      {/* <h1>Privacy Policy</h1> */}
      <br/>
      <p style={{ fontSize: 'smaller' }}>Last updated: June 18, 2024</p>
      <p>
        Protecting your privacy is fundamental to us. This <u>Privacy Policy</u> outlines how we collect, use, and safeguard your information when you use our website.
      </p>

      <h3>Information Collection and Use</h3>
      <p>
        At Letters to Casper, we respect your privacy and operate on a principle of minimal data collection. We don't require sign-ups or logins, and we don't track or store any personal information. You can post letters anonymously without disclosing any personal details.
      </p>
      <p>
        We do collect and store all submitted letters solely for the purpose of facilitating the display and sharing of user-generated content on our website. Additionally, we collect the location or city and region of the sender for confirmation purposes if they wish to delete their letter entry to avoid deletion from unknown users. However, we don't use this information for commercial purposes or to extract any personal information from users.
      </p>
      <p>
        We may display pop-up advertisements from approved advertising networks. However, we don't utilize retargeting or personalized advertising.
      </p>
      <p>
        We partner with ad networks like Adcash, Epom Market, Clickadu, Airpush, and Leadbolt, which support video ads. These networks enable us to show ads that users can watch to support our site. We do not engage in tracking or storing personal data through these ads.
      </p>
      <p>
        If you need to reach out to us for any reason, you can do so at letters2casper@gmail.com. Please note that we don't process online payments or offer any services for sale through our website.
      </p>

      <h3>Compliance Statements</h3>
      <p>
        We are committed to adhering to privacy regulations to ensure the protection of your data and rights. Letters to Casper complies with the California Online Privacy Protection Act (CalOPPA), the General Data Protection Regulation (GDPR) for European Union citizens, the California Consumer Privacy Act (CCPA), and the Data Privacy Act of 2012 <a href="https://www.officialgazette.gov.ph/2012/08/15/republic-act-no-10173/">(Republic Act No. 10173)</a> of the Philippines.
      </p>

      <h3>Cookies and Tracking</h3>
      <p>
        We use cookies and similar tracking technologies to enhance your experience on our website. These are small files that are stored on your device. They help us understand how you interact with our site, allowing us to improve our services. You can choose to disable cookies through your browser settings, but this may affect the functionality of our website.
      </p>

      <h3>Data Security</h3>
      <p>
        We take data security seriously and implement measures to protect your information from unauthorized access, alteration, or destruction. Our website uses SSL encryption to safeguard the data transmitted between your device and our servers.
      </p>

      <h3>Third-Party Services</h3>
      <p>
        Our website may contain links to third-party sites or services. We are not responsible for the privacy practices or the content of these external sites. We recommend reviewing the privacy policies of any third-party sites you visit.
      </p>

      <h3>Children's Privacy</h3>
      <p>
        Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
      </p>

      <h3>Changes to This Privacy Policy</h3>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. Changes are effective immediately upon posting.
      </p>

      <h3>Contact Us</h3>
      <p>
        If you have any questions or concerns regarding our Privacy Policy, please do not hesitate to contact us at letters2casper@gmail.com. Your privacy matters to us, and we are here to address any inquiries you may have.
      </p>
      <SideAd />
    </div>
  );
}

export default PrivacyPolicy;
