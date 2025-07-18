import React, {useEffect} from 'react';
import SideAd from './AdComponent';
import blck_logo from '../lotties/black_ltc_logo.webp';

function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
    <div className="container" style={{margin: '20px', fontFamily: 'monospace'}}>
      <center>
        <a href="https://letterstocasper.ph">
          <img
            id="logo-ltc"
            className="blck_logo"
            src={blck_logo}
            alt="Letters to Casper"
          />
              <h3>Powered By</h3>
            <img
            id="logo-culionxchange"
            className="blck_logo"
            src="data:image/png;base64,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"
            alt="culionXchange"
          />
        </a>
      </center>
      {/* <h1>About Us</h1> */}
      <p>
        Welcome to Letters to Casper, a sanctuary where heartfelt sentiments
        find expression in the embrace of anonymity. While crafted with
        Filipinos in mind, all are welcome to utilize our platform, providing a
        safe space to bare their souls through open letters, addressing their
        special someone, or even someone from their past.
      </p>
      <p>
        The inspiration behind our platform stems from the enigmatic character
        of Casper, the friendly ghost. Casper, a creation of Seymour Reit and
        Joe Oriolo, embodies a spirit of gentleness and compassion, making him
        an ideal muse for our endeavor. Originally conceived as the protagonist
        of a children's storybook, Casper's journey transcends the pages of
        literature to serve as a symbol of connection and understanding on
        Letters to Casper.
      </p>
      <p>
        In our realm, the term "Casper" takes on a deeper meaning. <b>It represents
        the intended recipient of these letters: individuals who may have
        unintentionally faded away from someone's life, leaving behind
          unresolved emotions and unspoken words</b>. Just as the ghostly apparition
        of Casper navigates between the worlds of the living and the departed,
        our users traverse the realms of past and present, seeking closure and
        reconciliation through the written word.
      </p>
      <p>
        Here at Letters to Casper, we believe in the transformative power of
        expression. By providing a platform for catharsis and connection, we
        strive to foster empathy, healing, and understanding in a world
        characterized by fleeting encounters and missed opportunities for
        communication.
      </p>
      <p>
        Join us on this journey of self-discovery and emotional release. Whether
        you're seeking closure, expressing gratitude, or simply reaching out
        across the divide of time and distance, let your words echo in the
        ethereal halls of Letters to Casper.
      </p>
      <SideAd />
    </div>
    </>
  );
}

export default AboutUs;
