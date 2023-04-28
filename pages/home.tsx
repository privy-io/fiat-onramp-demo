import axios from "axios";
import { useRouter } from "next/router";
import { useOnramp } from "../hooks/onramp-context";
import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { User, WalletWithMetadata } from "@privy-io/react-auth";
import Head from "next/head";
import { clearDatadogUser } from "../lib/datadog";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

/**
 * Gets a tuple of wallets where the first item in the tuple
 * is privy (embedded) wallets and the second is any other wallet.
 */
function getWallets(
  user: User | null
): [WalletWithMetadata[], WalletWithMetadata[]] {
  if (!user) {
    return [[], []];
  }

  return user.linkedAccounts.reduce(
    (tuple, acct) => {
      if (acct.type === "wallet" && acct.walletClient === "privy") {
        tuple[0].push(acct);
      } else if (acct.type === "wallet") {
        tuple[1].push(acct);
      }

      return tuple;
    },
    [[], []] as [WalletWithMetadata[], WalletWithMetadata[]]
  );
}

function formatAddress(address?: string | null) {
  if (!address) return "";
  const leading = address.slice(0, 5);
  const trailing = address.slice(address.length - 4);
  return `${leading}...${trailing}`;
}

export const DismissableInfo = ({
  message,
  clickHandler,
}: {
  message: string;
  clickHandler?: () => void | null;
}) => {
  return (
    <div className="my-2 flex justify-between rounded-md bg-slate-50 px-4 py-2 text-slate-800">
      <div className="flex flex-row items-center gap-2 text-sm">
        <InformationCircleIcon
          className="h-4 w-4 text-slate-400"
          aria-hidden="true"
        />
        <p>{message}</p>
      </div>
      {clickHandler && (
        <button
          type="button"
          onClick={clickHandler}
          className="ml-6 rounded-md bg-slate-50 px-2 text-xs text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};
export default function LoginPage() {
  const router = useRouter();
  const { fundWallet } = useOnramp();

  // Signature produced using `signMessage`
  const [signature, setSignature] = useState<string | null>(null);

  const {
    ready,
    authenticated,
    user,
    logout,
    getAccessToken,
    createWallet,
    signMessage,
    exportWallet,
  } = usePrivy();

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

  const onCreate = async () => {
    try {
      const wallet = await createWallet();
      console.log(wallet);
    } catch (error) {
      console.error("Create wallet error: ", error);
    }
  };

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

  const [privyWallets] = getWallets(user);

  return (
    <>
      <Head>
        <title>Internal Auth Demo</title>
      </Head>

      <main className="flex min-h-screen flex-col bg-privy-light-blue px-4 py-6 sm:px-20 sm:py-10">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
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
              Wallets
            </p>
            <div className="flex gap-4">
              {privyWallets.length === 0 && (
                <div className="flex flex-col items-start gap-2 py-2">
                  <button
                    className="w-[180px] rounded-md bg-violet-600 py-2 px-4 text-sm text-white transition-all hover:bg-violet-700"
                    onClick={onCreate}
                  >
                    Create privy wallet
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                {privyWallets.map((wallet) => {
                  return (
                    <div
                      key={wallet.address}
                      className="flex w-[180px] flex-col items-center gap-2 rounded-xl bg-white p-2"
                    >
                      <button
                        className="w-full rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 transition-all hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                        disabled
                      >
                        {formatAddress(wallet.address)}
                      </button>
                      <p className="text-sm">Privy wallet</p>
                      <button
                        className="w-full rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                        onClick={onSign}
                      >
                        Sign message
                      </button>
                    </div>
                  );
                })}
              </div>

              {!!user?.wallet && (
                <div className="flex flex-col items-start gap-2 py-2">
                  <button
                    onClick={() => {
                      const address = user?.wallet?.address;
                      if (!address) return;
                      fundWallet?.(address, user?.email?.address);
                    }}
                    className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white transition-all hover:bg-violet-700"
                  >
                    Fund embedded wallet
                  </button>
                </div>
              )}

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
            <p>Some ETH</p>

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
