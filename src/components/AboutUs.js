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
        </a>
      </center>
      <h1>About Us</h1>
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
        In our realm, the term "Casper" takes on a deeper meaning. It represents
        the intended recipient of these letters: individuals who may have
        unintentionally faded away from someone's life, leaving behind
        unresolved emotions and unspoken words. Just as the ghostly apparition
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
