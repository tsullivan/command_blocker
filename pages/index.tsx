/*
 Whatcha gonna do when you get outta jail?
 I'm gonna have some lunch

 A Game by Henry
*/

import Head from "next/head";
import { useEffect, useRef } from "react";
import { Renderer, useRenderer } from "../lib/renderer";

export default function Home() {
  const gameContainer = useRef(null);

  useEffect(() => {
    let renderer: Renderer;
    useRenderer(gameContainer.current).then((r) => {
      renderer = r;
    });
    return () => {
      if (renderer) {
        renderer.destroy();
      }
      gameContainer.current.removeChild(gameContainer.current.firstChild);
    };
  });

  return (
    <>
      <Head>
        <title>Command Blocker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div ref={gameContainer}></div>
      </main>

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
  );
}
