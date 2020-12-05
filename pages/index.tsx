import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { useRenderer } from '../lib/use_renderer';

export default function Home() {
  const gameContainer = useRef(null);

  useEffect(() => {
    useRenderer(gameContainer);
  });


  return (
    <div className="container">
      <Head>
        <title>Command Blocker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          COMMAND BLOCKER
        </h1>

        <div ref={gameContainer}></div>

        <p className="description">
          Whatcha gonna do when you get outta jail?
          <br />
          I'm gonna have some lunch.
        </p>
      </main>

      <footer>
        Game by Henry
      </footer>
    </div>
  )
}
