# Vizualizacija kvalitete zraka u Republici Hrvatskoj
O aplikaciji
----
Projekt je napravljen kao web aplikacija koja na temelju trenutnog datuma prikazuje indeks kvalitete zraka u Republici Hrvatskoj u rasponu od godine dana. Podatci korišteni za realizaciju ovog zadatka su javno dostupni putem [e-Reporting servisa](http://iszz.azo.hr/iskzl/exc.htm) Hrvatske agencije za okoliš i prirodu.

Prikazuje se [Europski indeks kvalitete zraka](http://iszz.azo.hr/iskzl/help.htm) koji se formira na temelju 5 onečišćujuće tvari: lebdeće čestice manje od 2.5µm (PM2.5), lebdeće čestice manje od 10µm (PM10), dušikov dioksid (NO2), prizemni ozon (O3) i sumporov dioksid (SO2). S web servisa se povlače podaci za 367 (366) dana (trenutni dan plus protekla godina koja ovisi jeli prijestupna ili ne) i formiraju se indeksi na temelju srednje vrijednosti za sve dane u pojedinom mjesecu. Pravilno bi bilo ako za neku onečišćujuću tvar nema mjerenja da indeks bude -1 (nema dovoljno podataka), ali kako neke mjerne stanice ne mjere pojedine onečišćujuće tvari tako se ovdje prikazuje samo najveći indeks (što je indeks veći to je kvaliteta zraka lošija). Ako se dogodi slučaj da u nekom mjesecu nisu mjerili sve tvari tada se prikazuje indeks -1 (nema dovoljno podataka).

Kako se koristi?
----
### Kao web aplikacija
[Air Quality In Croatia](https://themastergames.com/ferit/air/) je vrlo lako za koristiti. Dovoljno je posjetiti stranicu i pregledati podatke o kvaliteti zraka u proteklih godinu dana. U donjem dijelu aplikacije postoji klizač (eng. slider) koji omogućuje pregled indeksa za pojedine mjesece, a pored njega se nalazi gumb (eng. button) za animirani prikaz indeksa kroz mjesece (svakih 1000ms se pomiče klizač u desno). Također ako korisnik klikne na jednu od mjernih stanica može vidjeti detaljnije informacije o njoj poput: imena, mreže kojoj pripada, ID-a i uvećan prikaz indeksa kvalitete zraka.

### Instalacija
#### Kloniranje GIT repozitorija

Potrebno je klonirati GIT repozitorij unutar htdocs folder od nekog lokalnog servera (XAMPP ili WAMP).
```
git clone https://github.com/B-Matt/air-quality-croatia.git
```

Nakon što se završi kloniranje GIT repozitorija potrebno je uključiti lokalni server i otvoriti index.html. Sav JavaScript kod se nalazi unutar "js" foldera, a PHP kod vezan uz RESTful API se nalazi unutar "api" foldera.

#### Preuzimanje repozitorija preko ZIP-a
Kako bi se preuzela ZIP datoteka čitavog repozitorija potrebno je otići na "Clone" gumb i odabrati opciju "Download ZIP" (prikazano na slici 1).
![Slika 1](https://i.imgur.com/rTrvOEk.png)

Nakon što se ZIP datoteka preuzme potrebno je raspakirati repozitorij unutar htdocs foldera od nekog lokalnog servera (XAMPP ili WAMP). Za pokretanje projekta potrebno je uključiti lokalni server i odabrati putanju do index.html datoteke.

# Autor
Web aplikaciju napravio Matej Arlović ([MG - Master Games](https://themastergames.com/)).

Projekt je zaštićen [MIT licencom](https://github.com/B-Matt/air-quality-croatia/blob/master/LICENSE).
