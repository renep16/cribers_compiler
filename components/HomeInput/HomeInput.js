import { useState } from 'react';
import tokens from '../../lib/analizador_lexico';
import SalidaTokens from '../SalidaTokens/SalidaTokens';
import styles from './HomeInput.module.css'

const HomeInput = () => {
  const [code, setCode] = useState("")
  const [errorS, setError] = useState(null)

  const [salida, setSalida] = useState(null)

  const compilar = () => {
    setSalida(null)
    setError(null)
    try {
      setSalida(tokens(code))
    }
    catch (e) {
      setError(e)
    }
  }

  const checkTab = (e) => {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = e.target.selectionStart;
      var end = e.target.selectionEnd;

      // set textarea value to: text before caret + tab + text after caret
      e.target.value = e.target.value.substring(0, start) +
        "\t" + e.target.value.substring(end);

      // put caret at right position again
      e.target.selectionStart =
        e.target.selectionEnd = start + 1;
    }
  }
  return (
    <div className={styles.homeInput}>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={checkTab}
        className={styles.textArea}
      >

      </textarea>

      <button className="button" onClick={compilar}>Compile</button>

      {salida && <SalidaTokens salida={salida} />}

      <div>
        <pre>
          {errorS && errorS}
        </pre>
      </div>
    </div>
  );
}

export default HomeInput;