import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { initializeDatadog, setDatadogUser } from "../lib/datadog";
import { useMemo } from "react";
import React from "react";

const privyLogo =
  "https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy.png";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useMemo(initializeDatadog, []);

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff2"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff2"
          as="font"
          crossOrigin=""
        />

        <link rel="icon" href="/favicon.ico" sizes="any" />

        <title>Fiat Onramp Demo</title>
        <meta name="description" content="Internal auth demo for Privy Auth" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        onSuccess={(user) => {
          setDatadogUser(user);
          router.push("/home");
        }}
        apiUrl="https://auth.staging.privy.io"
        config={{
          appearance: {
            logo: privyLogo
          },
        }}
        createPrivyWalletOnLogin
      >
        <Component
          {...pageProps}
        />
      </PrivyProvider>
    </>
  );
}

export default MyApp;
