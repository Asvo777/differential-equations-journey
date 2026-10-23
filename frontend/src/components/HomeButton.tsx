import React from 'react'
import { useGlobal } from '../context/GlobalContext';
import { useNavigate, useParams } from 'react-router-dom';


function HomeButton() {
    const { language } = useGlobal();
    const navigate = useNavigate();


  return (
    
    <div>
      <button onClick={() => navigate(`/${language}/`)}>
        Home
      </button>
    </div>

  )
}

export default HomeButton
