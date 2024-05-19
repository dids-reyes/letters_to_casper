import React, {useEffect} from 'react';

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{margin: '20px'}}>
      <h1>Privacy Policy</h1>
      <i style={{fontSize: 'smaller'}}>Last updated: May 09, 2024</i>
      <p>
        Welcome to Letters to Casper! Protecting your privacy is fundamental to
        us. This Privacy Policy outlines how we collect, use, and safeguard your
        information when you use our website.
      </p>

      <h2>Information Collection and Use</h2>
      <p>
        At Letters to Casper, we respect your privacy and operate on a principle
        of minimal data collection. We don't require sign-ups or logins, and we
        don't track or store any personal information. You can post letters
        anonymously without disclosing any personal details.
      </p>
      <p>
        We do collect and store all submitted letters solely for the purpose of
        facilitating the display and sharing of user-generated content on our
        website. Additionally, we collect the location or city and region of the
        sender for confirmation purposes if they wish to delete their letter
        entry to avoid deletion from unknown users. However, we don't use this
        information for commercial purposes or to extract any personal
        information from users.
      </p>
      <p>
        We may display pop-up advertisements from approved advertising networks.
        However, we don't utilize retargeting or personalized advertising.
      </p>
      <p>
        If you need to reach out to us for any reason, you can do so at
        letters2casper@gmail.com. Please note that we don't process online
        payments or offer any services for sale through our website.
      </p>

      <h2>Compliance Statements</h2>
      <p>
        We are committed to adhering to privacy regulations to ensure the
        protection of your data and rights. Letters to Casper complies with the
        California Online Privacy Protection Act (CalOPPA), the General Data
        Protection Regulation (GDPR) for European Union citizens, the California
        Consumer Privacy Act (CCPA), and the Data Privacy Act of 2012{' '}
        <a href="https://www.officialgazette.gov.ph/2012/08/15/republic-act-no-10173/">
          (Republic Act No. 10173)
        </a>{' '}
        of the Philippines.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions or concerns regarding our Privacy Policy,
        please do not hesitate to contact us at letters2casper@gmail.com. Your
        privacy matters to us, and we are here to address any inquiries you may
        have.
      </p>
    </div>
  );
}

export default PrivacyPolicy;
