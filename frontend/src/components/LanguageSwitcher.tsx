import { useGlobal } from '../context/GlobalContext';
import { useNavigate, useParams } from 'react-router-dom';

function LanguageSwitcher() {
  const { language, setLanguage } = useGlobal();
  const navigate = useNavigate();
  const { level } = useParams<{ level?: string }>();

  const switchLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    navigate(level
      ? `/${nextLanguage}/chapter/${level}`
      : `/${nextLanguage}/`);
  };

  return (
    <div>
      <button onClick={() => switchLanguage(language === 'en' ? 'fr' : 'en')}>
        Switch to {language === 'en' ? 'French' : 'English'}
      </button>
    </div>
  );
}

export default LanguageSwitcher;