import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, CheckCircle2 } from "lucide-react";
import { AiMedLogo } from "@/components/ui/aimed-logo";

export const metadata = {
  title: "GDPR sigurnost — AiMED",
  description: "Kako AiMED štiti Vaše zdravstvene podatke u skladu sa GDPR i BiH zakonima",
};

export default function GDPRSigurnostPage() {
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
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-black">GDPR sigurnost</h1>
            <p className="text-sm text-zinc-500 mt-1">Zaštita zdravstvenih podataka i GDPR usklađenost</p>
          </div>
        </div>

        <div className="prose prose-zinc max-w-none">
          <section className="mb-12">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <p className="text-sm text-blue-900 font-semibold mb-2">🔒 Vaša sigurnost je naš prioritet</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                AiMED je dizajniran od temelja sa fokusom na zaštitu zdravstvenih podataka. Ispunjavamo sve zahtjeve <strong>GDPR-a (EU 2016/679)</strong> i <strong>Zakona o zaštiti ličnih podataka BiH</strong>.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-black mb-4">Pregled sigurnosnih mjera</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-black text-base">End-to-End enkripcija</h3>
                </div>
                <p className="text-sm text-zinc-600">AES-256 enkripcija u mirovanju i SSL/TLS tokom prijenosa</p>
              </div>

              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-black text-base">EU hosting</h3>
                </div>
                <p className="text-sm text-zinc-600">Svi serveri fizički locirani u Europskoj Uniji</p>
              </div>

              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-black text-base">Pristupna kontrola</h3>
                </div>
                <p className="text-sm text-zinc-600">Multi-factor autentifikacija (MFA) i role-based access</p>
              </div>

              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-black text-base">Redovni auditi</h3>
                </div>
                <p className="text-sm text-zinc-600">Mjesečne sigurnosne provjere i penetracijski testovi</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">1. Pravni okvir i usklađenost</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">1. GDPR (Opšta uredba o zaštiti podataka)</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              AiMED je u potpunosti usklađen sa EU GDPR-om:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2 mb-6">
              <li><strong>Član 5:</strong> Načela obrade podataka (zakonitost, transparentnost, ograničenje svrhe)</li>
              <li><strong>Član 9:</strong> Obrada posebne kategorije podataka (zdravstveni podaci)</li>
              <li><strong>Član 25:</strong> Zaštita podataka po dizajnu i po defaultu (privacy by design)</li>
              <li><strong>Član 32:</strong> Sigurnost obrade</li>
              <li><strong>Član 35:</strong> Procjena uticaja na zaštitu podataka (DPIA)</li>
            </ul>

          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">2. Tehnička sigurnost</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">2.1. Enkripcija</h3>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-6">
              <p className="text-base text-zinc-700 font-semibold mb-3">🔐 Višeslojni pristup enkripciji:</p>
              <ul className="text-sm text-zinc-600 space-y-2 ml-4">
                <li>• <strong>U transportu:</strong> TLS 1.3 (SSL certifikat) za sve web komunikacije</li>
                <li>• <strong>U bazi podataka:</strong> AES-256 enkripcija na nivou kolona</li>
                <li>• <strong>Audio fajlovi:</strong> AES-256 enkripcija prije slanja ka AI API-ju</li>
                <li>• <strong>Backup-ovi:</strong> Enkriptovani backup-ovi sa odvojenim ključevima</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-black mb-3">2.2. Infrastruktura i hosting</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Koristimo isključivo GDPR-usklađene servise:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-semibold text-black text-sm mb-1">✓ Supabase (PostgreSQL baza)</p>
                <p className="text-sm text-zinc-600">EU region hosting, ISO 27001 certificiran</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-semibold text-black text-sm mb-1">✓ Vercel (Web hosting)</p>
                <p className="text-sm text-zinc-600">Frankfurt data center, automatski SSL</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-semibold text-black text-sm mb-1">✓ Azure OpenAI (AI obrada)</p>
                <p className="text-sm text-zinc-600">EU instance, Microsoft DPA ugovor</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">2.3. Autentifikacija i pristup</h3>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li><strong>Multi-Factor Authentication (MFA):</strong> Opcija dvostruke verifikacije</li>
              <li><strong>Role-Based Access Control (RBAC):</strong> Precizna kontrola ko šta može vidjeti</li>
              <li><strong>Session management:</strong> Automatsko odjava nakon neaktivnosti</li>
              <li><strong>Password policy:</strong> Minimalno 8 karaktera, hash sa bcrypt</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">2.4. Monitoring i logging</h3>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Real-time monitoring pristupa osjetljivim podacima</li>
              <li>Audit log svaka akcije (ko je pristupio, kada, šta je uradio)</li>
              <li>Automatska detekcija sumnjivog ponašanja</li>
              <li>Logovi se čuvaju 12 mjeseci za sigurnosne potrebe</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">3. Obrada zdravstvenih podataka</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">3.1. Minimizacija podataka</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              Prikupljamo samo podatke koji su neophodni za pružanje usluge:
            </p>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Audio zapise (automatsko brisanje nakon generisanja nalaza)</li>
              <li>Transkribovane nalaze (čuvamo dok korisnik ne zatraži brisanje)</li>
              <li>Metapodatke (datum, ljekar, tip nalaza)</li>
            </ul>
            <p className="text-base text-zinc-600 leading-relaxed mt-4">
              <strong>Ne prikupljamo:</strong> Fotografije pacijenata niti broj kartice osiguranja
            </p>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">3.2. Pseudonimizacija i anonimizacija</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <p className="text-sm text-amber-900 font-semibold mb-2">🎭 Zaštita identiteta pacijenata</p>
              <p className="text-sm text-amber-800 leading-relaxed mb-3">
                Kada koristimo podatke za unapređenje AI modela, koristimo isključivo:
              </p>
              <ul className="text-sm text-amber-800 space-y-1 ml-4">
                <li>• Izdiktirani sadržaj ljekara bez upotrebe ličnih podataka, s obzirom da oni nisu neophodni za ovu svrhu</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-black mb-3">3.3. Automatsko brisanje</h3>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200">
                    <th className="text-left p-4 font-semibold text-black">Tip podatka</th>
                    <th className="text-left p-4 font-semibold text-black">Automatsko brisanje</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600">
                  <tr className="border-b border-zinc-200">
                    <td className="p-4">Audio zapisi (originalni)</td>
                    <td className="p-4 font-medium text-red-600">Odmah po završetku transkripcije ✓</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="p-4">Privremeni transkripti (draft)</td>
                    <td className="p-4 font-medium text-red-600">Odmah ukoliko nisu sačuvani ✓</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="p-4">Session cookies</td>
                    <td className="p-4 font-medium text-red-600">30 minuta neaktivnosti ✓</td>
                  </tr>
                  <tr>
                    <td className="p-4">Korisnički račun (nakon brisanja)</td>
                    <td className="p-4 font-medium text-red-600">30 dana grace period ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">4. Vaša prava kao korisnika (GDPR)</h2>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              AiMED garantuje sva GDPR prava:
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                <div className="text-2xl">🔍</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-black mb-2">Pravo na pristup (član 15)</h4>
                  <p className="text-sm text-zinc-600 mb-2">Zatražite kopiju svih podataka koje čuvamo o Vama ili Vašim pacijentima.</p>
                  <p className="text-xs text-zinc-500">Rok: 30 dana | Besplatno</p>
                </div>
              </div>

              <div className="flex gap-4 bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                <div className="text-2xl">✏️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-black mb-2">Pravo na ispravku (član 16)</h4>
                  <p className="text-sm text-zinc-600 mb-2">Ispravite netačne ili nepotpune podatke direktno u aplikaciji.</p>
                  <p className="text-xs text-zinc-500">Instant | Dostupno u postavkama</p>
                </div>
              </div>

              <div className="flex gap-4 bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                <div className="text-2xl">🗑️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-black mb-2">Pravo na brisanje - "Pravo na zaborav" (član 17)</h4>
                  <p className="text-sm text-zinc-600 mb-2">Zatražite trajno brisanje svih podataka. Izvršavamo u roku od 7 dana.</p>
                  <p className="text-xs text-zinc-500">Email: <a href="mailto:info@cee-med.com" className="text-blue-600 hover:underline">info@cee-med.com</a></p>
                </div>
              </div>

              <div className="flex gap-4 bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                <div className="text-2xl">📦</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-black mb-2">Pravo na prenosivost podataka (član 20)</h4>
                  <p className="text-sm text-zinc-600 mb-2">Preuzmite sve nalaze u JSON ili CSV formatu za prijenos drugoj platformi.</p>
                  <p className="text-xs text-zinc-500">Dostupno: Postavke → Izvezi podatke</p>
                </div>
              </div>

              <div className="flex gap-4 bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                <div className="text-2xl">🚫</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-black mb-2">Pravo na prigovor (član 21)</h4>
                  <p className="text-sm text-zinc-600 mb-2">Prigovorite obradi podataka na osnovu legitimnog interesa.</p>
                  <p className="text-xs text-zinc-500">Kontakt DPO za razmatranje prigovora</p>
                </div>
              </div>

              <div className="flex gap-4 bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                <div className="text-2xl">⏸️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-black mb-2">Pravo na ograničenje obrade (član 18)</h4>
                  <p className="text-sm text-zinc-600 mb-2">Privremeno zaustavite obradu podataka dok se rješava spor.</p>
                  <p className="text-xs text-zinc-500">Email: <a href="mailto:info@cee-med.com" className="text-blue-600 hover:underline">info@cee-med.com</a></p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">5. Saglasnost za obradu podataka</h2>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6">
              <p className="text-sm text-green-900 font-semibold mb-2">✓ Transparentna i informisana saglasnost</p>
              <p className="text-sm text-green-800 leading-relaxed">
                Prije korištenja AiMED-a, od Vas tražimo izričit pristanak za obradu zdravstvenih podataka (GDPR član 9(2)(a)). Ova saglasnost je:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-zinc-200 rounded-xl p-4">
                <h4 className="font-semibold text-black text-sm mb-2">✅ Slobodno data</h4>
                <p className="text-xs text-zinc-600">Bez prisile ili uvjeta - možete koristiti platformu bez pritiska</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <h4 className="font-semibold text-black text-sm mb-2">✅ Konkretna</h4>
                <p className="text-xs text-zinc-600">Za određene svrhe - transkripcija, pohrana, AI obrada</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <h4 className="font-semibold text-black text-sm mb-2">✅ Informisana</h4>
                <p className="text-xs text-zinc-600">Jasno objašnjavamo šta radimo sa podacima</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <h4 className="font-semibold text-black text-sm mb-2">✅ Nedvosmislena</h4>
                <p className="text-xs text-zinc-600">Eksplicitna radnja (klik na "Prihvatam")</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">Povlačenje saglasnosti</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="text-sm text-amber-900 font-semibold mb-2">⚠️ Možete povući saglasnost u bilo kom trenutku</p>
              <p className="text-sm text-amber-800 leading-relaxed mb-3">
                Povlačenje pristanka ne utiče na zakonitost obrade prije povlačenja. Međutim, bez saglasnosti nećete moći koristiti AiMED jer je obrada zdravstvenih podataka suštinska za funkcionalnost.
              </p>
              <p className="text-sm text-amber-800 font-medium">Kako povući:</p>
              <ul className="text-sm text-amber-800 space-y-1 ml-4 mt-2">
                <li>• Email: <a href="mailto:info@cee-med.com" className="underline">info@cee-med.com</a></li>
                <li>• Postavke računa → "Povuci GDPR saglasnost"</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">6. Incident response i breach notification</h2>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">6.1. Protokol za sigurnosne incidente</h3>
            <p className="text-base text-zinc-600 leading-relaxed mb-4">
              U slučaju kršenja podataka (data breach), slijedi se strogi protokol:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-red-600">1</span>
                </div>
                <div>
                  <p className="font-semibold text-black text-sm">Detekcija i izolacija (0-2h)</p>
                  <p className="text-xs text-zinc-600">Automatski monitoring detektuje incident i izoluje pogođene sisteme</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber-600">2</span>
                </div>
                <div>
                  <p className="font-semibold text-black text-sm">Procjena štete (2-24h)</p>
                  <p className="text-xs text-zinc-600">DPO tim procjenjuje obim curenja i rizik za subjekte</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-semibold text-black text-sm">Obavještenje Agencije (do 72h)</p>
                  <p className="text-xs text-zinc-600">Prijava Agenciji za zaštitu ličnih podataka BiH (GDPR član 33)</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-green-600">4</span>
                </div>
                <div>
                  <p className="font-semibold text-black text-sm">Obavještenje korisnika (bez odlaganja)</p>
                  <p className="text-xs text-zinc-600">Email notifikacija svim pogođenim korisnicima sa detaljima i savjetima (GDPR član 34)</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">6.2. Preventivne mjere</h3>
            <ul className="list-disc pl-6 text-base text-zinc-600 space-y-2">
              <li>Penetracijski testovi 2x godišnje</li>
              <li>Bug bounty program za etičke hakere</li>
              <li>Security awareness training za tim</li>
              <li>Redovno ažuriranje sigurnosnih zakrpa</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">7. Certifikati i standardi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-semibold text-black text-sm mb-1">GDPR usklađenost</p>
                <p className="text-xs text-zinc-600">EU 2016/679</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-black text-sm mb-1">BiH Zakon o ZLP</p>
                <p className="text-xs text-zinc-600">U procesu registracije</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="font-semibold text-black text-sm mb-1">ISO 27001 ready</p>
                <p className="text-xs text-zinc-600">U procesu certifikacije</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="bg-green-50 border-l-4 border-green-600 p-6">
              <p className="text-sm text-green-900 font-semibold mb-2">✓ Vaša sigurnost je naša misija</p>
              <p className="text-sm text-green-800 leading-relaxed">
                AiMED je dizajniran sa najstrožim sigurnosnim standardima. Ako imate bilo kakva pitanja ili sumnje vezano za zaštitu Vaših podataka, ne ustručavajte se da nas kontaktirate. Transparentnost i povjerenje su temelj naše platforme.
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
