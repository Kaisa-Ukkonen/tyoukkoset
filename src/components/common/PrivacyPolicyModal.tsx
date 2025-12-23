"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PrivacyPolicyModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-zinc-950/95 text-gray-300 rounded-xl border border-yellow-700 shadow-lg p-6">
        {/* Sulje */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400"
          aria-label="Sulje"
        >
          <X size={24} />
        </button>

        {/* Otsikko */}
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4 inline-block border-b border-yellow-500/60 pb-1">
          Rekisteri- ja tietosuojaseloste
        </h2>

        <div className="space-y-4 text-sm leading-relaxed">
          <p className="text-xs text-gray-400">Laadittu: 23.12.2025</p>

          {/* 1 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              1. Rekisterinpitäjä
            </h3>
            <p className="mt-1">
              Tmi TyöUkkoset <br />
              Y-tunnus: 3518481-5 <br />
              Sähköposti: tyoukkoset@gmail.com <br />
              Puhelin: +358 44 218 5606
            </p>
          </div>

          {/* 2 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              2. Rekisteristä vastaava yhteyshenkilö
            </h3>
            <p className="mt-1">
              Jesse Kalevo Ukkonen <br />
              Sähköposti: jesse@tyoukkoset.fi
            </p>
          </div>

          {/* 3 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              3. Rekisterin nimi
            </h3>
            <p className="mt-1">
              Tmi TyoUkkosten asiakasrekisteri ja yhteydenottolomakkeen
              rekisteri
            </p>
          </div>

          {/* 4 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              4. Oikeusperuste ja henkilötietojen käsittelyn tarkoitus
            </h3>
            <p className="mt-1">
              Henkilötietojen käsittely perustuu rekisteröidyn antamaan
              suostumukseen, sopimussuhteeseen tai lakisääteisiin
              velvoitteisiin.
              <br />
              <br />
              Henkilötietoja käsitellään yhteydenottoihin vastaamiseksi,
              asiakassuhteen hoitamiseksi, laskutusta ja kirjanpitoa varten sekä
              yrityksen toiminnan järjestämiseksi.
              <br />
              <br />
              Tietoja ei käytetä automatisoituun päätöksentekoon tai
              profilointiin.
            </p>
          </div>

          {/* 5 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              5. Rekisterin tietosisältö
            </h3>
            <p className="mt-1">
              Rekisteriin voidaan tallentaa seuraavia tietoja:
            </p>

            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
              <li>nimi</li>
              <li>sähköpostiosoite</li>
              <li>mahdollinen osoite</li>
              <li>yhteydenottolomakkeen viesti</li>
              <li>asiakkuuteen ja laskutukseen liittyvät tiedot</li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              6. Säännönmukaiset tietolähteet
            </h3>
            <p className="mt-1">
              Tiedot saadaan rekisteröidyltä itseltään yhteydenottolomakkeen,
              sähköpostin tai asiakassuhteen yhteydessä.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              7. Tietojen luovutus ja siirto
            </h3>
            <p className="mt-1">
              Tietoja ei luovuteta säännönmukaisesti kolmansille osapuolille.
              <br />
              Tietoja käsitellään ainoastaan rekisterinpitäjän toimesta.
              <br />
              Henkilötietoja ei käytetä suoramarkkinointiin.
              <br />
              Henkilötietoja ei siirretä EU:n tai ETA:n ulkopuolelle.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              8. Rekisterin suojauksen periaatteet
            </h3>
            <p className="mt-1">
              Rekisterin tietoja käsitellään huolellisesti ja suojataan
              asianmukaisesti teknisin keinoin.
              <br />
              <br />
              Käytössä ovat mm. HTTPS-suojattu tiedonsiirto, rajattu pääsy
              tietokantaan, palvelinpuoleinen tunnistautuminen sekä
              automaattinen varmuuskopiointi.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              9. Tarkastusoikeus ja oikeus tietojen korjaamiseen
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus tarkastaa itseään koskevat tiedot ja
              vaatia virheellisen tiedon korjaamista.
              <br />
              <br />
              Pyynnöt tulee lähettää kirjallisesti rekisterinpitäjälle
              sähköpostitse. Rekisterinpitäjä vastaa pyyntöihin GDPR:n
              edellyttämässä ajassa.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">
              10. Muut rekisteröidyn oikeudet
            </h3>
            <p className="mt-1">
              Rekisteröidyllä on oikeus pyytää henkilötietojensa poistamista,
              rajoittaa tietojen käsittelyä sekä käyttää muita EU:n yleisen
              tietosuoja-asetuksen mukaisia oikeuksia.
            </p>
          </div>

          {/* Evästeet */}
          <div>
            <h3 className="text-yellow-400 font-semibold mt-6">Evästeet</h3>
            <p className="mt-1">
              Sivusto käyttää vain teknisesti välttämättömiä evästeitä sivuston
              toiminnan mahdollistamiseksi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
