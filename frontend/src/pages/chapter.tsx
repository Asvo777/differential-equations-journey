import React from 'react'
import { useGlobal } from '../context/GlobalContext.tsx';
import en from '../i18next/en.json';
import fr from '../i18next/fr.json';
import MatchingQuiz from '../components/MatchingQuiz.tsx';

function Chapter(props: { level: number }) {

    const { language } = useGlobal();
    const lang = useGlobal().language === 'en' ? en : fr;
    const chapterKey = `chap${props.level}` as keyof typeof en.main;

  return (
    <div>
        <h1>{language === 'en' ? "Chapter" : "Chapitre"} {props.level}</h1>
        <h2>
        {lang.main[chapterKey]}
        </h2>

        
    </div>
  )
}

export default Chapter
