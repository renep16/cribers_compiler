import Head from 'next/head'
import Image from 'next/image'
import HomeInput from '../components/HomeInput/HomeInput'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Compilador Cribers</title>
        <meta name="description" content="Compilador cribers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Cribers!
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>the code</code>
        </p>


        <HomeInput />
        
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
