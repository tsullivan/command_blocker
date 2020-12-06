import Head from "next/head";
import { useEffect, useRef } from "react";
import { renderFactory } from "../lib/renderer";

/*
 A Game by Henry

 Q: Whatcha gonna do when you get outta jail?
 A: I'm gonna have some lunch
*/

export default function Home() {
  const gameContainer = useRef(null);

  useEffect(() => {
    Promise.all([
      import("three/examples/jsm/utils/BufferGeometryUtils"),
      import("three/examples/jsm/controls/FirstPersonControls"),
      import("three/examples/jsm/math/ImprovedNoise"),
    ]).then(
      ([
        { BufferGeometryUtils },
        { FirstPersonControls },
        { ImprovedNoise },
      ]) => {
        const RenderProvider = renderFactory(
          BufferGeometryUtils,
          FirstPersonControls,
          ImprovedNoise
        );
        const r = new RenderProvider(gameContainer);
        r.useRenderer();
      }
    );
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
  );
}
