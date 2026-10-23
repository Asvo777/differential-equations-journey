import React from 'react'
import { useGlobal } from '../context/GlobalContext.tsx';
import { en } from '../i18next/en.tsx';
import { fr } from '../i18next/fr.json';

function chapter(props: { level: number }) {

    const { language } = useGlobal();

  return (
    <div>
        <h1>{language === 'en' ? "Chapter" : "Chapitre"} {props.level}</h1>
        <h2>{language === 'en' ? en.main.chap[props.level] : fr.main.chap[props.level]}</h2>
    </div>
  )
}

export default chapter
