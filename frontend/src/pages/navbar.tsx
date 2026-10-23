import { useGlobal } from '../context/GlobalContext';

function LanguageSwitcher() {
  const { language, setLanguage } = useGlobal();

  return (
    <div>
      <p>Current Language: {language}</p>
      <button onClick={() => setLanguage('fr')}>Switch to French</button>
    </div>
  );
}

export default LanguageSwitcher;