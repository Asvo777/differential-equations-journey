import './App.css'
import en from './i18next/en.json'
import fr from './i18next/fr.json'
import { useGlobal } from './context/GlobalContext';

function App() {

  const { language, setLanguage } = useGlobal();

  return (
    <>
      <section id="center">
        <h1>Chapters</h1>

        <div className="chapters-container">
          <div className="chapter">
            <h2>Chapter 1</h2>
            <p>
              {language === 'en' ? en.main.chap1 : fr.main.chap1}
            </p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 2</h2>
            <p>{language === 'en' ? en.main.chap2 : fr.main.chap2}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 3</h2>
            <p>{language === 'en' ? en.main.chap3 : fr.main.chap3}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 4</h2>
            <p>{language === 'en' ? en.main.chap4 : fr.main.chap4}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 5</h2>
            <p>{language === 'en' ? en.main.chap5 : fr.main.chap5}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 6</h2>
            <p>{language === 'en' ? en.main.chap6 : fr.main.chap6}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 7</h2>
            <p>{language === 'en' ? en.main.chap7 : fr.main.chap7}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 8</h2>
            <p>{language === 'en' ? en.main.chap8 : fr.main.chap8}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 9</h2>
            <p>{language === 'en' ? en.main.chap9 : fr.main.chap9}</p>
            <button>START</button>
          </div>

          <div className="chapter">
            <h2>Chapter 10</h2>
            <p>{language === 'en' ? en.main.chap10 : fr.main.chap10}</p>
            <button>START</button>
          </div>

        </div>
      </section>
    </>
  )
}

export default App
