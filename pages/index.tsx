import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { useRenderer } from '../lib/use_renderer';

/*
 A Game by Henry

 Q: Whatcha gonna do when you get outta jail?
 A: I'm gonna have some lunch
*/

export default function Home() {
  const gameContainer = useRef(null);

  useEffect(() => {
    useRenderer(gameContainer);
  });

  return (
    <>
      {}
      <Head>
        <title>Command Blocker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <main>
          <div ref={gameContainer}></div>
        </main>
      </div>

      <style jsx>{`
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  )
}
