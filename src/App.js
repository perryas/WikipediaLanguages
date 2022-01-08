import { useState } from 'react';
import './App.css';

const allowedLangs = [
  { code: 'en', wikiCode: 'enwiki', name: 'English' },
  { code: 'de', wikiCode: 'dewiki', name: 'German' },
  { code: 'fr', wikiCode: 'frwiki', name: 'French' },
  { code: 'it', wikiCode: 'itwiki', name: 'Italian' },
  { code: 'hu', wikiCode: 'huwiki', name: 'Hungarian' },
  { code: 'es', wikiCode: 'eswiki', name: 'Spanish' },
  { code: 'sv', wikiCode: 'svwiki', name: 'Swedish' },
  { code: 'pl', wikiCode: 'plwiki', name: 'Polish' },
]

function App() {
  const [selectedPerson, setSelectedPerson] = useState(null);

  const getPersonInfo = async name => {
    try {
      let personInfo = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&format=json&origin=*&titles=${name}`);
      personInfo = await personInfo.json();
      const wikibaseItem = Object.values(personInfo.query.pages)[0]?.pageprops.wikibase_item;

      let wikiLangs = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&props=sitelinks&ids=${wikibaseItem}`);
      wikiLangs = await wikiLangs.json();
      wikiLangs = Object.values(wikiLangs.entities[wikibaseItem].sitelinks);
      const allowedWikiLangs = wikiLangs.filter(lang => allowedLangs.some(l => l.wikiCode === lang.site));

      const wordCounts = await Promise.all(allowedWikiLangs.map(async wikiLang => {
        const lang = allowedLangs.find(lang => lang.wikiCode === wikiLang.site);
        let wordCount = await fetch(`https://${lang.code}.wikipedia.org/w/api.php?format=json&origin=*&action=query&list=search&srwhat=nearmatch&srlimit=1&srsearch=${name}`);
        wordCount = await wordCount.json();
        wordCount = wordCount.query.search[0]?.wordcount;
        return { wordCount, ...lang };
      }));

      setSelectedPerson({ wordCounts, name });
    } catch (err) {
      console.log('an error occurred', err);
    }
  }

  return (
    <div className="App">
      <h1>Graduway</h1>

      <div className='container-fluid row'>

        <div className='col-sm-6'>
          <table className='table'>
            <thead>
              <tr>
                <th>Famous People</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => getPersonInfo('Wilson Lumpkin')} ><td>Wilson Lumpkin</td></tr>
              <tr onClick={() => getPersonInfo('Robert Toombs')} ><td>Robert Toombs</td></tr>
              <tr onClick={() => getPersonInfo('Saxby Chambliss')} ><td>Saxby Chambliss</td></tr>
              <tr onClick={() => getPersonInfo('Wyche Fowler')} ><td>Wyche Fowler</td></tr>
            </tbody>
          </table>
        </div>

        <div className='col-sm-6'>
          {selectedPerson && <table className='table'>
            <thead>
              <tr>
                <th>Wikipedia Pages for {selectedPerson?.name}</th>
              </tr>
            </thead>
            <tbody>
              {selectedPerson.wordCounts.map((item, index) => (
                <tr key={index}><td>{item.name} - <a href={`https://${item.code}.wikipedia.org/wiki/${selectedPerson.name}`} target='_blank'>Link</a> - Word count:{item.wordCount}</td></tr>
              ))}
            </tbody>
          </table>}
        </div>

      </div>
    </div>
  );
}

export default App;
