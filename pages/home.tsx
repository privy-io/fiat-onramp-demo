import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { clearDatadogUser } from "../lib/datadog";
import OnrampModal from "../components/onramp";
import { ethers } from "ethers";

function formatAddress(address?: string | null) {
  if (!address) return "";
  const leading = address.slice(0, 5);
  const trailing = address.slice(address.length - 4);
  return `${leading}...${trailing}`;
}

export default function HomePage() {
  const {
    ready,
    authenticated,
    user,
    logout,
    getAccessToken,
    signMessage,
    sendTransaction,
    exportWallet,
  } = usePrivy();

  const router = useRouter();
  // Signature produced using `signMessage`
  const [signature, setSignature] = useState<string | null>(null);
  // Fiat onramp URL returned from server
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | undefined>(undefined);

  const hasEmbeddedWallet =
    user && user.wallet && user.wallet.walletClient === "privy";

  const updateBalance = async () => {
    if (!user?.wallet?.address) return;
    try {
      const ethersProvider = new ethers.InfuraProvider(
        "goerli",
        process.env.NEXT_PUBLIC_INFURA_API_KEY
      );
      const balanceInWei = await ethersProvider.getBalance(user.wallet.address);
      setBalance(ethers.formatEther(balanceInWei));
    } catch (error) {
      console.error(`Cannot connect to Infura with error: ${error}`);
    }
  };
  updateBalance();

  const fundWallet = async () => {
    // Error if user does not have an embedded wallet
    if (!hasEmbeddedWallet) {
      console.error("Unable to fund wallet.");
      return false;
    }

    // Get onramp URL from server and kick off onramp flow
    try {
      const authToken = await getAccessToken();
      const redirectUrl = window.location.href;
      // This simulates a request to Privy's server
      const onrampResponse = await axios.post(
        "/api/onramp",
        {
          address: user!.wallet!.address,
          email: user?.email?.address,
          redirectUrl: redirectUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setOnrampUrl(onrampResponse.data.url as string);
      // const url = new URL(onrampResponse.data.url as string);
      // url.searchParams.set('redirectURL', window.location.href);
      // setOnrampUrl(url.toString());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (ready && !authenticated) {
      clearDatadogUser();
      router.push("/");
    }
  }, [ready, authenticated, router]);

  async function deleteUser() {
    const authToken = await getAccessToken();
    try {
      await axios.delete("/api/users/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    } catch (error) {
      console.error(error);
    }
    logout();
  }

  const onSign = async () => {
    try {
      const signature = await signMessage("I hereby vote for foobar", {
        title: "You are voting for foobar project",
        description:
          "Foobar project is so great you'll love it. Come on by and give us a vote today. Whooo hooo!",
        buttonText: "Vote for foobar",
      });
      setSignature(signature);
    } catch (error) {
      console.error("Signing error:", error);
    }
  };

  const onSend = async () => {
    try {
      const receipt = await sendTransaction({
        to: "0xA662b98CE3e25102C6A1B5dA5e667D6b25CBd85C",
        chainId: 5,
        value: ethers.parseEther("0.005"),
      });
      console.log("Transaction Receipt", receipt);
    } catch (error) {
      console.error(`Failed to send transaction with error ${error}`);
    }
  };

  return (
    <>
      <Head>
        <title>Fiat Onramp Demo</title>
      </Head>

      <main className="flex min-h-screen flex-col bg-privy-light-blue px-4 py-6 sm:px-20 sm:py-10">
        <OnrampModal onrampUrl={onrampUrl} onClose={() => setOnrampUrl(null)} />
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Fiat Onramp Demo</h1>
              <div className="flex flex-row gap-4">
                <button
                  onClick={deleteUser}
                  className="rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900"
                >
                  Delete my data
                </button>
                <button
                  onClick={logout}
                  className="rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900"
                >
                  Logout
                </button>
              </div>
            </div>
            <p className="mt-6 mb-2 text-sm font-bold uppercase text-gray-600">
              My Embedded Wallet
            </p>
            <div className="flex gap-4">
              <div className="flex w-[180px] flex-col items-center gap-2 rounded-xl bg-white p-2">
                <button
                  className="w-full rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 transition-all hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled
                >
                  {formatAddress(user?.wallet?.address)}
                </button>
                <p className="text-sm">Privy wallet</p>
                <button
                  className="w-full rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                  onClick={onSign}
                >
                  Sign message
                </button>
              </div>
              <div className="flex flex-col items-start gap-2 py-2">
                <button
                  onClick={fundWallet}
                  className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white transition-all hover:bg-violet-700"
                >
                  Fund embedded wallet
                </button>
              </div>
              <div className="flex flex-col items-start gap-2 py-2">
                <button
                  onClick={onSend}
                  className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white transition-all hover:bg-violet-700"
                >
                  Send a transaction
                </button>
              </div>
              <div className="flex flex-col items-start gap-2 py-2">
                <button
                  onClick={exportWallet}
                  className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white transition-all hover:bg-violet-700"
                >
                  Export embedded wallet
                </button>
              </div>

              {signature && (
                <>
                  <p className="mt-6 text-sm font-bold uppercase text-gray-600">
                    Privy wallet signature
                  </p>
                  <textarea
                    value={signature}
                    className="mt-2 w-[200px] max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
                    rows={1}
                    disabled
                  />
                </>
              )}
            </div>

            <p className="mt-6 text-sm font-bold uppercase text-gray-600">
              My balance
            </p>
            <p>{balance}</p>

            <p className="mt-6 text-sm font-bold uppercase text-gray-600">
              User object
            </p>
            <textarea
              value={JSON.stringify(user, null, 2)}
              className="mt-2 max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
              rows={JSON.stringify(user, null, 2).split("\n").length}
              disabled
            />
          </>
        ) : null}
      </main>
    </>
  );
}