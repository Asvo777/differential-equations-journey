import { useNavigate } from 'react-router-dom'
import { useGlobal } from '../context/GlobalContext'
import en from '../i18next/en.json'
import fr from '../i18next/fr.json'


function ChapterBox(props: { level: number }) {

    const { language } = useGlobal();
    const lang = useGlobal().language === 'en' ? en : fr;
    const chapterKey = `chap${props.level}` as keyof typeof en.main;
    const navigate = useNavigate();

    const gotoChapter = (level: number) => {
        navigate(`/${language}/chapter/${level}`);
    }

  return (
    <div className="chapter">
        <h2>Chapter {props.level}</h2>
        <p>
            {lang.main[chapterKey]}
        </p>
        <button onClick={() => {gotoChapter(props.level)}}>START</button>
    </div>
  )
}

export default ChapterBox
