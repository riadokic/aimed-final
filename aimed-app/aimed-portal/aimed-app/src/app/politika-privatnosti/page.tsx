import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AiMedLogo } from "@/components/ui/aimed-logo";

export const metadata = {
  title: "Politika privatnosti — AiMED",
  description: "Politika zaštite privatnosti i ličnih podataka za AiMED platformu",
};

export default function PolitikaPrivatnostiPage() {
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
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-black">Politika privatnosti</h1>
            <p className="text-sm text-zinc-500 mt-1">Posljednje ažurirano: 12. februar 2026.</p>
          </div>
        </div>

        <div className="prose prose-zinc max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">1. Uvod</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              AiMED (u daljem tekstu: "Platforma", "mi", "naš") poštuje Vašu privatnost i posvećen je zaštiti Vaših ličnih podataka. Ova Politika privatnosti objašnjava kako prikupljamo, koristimo, čuvamo i dijelimo Vaše lične podatke u skladu sa:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Zakonom o zaštiti ličnih podataka Bosne i Hercegovine</li>
              <li>Opštom uredbom o zaštiti podataka (GDPR) EU 2016/679</li>
              <li>Zakonom o elektronskim komunikacijama BiH</li>
              <li>Međunarodnim standardima za zaštitu zdravstvenih podataka</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">2. Rukovalac podataka</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Rukovalac Vaših ličnih podataka je:
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 text-sm text-zinc-700">
              <p className="font-semibold mb-2">CEE-MED d.o.o.</p>
              <p>Adresa: Zaima Šarca 34, 71000 Sarajevo, Bosna i Hercegovina</p>
              <p>Email: info@cee-med.com</p>
              <p>Telefon: +387 (0) 60 332 0648</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">3. Podaci koje prikupljamo</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">3.1. Podaci korisničkog računa</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-3">
              Prilikom registracije prikupljamo:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2 mb-6">
              <li>Ime i prezime ljekara</li>
              <li>Email adresu</li>
              <li>Lozinku (enkriptovanu)</li>
              <li>Specijalnost (opcionalno)</li>
              <li>Naziv klinike/ustanove (opcionalno)</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3">3.2. Medicinski podaci</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-3">
              Tokom korištenja platforme obrađujemo:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2 mb-6">
              <li><strong>Audio zapisi:</strong> Glasovni diktati ljekara</li>
              <li><strong>Transkripti:</strong> Tekst pretvoren iz audio zapisa</li>
              <li><strong>Medicinski nalazi:</strong> Strukturirani i formatirani dokumenti</li>
              <li><strong>Podaci o pacijentima:</strong> Ime, datum rođenja, dijagnoza (kako diktirani)</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
              <p className="font-semibold mb-1">⚠️ Napomena o zdravstvenim podacima</p>
              <p>Svi medicinski podaci su posebna kategorija ličnih podataka prema GDPR-u i Zakonu o zaštiti ličnih podataka BiH i tretirani su sa najvišim nivoom sigurnosti.</p>
            </div>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">3.3. Tehnički podaci</h3>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>IP adresa</li>
              <li>Informacije o pretraživaču i uređaju</li>
              <li>Vrijeme i datum pristupa</li>
              <li>Kolačići (cookies) za autentifikaciju</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">4. Svrha obrade podataka</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Vaše podatke koristimo isključivo u sljedeće svrhe:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li><strong>Pružanje usluge:</strong> Transkripcija, strukturiranje i generisanje medicinskih nalaza</li>
              <li><strong>Autentifikacija:</strong> Verifikacija identiteta korisnika</li>
              <li><strong>Poboljšanje usluge:</strong> Analiza korištenja radi unapređenja AI algoritama (sa anonimiziranim podacima)</li>
              <li><strong>Podrška korisnicima:</strong> Odgovaranje na upite i tehnička podrška</li>
              <li><strong>Ispunjenje pravnih obaveza:</strong> Saglasnost sa BiH i EU propisima</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">5. Pravni osnov obrade</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Podatke obrađujemo na osnovu:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li><strong>Pristanak (GDPR član 6(1)(a), 9(2)(a)):</strong> Izričit pristanak korisnika za obradu zdravstvenih podataka</li>
              <li><strong>Izvršenje ugovora (GDPR član 6(1)(b)):</strong> Potrebno za pružanje ugovorene usluge</li>
              <li><strong>Legitimni interes (GDPR član 6(1)(f)):</strong> Unapređenje usluge i tehnička podrška</li>
              <li><strong>Pravna obaveza (GDPR član 6(1)(c)):</strong> Ispunjenje regulatornih zahtjeva</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">6. Dijeljenje podataka</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              <strong>Mi nikada ne prodajemo Vaše lične podatke trećim stranama.</strong> Podatke dijelimo samo sa:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li><strong>Supabase (hosting baze podataka):</strong> EU certifikovani pružalac usluga cloud hostinga, GDPR usklađen</li>
              <li><strong>OpenAI / Azure OpenAI:</strong> Za AI transkripciju i NLP obradu (sa enkripcijom i bez trajnog čuvanja)</li>
              <li><strong>Vercel (hosting aplikacije):</strong> GDPR usklađena platforma</li>
              <li><strong>Pravni zahtjevi:</strong> Samo kada je zakonom propisano (sudski nalozi, zahtjevi agencija za zaštitu podataka)</li>
            </ul>
            <p className="text-base text-zinc-600 leading-relaxed mt-4">
              Svi treći pružaoci usluga su ugovorno obavezani da poštuju GDPR i BiH standarde zaštite podataka.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">7. Sigurnost podataka</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Implementirali smo sljedeće mjere zaštite:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li><strong>Enkripcija u transportu:</strong> SSL/TLS certifikat (HTTPS)</li>
              <li><strong>Enkripcija u mirovanju:</strong> AES-256 enkripcija baze podataka</li>
              <li><strong>Autentifikacija:</strong> Višefaktorska autentifikacija (MFA) opcija</li>
              <li><strong>Pristupna kontrola:</strong> Role-based access control (RBAC)</li>
              <li><strong>Redovni auditi:</strong> Mjesečne provjere sigurnosti i penetracijski testovi</li>
              <li><strong>Backup i oporavak:</strong> Dnevni backup sa 30-dnevnom retencijom</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">8. Vaša prava</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Prema GDPR-u i BiH zakonu imate sljedeća prava:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li><strong>Pravo na pristup (GDPR član 15):</strong> Zahtijevajte kopiju svojih podataka</li>
              <li><strong>Pravo na ispravku (GDPR član 16):</strong> Korigujte netačne podatke</li>
              <li><strong>Pravo na brisanje (GDPR član 17):</strong> "Pravo na zaborav" - zahtijevajte brisanje podataka</li>
              <li><strong>Pravo na ograničenje obrade (GDPR član 18):</strong> Ograničite kako koristimo Vaše podatke</li>
              <li><strong>Pravo na prenosivost (GDPR član 20):</strong> Preuzmite podatke u mašinski čitljivom formatu</li>
              <li><strong>Pravo na prigovor (GDPR član 21):</strong> Prigovorite obradi na osnovu legitimnog interesa</li>
              <li><strong>Pravo na povlačenje pristanka (GDPR član 7(3)):</strong> Povucite pristanak u bilo kom trenutku</li>
            </ul>
            <p className="text-base text-zinc-600 leading-relaxed mt-4">
              Za ostvarivanje prava kontaktirajte: <a href="mailto:info@cee-med.com" className="text-blue-600 hover:underline">info@cee-med.com</a>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">9. Čuvanje podataka</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Podatke čuvamo dok je to neophodno za pružanje usluge ili ispunjenje pravnih obaveza:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li><strong>Korisnički račun:</strong> Dok je račun aktivan + 30 dana nakon brisanja</li>
              <li><strong>Medicinski nalazi:</strong> Dok korisnik ne zatraži brisanje ili do 7 godina (pravni period arhiviranja)</li>
              <li><strong>Audio zapisi:</strong> Automatsko brisanje nakon obrade</li>
              <li><strong>Logovi sistema:</strong> 12 mjeseci</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">10. Prijava kršenja</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Imate pravo da podnesete pritužbu nadležnom tijelu za zaštitu podataka:
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 text-sm text-zinc-700">
              <p className="font-semibold mb-2">Agencija za zaštitu ličnih podataka BiH</p>
              <p>Adresa: Mehmeda Spahe 1, 71000 Sarajevo</p>
              <p>Telefon: +387 33 295 600</p>
              <p>Email: azlp@azlp.ba</p>
              <p>Web: <a href="http://www.azlp.ba" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.azlp.ba</a></p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">11. Izmjene politike</h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Ovu politiku možemo ažurirati povremeno. O značajnim izmjenama ćemo Vas obavijestiti putem emaila ili obavještenja na platformi. Preporučujemo redovnu provjeru ove stranice.
            </p>
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
