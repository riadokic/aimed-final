import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { AiMedLogo } from "@/components/ui/aimed-logo";

export const metadata = {
  title: "Uslovi korištenja — AiMED",
  description: "Uslovi i pravila korištenja AiMED platforme za medicinsku dokumentaciju",
};

export default function UsloviKoristenjaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Nazad
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <AiMedLogo variant="monogram" mode="dark" className="w-4 h-4" />
            </div>
            <AiMedLogo variant="full" mode="light" className="h-4 w-auto" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-black">Uslovi korištenja</h1>
            <p className="text-sm text-zinc-500 mt-1">Posljednje ažurirano: 12. februar 2026.</p>
          </div>
        </div>

        <div className="prose prose-zinc max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">1. Prihvatanje uslova</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Korištenjem AiMED platforme ("Platforma", "Usluga") prihvatate ove Uslove korištenja ("Uslovi") u cjelosti. Ako se ne slažete sa ovim uslovima, molimo Vas da ne koristite našu platformu.
            </p>
            <p className="text-base text-zinc-600 leading-relaxed">
              Ovi uslovi predstavljaju pravno obavezujući ugovor između Vas ("Korisnik", "Ljekar", "Vi") i CEE-MED d.o.o. ("mi", "naš", "Kompanija").
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">2. Opis usluge</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              AiMED je softverska platforma koja omogućava:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Glasovnu transkripciju medicinskih diktata pomoću AI tehnologije</li>
              <li>Automatsko strukturiranje medicinskih nalaza</li>
              <li>Generisanje medicinskih dokumenata u PDF i Word formatima</li>
              <li>Pohranu i upravljanje historijom medicinskih nalaza</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">3. Prihvatljivost korisnika</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Za korištenje AiMED platforme morate ispuniti sljedeće uslove:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Biti licencirani zdravstveni radnik (ljekar, medicinska sestra, tehničar)</li>
              <li>Imati aktivnu licencu za praksu u Bosni i Hercegovini ili EU</li>
              <li>Biti punoljetni (18+ godina)</li>
              <li>Prihvatiti Politiku privatnosti i GDPR saglasnost</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 mt-4">
              <p className="font-semibold mb-1">⚠️ Važno upozorenje</p>
              <p>AiMED je alat za administrativnu podršku. Nije zamjena za profesionalan medicinski sud. Ljekar je u potpunosti odgovoran za tačnost i validnost medicinskih nalaza.</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">4. Korisnički račun</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">4.1. Registracija</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Prilikom kreiranja računa obavezni ste:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Pružiti tačne i potpune informacije</li>
              <li>Održavati podatke ažurnim</li>
              <li>Čuvati lozinku kao povjerljivu informaciju</li>
              <li>Odmah obavijestiti nas o sumnjivoj aktivnosti na računu</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">4.2. Odgovornost za račun</h3>
            <p className="text-base text-zinc-600 leading-relaxed">
              Vi ste odgovorni za sve aktivnosti koje se dešavaju pod Vašim računom. Ne dijelite pristup računu sa neovlaštenim osobama.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">5. Prihvatljiva upotreba</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">5.1. Dozvoljene aktivnosti</h3>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2 mb-6">
              <li>Diktiranje i kreiranje medicinskih nalaza za vlastitu praksu</li>
              <li>Čuvanje i upravljanje nalazima pacijenata</li>
              <li>Izvoz dokumenata u svrhu medicinske dokumentacije</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">5.2. Zabranjene aktivnosti</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-3">
              Strogo je zabranjeno:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Koristiti platformu za nezakonite svrhe</li>
              <li>Prenositi malware, viruse ili štetni kod</li>
              <li>Pokušavati neovlašteni pristup sistemu ili drugim korisničkim računima</li>
              <li>Reverse engineering, dekompajliranje ili razdvajanje izvornog koda</li>
              <li>Preprodavati ili distribuirati uslugu bez pisane dozvole</li>
              <li>Opterećivati server masovnim zahtjevima (rate limiting abuse)</li>
              <li>Koristiti automatizaciju ili botove bez odobrenja</li>
              <li>Kršiti privatnost pacijenata ili dijeliti medicinske podatke neovlaštenim stranama</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">6. Intelektualna svojina</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">6.1. Naša intelektualna svojina</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Sva prava intelektualne svojine na platformi, uključujući:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2 mb-4">
              <li>Izvorni kod, dizajn, arhitekturu</li>
              <li>Logo, brandiranje, trgovačke marke</li>
              <li>AI modele i algoritme</li>
              <li>Dokumentaciju i sadržaj</li>
            </ul>
            <p className="text-base text-zinc-600 leading-relaxed">
              ...ostaju vlasništvo CEE-MED d.o.o. i zaštićena su autorskim pravima BiH i međunarodnim ugovorima.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">6.2. Vaša intelektualna svojina</h3>
            <p className="text-base text-zinc-600 leading-relaxed">
              Vi zadržavate sva prava na medicinske nalaze koje kreirate. Mi ne polaže pravo na sadržaj koji generiše, ali tražimo ograničenu licencu za obradu i pohranu radi pružanja usluge.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">7. Plaćanje i pretplata</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.1. Pretplatni modeli</h3>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2 mb-6">
              <li><strong>Besplatan plan (Free Tier):</strong> 14-dnevni besplatni probni period</li>
              <li><strong>Standard plan:</strong> Ograničen broj nalaza, limitirana podrška</li>
              <li><strong>Pro plan:</strong> Neograničen broj nalaza, prednost podrška</li>
              <li><strong>Enterprise plan:</strong> Prilagođena rješenja za klinike i bolnice</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">7.2. Uslovi naplate</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-3">
              Pretplate se naplaćuju mjesečno ili godišnje unaprijed. Cijene su iskazane u EUR (€) sa uračunatim PDV-om.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.3. Otkaz pretplate</h3>
            <p className="text-base text-zinc-600 leading-relaxed">
              Možete otkazati pretplatu u bilo kom trenutku. Otkaz stupa na snagu na kraju tekućeg obračunskog perioda. Ne vraćamo iznose za djelimično korištene periode.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">8. Tačnost i odgovornost</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">8.1. AI transkripcija</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Iako koristimo napredne AI algoritme, transkripcija može sadržavati greške. <strong>Ljekar je u potpunosti odgovoran za provjeru i validaciju svih nalaza prije korištenja.</strong>
            </p>

            <h3 className="text-xl font-semibold text-black mb-3">8.2. Medicinska odgovornost</h3>
            <p className="text-base text-zinc-600 leading-relaxed">
              AiMED <strong>ne pruža medicinske savjete, dijagnoze ili tretman</strong>. Platforma je alat za administrativnu dokumentaciju. Sva medicinska odluka i odgovornost leži na ljekaru.
            </p>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">8.3. Ograničenje odgovornosti</h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
              <p className="font-semibold mb-2">Odricanje odgovornosti</p>
              <p className="mb-2">U maksimalnoj mjeri dozvoljenom zakonom, CEE-MED d.o.o. nije odgovoran za:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Medicinske greške ili pogrešne dijagnoze</li>
                <li>Gubitak ili curenje medicinskih podataka izvan naše kontrole</li>
                <li>Indirektne, slučajne ili posljedične štete</li>
                <li>Gubitak prihoda ili profita</li>
              </ul>
              <p className="mt-2 text-xs">Maksimalna odgovornost ograničena je na iznos plaćene pretplate u posljednjih 12 mjeseci.</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">9. Dostupnost usluge</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Naš cilj je postići 99.9% uptime (SLA), ali ne garantujemo neprekidnu dostupnost. Zadržavamo pravo da privremeno obustavimo uslugu radi:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Planiranog održavanja (najavljeno 48h unaprijed)</li>
              <li>Hitnih sigurnosnih zakrpa</li>
              <li>Tehničkih problema van naše kontrole</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">10. Prekid usluge i brisanje računa</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">10.1. Prekid od strane korisnika</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Možete zatvoriti račun u bilo kom trenutku kroz postavke ili kontaktiranjem podrške. Nakon zatvaranja:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Podaci se čuvaju 30 dana u svrhu oporavka</li>
              <li>Nakon 30 dana, svi podaci se trajno brišu</li>
              <li>Možete zatražiti hitno brisanje podataka (stupanje na snagu u roku od 7 dana)</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">10.2. Prekid od strane AiMED-a</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-3">
              Zadržavamo pravo da obustavimo ili prekinemo Vaš račun ako:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Kršite ove Uslove korištenja</li>
              <li>Učestvujete u nezakonitim aktivnostima</li>
              <li>Predstavljate sigurnosni rizik za platformu ili druge korisnike</li>
              <li>Ne platite dospjelu pretplatu (nakon 7 dana zakašnjenja)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">11. Izmjene uslova</h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Možemo izmijeniti ove uslove povremeno. O značajnim izmjenama ćemo Vas obavijestiti putem emaila ili obavještenja na platformi najmanje 30 dana prije stupanja na snagu. Nastavak korištenja nakon izmjena predstavlja prihvatanje novih uslova.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">12. Mjerodavno pravo i nadležnost suda</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Ovi uslovi se tumače prema zakonima Bosne i Hercegovine. Svi sporovi će se rješavati pred nadležnim sudom u Sarajevu, BiH.
            </p>
            <p className="text-base text-zinc-600 leading-relaxed">
              Prije pokretanja sudskog spora, obje strane se slažu da pokušaju riješiti spor putem medijacije ili arbitraže.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">13. Kontakt i podrška</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Za pitanja o ovim uslovima:
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 text-sm text-zinc-700">
              <p className="font-semibold mb-3">CEE-MED d.o.o. - Pravni odjel</p>
              <p>Email podrška: <a href="mailto:info@cee-med.com" className="text-blue-600 hover:underline font-medium">info@cee-med.com</a></p>
              <p className="mt-3 text-xs text-zinc-500">Odgovaramo u roku od 3 radna dana.</p>
            </div>
          </section>

          <section className="mb-12">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
              <p className="text-sm text-blue-900 font-medium mb-2">📋 Prihvatanje uslova</p>
              <p className="text-sm text-blue-800">
                Registracijom i korištenjem AiMED platforme potvrđujete da ste pročitali, razumjeli i prihvatili ove Uslove korištenja u cjelosti, kao i našu Politiku privatnosti i GDPR saglasnost.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs text-zinc-500">
            © 2026 AiMED | AI Medical Dictation. Sva prava zadržana.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs text-zinc-500">
            <Link href="/politika-privatnosti" className="hover:text-black">Politika privatnosti</Link>
            <Link href="/uslovi-koristenja" className="hover:text-black">Uslovi korištenja</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
