import styles from './SalidaTokens.module.css'

const SalidaTokens = ({salida}) => {
  return ( 
    <div>
      <h4>Tokens</h4>
      {
        salida.map(item=>
          <div className={styles.salida}>
            <ul>
              <li><b>Type:</b> {item.type}</li>
              <li><b>Value:</b> {item.value}</li>
              <li><b>From:</b> {item.from}</li>
              <li><b>To:</b> {item.to}</li>
            </ul>
          </div>
        )
      }
    </div>
   );
}
 
export default SalidaTokens;