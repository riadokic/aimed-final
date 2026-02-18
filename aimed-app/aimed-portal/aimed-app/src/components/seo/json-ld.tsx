export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "AiMED",
        url: "https://aimed.ba",
        logo: "https://aimed.ba/icon.png",
        description:
          "AI diktiranje nalaza — pretvorite glasovni diktat u strukturirani medicinski nalaz za manje od 60 sekundi.",
        areaServed: {
          "@type": "Country",
          name: "Bosnia and Herzegovina",
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: "AiMED",
        url: "https://aimed.ba",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Početna",
        url: "https://aimed.ba/",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Prijava",
        url: "https://aimed.ba/login",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Registracija",
        url: "https://aimed.ba/registracija",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Kontakt",
        url: "mailto:info@cee-med.com",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
