export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AiMED",
    url: "https://aimed.ba",
    logo: "https://aimed.ba/icon.png",
    description:
      "AI medicinska diktacija — pretvorite glasovni diktat u strukturirani medicinski nalaz za manje od 60 sekundi.",
    areaServed: {
      "@type": "Country",
      name: "Bosnia and Herzegovina",
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
