import { useState } from 'react';
import tokens from '../../lib/analizador_lexico';
import make_parse from '../../lib/parser';
import { compiler, parser } from '../../lib/tiny-compiler';
import SalidaTokens from '../SalidaTokens/SalidaTokens';
import styles from './HomeInput.module.css'

const HomeInput = () => {
  const [code, setCode] = useState("")
  const [errorS, setError] = useState(null)

  const [salida, setSalida] = useState(null)
  const [salidaTree, setSalidaTree] = useState(null)

  const [salidaFinal, setFinal] = useState(null)

  const compilar = (valor) => {

    // if (!(new Boolean(valor))) return
    setSalida(null)
    setError(null)

    var string, tree;
    try {
      const value = valor || code
      const tokens1 = tokens(value + "\n");
      setSalida(tokens1)
      const tree = parser(tokens1)
      console.log(tree)
      string = JSON.stringify(tree, ['body', 'type', 'params', "name", "value"], 2)


      const sal = compiler(tokens1)

      setFinal(sal)
    }
    catch (e) {
      console.log(e)
      setFinal(null)

      setError(e.message || e)
      string = ""

    }
    console.log(string)
    const html = string.replace(/&/g, '&amp;').replace(/[<]/g, '&lt;');

    setSalidaTree(html)

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
        onChange={(e) => { setCode(e.target.value); }}
        onKeyDown={checkTab}
        onKeyUp={(e) => compilar(e.target.value)}
        className={styles.textArea}
        placeholder={`pasos 10
girar 45
pasos 5
saltar`}
      >

      </textarea>

      <button className="button" onClick={() => compilar(code)}>Compile</button>
      <div className={styles.homeResult}>
        {salida && !errorS && <SalidaTokens salida={salida} />}
        {salidaTree && !errorS &&

          <div>
            <h4>Arbol de parsing</h4>
            <pre>
              {salidaTree}
            </pre>
          </div>
        }
      </div>
      {errorS && errorS}

      {!errorS && salidaFinal && <div>
        <h2>Compilado</h2>
        <pre>
          {salidaFinal}
        </pre>
      </div>}
    </div>
  );
}

export default HomeInput;