import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyOnrampProvider } from "../hooks/onramp-context";
import { useRouter } from "next/router";
import { initializeDatadog, setDatadogUser } from "../lib/datadog";
import { useMemo } from "react";
import React from "react";
import type { PrivyTheme } from "../src/types";
import useLocalStorage from "../src/useLocalStorage";
import useDarkMode from "../src/useMedia";

const privyLogo =
  "https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy.png";
const privyLogoDark =
  "https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy-dark.png";

const themes: Array<PrivyTheme> = [
  {
    logo: privyLogo,
    name: "Privy Light (default)",
  },
  {
    theme: "dark",
    logo: privyLogoDark,
    name: "Privy Dark",
  },
  {
    name: "System",
    logo: privyLogoDark,
  },
  {
    theme: "#13152F",
    accentColor: "#673FD7",
    logo: privyLogoDark,
    name: "Linear",
  },
  {
    theme: "#FCF7EE",
    accentColor: "#38CCCD",
    logo: privyLogo,
    name: "Cream",
  },
  {
    theme: "#425047",
    accentColor: "#A7C080",
    logo: privyLogoDark,
    name: "Forest",
  },
];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [theme, setTheme] = useLocalStorage(
    "privy-auth-demo:theme",
    themes[0]!
  );
  const darkMode = useDarkMode();
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

        <title>Privy Auth Demo</title>
        <meta name="description" content="Internal auth demo for Privy Auth" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        onSuccess={(user) => {
          setDatadogUser(user);
          router.push("/dashboard");
        }}
        config={{
          appearance: {
            theme:
              theme.name === "System"
                ? darkMode
                  ? "dark"
                  : "light"
                : theme.theme,
            accentColor: theme.accentColor,
            logo:
              theme.name === "System"
                ? darkMode
                  ? privyLogoDark
                  : privyLogo
                : theme.logo,
          },
        }}
        createPrivyWalletOnLogin
      >
        <PrivyOnrampProvider>
          <Component
            {...pageProps}
            themes={themes}
            theme={theme}
            setTheme={setTheme}
          />
        </PrivyOnrampProvider>
      </PrivyProvider>
    </>
  );
}

export default MyApp;
