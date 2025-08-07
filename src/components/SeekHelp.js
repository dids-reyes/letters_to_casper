import React, { useEffect } from "react";
import Lottie from "react-lottie-player";
import balance from "../lotties/balance.json";
import blck_logo from "../lotties/black_ltc_logo.webp";
import {
  FaPhone,
  FaEnvelope,
  FaExternalLinkAlt,
  FaTiktok,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import "../styles/SeekHelp.css";

// Import your images here
import thea_leonen from "../data/advocates/thea_leonen.jpg";
import kookie_reyes from "../data/advocates/kookie_reyes.jpg";
import neil_raagas from "../data/advocates/neil_regner.jpg";
import keith_1 from "../data/advocates/keith.jpg";
// import featuredPlaceholder from "../assets/featured-site-placeholder.jpg";

// Placeholder images - replace with your actual imports
const theaLeonen = thea_leonen;
const kookieReyes = kookie_reyes;
const neilRaagas = neil_raagas;
const keith = keith_1;

const featuredPlaceholder =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFlJGfUNyQcRFgpLtNq0WMUp7wGltGnHxXXQ&s";

function SeekHelp() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const script = document.createElement("script");
    script.src = "https://embed.reddit.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const advocates = [
    {
      name: "Thea Leonen",
      tiktok: "thealeonen",
      instagram: "iamthealeonen",
      image: theaLeonen,
    },
    {
      name: "Kookie Reyes",
      tiktok: "mkookier",
      instagram: "kookie_reyes",
      youtube: "KookieReyes",
      image: kookieReyes,
    },
    {
      name: "Neil Raagas",
      tiktok: "theneilcutter",
      instagram: "theneilcutter",
      youtube: "neilraagas8747",
      image: neilRaagas,
    },
    {
      name: "Keith",
      tiktok: "urkeithysmentalhealth",
      youtube: "urkeithysmentalhealth",
      image: keith,
    },
  ];

  const organizations = [
    {
      name: "Philippine Mental Health Association (PMHA)",
      description:
        "PMHA offers mental health education, preventive services, and therapeutic services to individuals and communities in the Philippines.",
      logo: "https://pmha.org.ph/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fapp-logo.a36624cf.png&w=1080&q=75",
      website: "https://pmha.org.ph/",
      contacts: [{ type: "email", value: "hello@pmha.org.ph" }],
    },
    {
      name: "National Center for Mental Health (NCMH)",
      description:
        "The NCMH provides comprehensive mental health services for Filipinos, including crisis intervention and outpatient consultations.",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/National_Center_for_Mental_Health_%28NCMH%29.svg",
      website: "https://ncmh.gov.ph/",
      contacts: [
        { type: "phone", value: "Luzon Landline: 1553" },
        { type: "phone", value: "+639086392672" },
        { type: "phone", value: "+639663514518" },
        { type: "phone", value: "+639178998727" },
      ],
    },
    {
      name: "Mental Health PH",
      description:
        "A community of mental health advocates that aims to promote and protect mental health in the Philippines through online and offline initiatives.",
      logo: "https://mentalhealthph.org/wp-content/uploads/2021/10/logo-new.png",
      website: "https://mentalhealthph.org/",
      contacts: [{ type: "email", value: "hello@mentalhealthph.org" }],
    },
    {
      name: "Natasha Goulbourn Foundation (NGF)",
      description:
        "The NGF provides support through crisis intervention and counseling services.",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe87UUlf1hA8fBvoWA-w5okoolZXlsnczea3Mbkr2vLw&s",
      website: "https://ngf-mindstrong.com/",
      contacts: [
        { type: "phone", value: "0917 5584673" },
        { type: "phone", value: "02-8804-4673" },
        { type: "phone", value: "0918-873-4673" },
      ],
    },
    {
      name: "In Touch Community Services",
      description:
        "In Touch provides mental health services including crisis intervention and counseling.",
      logo: "https://in-touch.org/wp-content/uploads/2023/02/cropped-intouchlogo1-2.png",
      website: "https://www.in-touch.org/",
      contacts: [
        { type: "phone", value: "+63288937303" },
        { type: "phone", value: "+639190560709" },
        { type: "phone", value: "+639178001123" },
        { type: "phone", value: "+639228938944" },
        { type: "email", value: "helpline@in-touch.org" },
      ],
    },
    {
      name: "Empath",
      description:
        "Empath provides community-curated mental healthcare services and solutions to workplaces, schools, and non-profits in order to improve the well-being of their communities.",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6Xxt_wbudjUSLClDNpn2-4OASfjBADt1dcauA7IH3wsO5rmNwNyOiOONFgHOC1KtVsTw&usqp=CAU",
      website: "https://www.in-touch.org/",
      contacts: [
        { type: "phone", value: "+639175416789" },
        { type: "email", value: "hello@empath.ph" },
        { type: "email", value: "consultations@empath.ph" },
      ],
    },
  ];

  return (
    <div className="seek-help-container">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">Mental Health Resources</h1>
          <center>
            <Lottie
              loop
              animationData={balance}
              play
              style={{ width: 300, height: 300 }}
            />
          </center>
          <p className="hero-description">
            We believe in valuing mental health and well-being. If you or
            someone you know is struggling with mental health issues, there are
            resources available to help.
          </p>
        </div>

        {/* Featured Website Section */}
        <div className="featured-website">
          <div className="featured-content">
            <center>
              <h1 className="featured-title">
                Our Trusted Choice for Online Therapy
              </h1>
            </center>
            <div className="featured-logo">
              <img src={featuredPlaceholder} alt="Featured Website Logo" />
            </div>
            {/* <h3 className="featured-subtitle">Saya: Therapy for Filipinos</h3> */}
            <h2 className="featured-title"></h2>
            <p className="featured-description">
              Saya bridges the gap to mental wellness in the Philippines,
              offering affordable therapy in the Philippines through their
              platform where you connect with licensed Filipino psychologist and
              counselors who genuinely care about your wellbeing.
            </p>
            <a
              href="https://www.talksaya.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="featured-button"
            >
              Visit Website / Book a Session
              <FaExternalLinkAlt size={14} />
            </a>
          </div>
        </div>

        {/* Advocates Section */}
        <div className="advocates-section">
          <h2 className="section-title">Breaking Barriers, Ending Stigma</h2>
          <p className="section-subtitle">
            Follow passionate advocates igniting positive conversations about
            mental health
          </p>

          <div className="advocates-grid">
            {advocates.map((advocate, index) => (
              <div key={index} className="advocate-card">
                <div className="advocate-image-container">
                  <img
                    src={advocate.image}
                    alt={advocate.name}
                    className="advocate-image"
                  />
                </div>

                <h3 className="advocate-name">{advocate.name}</h3>

                <div className="advocate-social">
                  {advocate.tiktok && (
                    <a
                      href={`https://www.tiktok.com/@${advocate.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaTiktok size={18} />
                    </a>
                  )}
                  {advocate.instagram && (
                    <a
                      href={`https://www.instagram.com/${advocate.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaInstagram size={18} />
                    </a>
                  )}
                  {advocate.youtube && (
                    <a
                      href={`https://www.youtube.com/@${advocate.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaYoutube size={18} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            <p className="disclaimer-text">
              <strong>DISCLAIMER:</strong> They have given us permission to
              feature their accounts to raise awareness about mental health.
              Featured advocates are not affiliated with or sponsored by this
              website. We appreciate their contributions in inspiring and
              educating others about mental health.
            </p>
          </div>
        </div>

        <hr className="separator" />

        {/* Organizations Section */}
        <div className="organizations-section">
          <h2 className="section-title">
            Government & Private Support Resources
          </h2>

          <div className="organization-grid">
            {organizations.map((org, index) => (
              <div key={index} className="organization-card">
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="organization-link"
                >
                  <div className="organization-header">
                    <img
                      src={org.logo}
                      alt={`${org.name} Logo`}
                      className="organization-logo"
                    />
                    <div className="organization-title-container">
                      <h3 className="organization-title">{org.name}</h3>
                      <FaExternalLinkAlt
                        size={14}
                        className="external-link-icon"
                      />
                    </div>
                  </div>
                </a>

                <p className="organization-description">{org.description}</p>

                {org.contacts.length > 0 && (
                  <div className="contacts-section">
                    <h4 className="contacts-title">Contact Information</h4>
                    <div className="contacts-list">
                      {org.contacts.map((contact, contactIndex) => (
                        <div key={contactIndex} className="contact-item">
                          {contact.type === "phone" ? (
                            <FaPhone size={12} className="contact-icon" />
                          ) : (
                            <FaEnvelope size={12} className="contact-icon" />
                          )}
                          <span className="contact-value">{contact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className="separator" />

        {/* Community Section */}
        <div className="community-section">
          <h2 className="section-title">Social Media Communities</h2>

          <div className="reddit-container">
            <blockquote className="reddit-embed-bq" data-embed-height="502">
              Posts from the{" "}
              <a
                href="https://www.reddit.com/r/MentalHealthPH/"
                className="reddit-link"
              >
                mentalhealthph
              </a>{" "}
              community on Reddit
            </blockquote>
          </div>
        </div>

        {/* Footer Message */}
        <div className="footer-message">
          <p className="footer-text">
            Remember, seeking help is a sign of strength, not weakness. You
            don't have to face mental health challenges alone.
          </p>
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
        </div>
      </div>
    </div>
  );
}

export default SeekHelp;
