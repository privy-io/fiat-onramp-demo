import axios from 'axios';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {usePrivy} from '@privy-io/react-auth';
import type {User, WalletWithMetadata} from '@privy-io/react-auth';
import Head from 'next/head';
import {clearDatadogUser} from '../lib/datadog';
import {InformationCircleIcon} from '@heroicons/react/20/solid';

/**
 * Gets a tuple of wallets where the first item in the tuple
 * is privy (embedded) wallets and the second is any other wallet.
 */
function getWallets(user: User | null): [WalletWithMetadata[], WalletWithMetadata[]] {
  if (!user) {
    return [[], []];
  }

  return user.linkedAccounts.reduce(
    (tuple, acct) => {
      if (acct.type === 'wallet' && acct.walletClient === 'privy') {
        tuple[0].push(acct);
      } else if (acct.type === 'wallet') {
        tuple[1].push(acct);
      }

      return tuple;
    },
    [[], []] as [WalletWithMetadata[], WalletWithMetadata[]],
  );
}

function formatAddress(address?: string | null) {
  if (!address) return '';
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
        <InformationCircleIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
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

  const [signLoading, setSignLoading] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [signError, setSignError] = useState(false);

  // Signature produced using `signMessage`
  const [signature, setSignature] = useState<string | null>(null);

  const {
    ready,
    authenticated,
    user,
    logout,
    linkDiscord,
    linkGithub,
    linkEmail,
    linkGoogle,
    linkPhone,
    linkTwitter,
    linkWallet,
    setActiveWallet,
    unlinkDiscord,
    unlinkGithub,
    unlinkEmail,
    unlinkGoogle,
    unlinkPhone,
    unlinkTwitter,
    unlinkWallet,
    walletConnectors,
    getAccessToken,
    createWallet,
    signMessage,
    exportWallet,
  } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      clearDatadogUser();
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const phone = user?.phone;

  const googleSubject = user?.google?.subject || null;
  const twitterSubject = user?.twitter?.subject || null;
  const discordSubject = user?.discord?.subject || null;
  const githubSubject = user?.github?.subject || null;

  async function deleteUser() {
    const authToken = await getAccessToken();
    try {
      await axios.delete('/api/users/me', {
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
      console.error('Create wallet error: ', error);
    }
  };

  const onSign = async () => {
    try {
      const signature = await signMessage('I hereby vote for foobar', {
        title: 'You are voting for foobar project',
        description:
          "Foobar project is so great you'll love it. Come on by and give us a vote today. Whooo hooo!",
        buttonText: 'Vote for foobar',
      });
      setSignature(signature);
    } catch (error) {
      console.error('Signing error:', error);
    }
  };

  const [privyWallets, wallets] = getWallets(user);

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
            <p className="mt-6 mb-2 text-sm font-bold uppercase text-gray-600">Social</p>
            <div className="flex flex-wrap gap-4">
              {googleSubject ? (
                <button
                  onClick={() => {
                    unlinkGoogle(googleSubject);
                  }}
                  className="rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Google
                </button>
              ) : (
                <button
                  onClick={() => {
                    linkGoogle();
                  }}
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                >
                  Link Google
                </button>
              )}

              {twitterSubject ? (
                <button
                  onClick={() => {
                    unlinkTwitter(twitterSubject);
                  }}
                  className="rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Twitter
                </button>
              ) : (
                <button
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                  onClick={() => {
                    linkTwitter();
                  }}
                >
                  Link Twitter
                </button>
              )}
              {discordSubject ? (
                <button
                  onClick={() => {
                    unlinkDiscord(discordSubject);
                  }}
                  className="rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Discord
                </button>
              ) : (
                <button
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                  onClick={() => {
                    linkDiscord();
                  }}
                >
                  Link Discord
                </button>
              )}
              {githubSubject ? (
                <button
                  onClick={() => {
                    unlinkGithub(githubSubject);
                  }}
                  className="rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Github
                </button>
              ) : (
                <button
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                  onClick={() => {
                    linkGithub();
                  }}
                >
                  Link Github
                </button>
              )}
            </div>
            <p className="mt-6 mb-2 text-sm font-bold uppercase text-gray-600">Passwordless</p>
            <div className="flex flex-wrap gap-4">
              {email ? (
                <button
                  onClick={() => {
                    unlinkEmail(email.address);
                  }}
                  className="rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink email
                </button>
              ) : (
                <button
                  onClick={linkEmail}
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                >
                  Connect email
                </button>
              )}
              {phone ? (
                <button
                  onClick={() => {
                    unlinkPhone(phone.number);
                  }}
                  className="rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink phone
                </button>
              ) : (
                <button
                  onClick={linkPhone}
                  className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                >
                  Connect phone
                </button>
              )}
            </div>
            <p className="mt-6 mb-2 text-sm font-bold uppercase text-gray-600">Wallets</p>
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

              {wallets.map((wallet) => {
                const connector = walletConnectors?.getConnectorByAddress(wallet.address);
                return (
                  <div
                    key={wallet.address}
                    className="flex w-[180px] flex-col items-center gap-2 rounded-xl bg-white p-2"
                  >
                    <button
                      onClick={() => {
                        unlinkWallet(wallet.address);
                      }}
                      className="w-full rounded-md border border-violet-600 px-4 py-2 text-sm text-violet-600 transition-all hover:border-violet-700 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                      disabled={!canRemoveAccount}
                    >
                      Unlink {formatAddress(wallet.address)}
                    </button>
                    {connector ? (
                      <p className="text-sm">
                        {connector.walletBranding.name}{' '}
                        {connector.walletType === 'wallet_connect' ? '(wc)' : ''}
                      </p>
                    ) : (
                      <p className="rounded bg-privy-blueish px-2 py-0 text-sm">Not connected</p>
                    )}
                    {wallet.address === walletConnectors?.activeWalletConnector?.address ? (
                      <p className="mt-2 rounded bg-privy-blueish px-2 py-0 text-sm">active</p>
                    ) : (
                      <button
                        className="w-full rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                        onClick={() => setActiveWallet(wallet.address)}
                      >
                        Make active
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="flex flex-col justify-center gap-2">
                <button
                  onClick={linkWallet}
                  className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white transition-all hover:bg-violet-700"
                >
                  Link a{wallets.length ? 'nother ' : ' '}wallet
                </button>
              </div>
            </div>

            <p className="mt-6 mb-2 text-sm font-bold uppercase text-gray-600">Actions</p>
            <div className="flex flex-col items-start gap-2 py-2">
              <button
                onClick={exportWallet}
                className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white transition-all hover:bg-violet-700"
              >
                Export embedded wallet
              </button>
            </div>
            <div className="flex flex-col items-start gap-2">
              {signLoading ? (
                <p>Signing message...</p>
              ) : (
                <button
                  className="rounded-md border-none bg-violet-600 px-4 py-2 text-sm text-white transition-all hover:bg-violet-700"
                  onClick={() => {
                    setSignError(false);
                    setSignSuccess(false);
                    setSignLoading(true);
                    walletConnectors
                      ?.activeWalletSign(
                        'Signing with active wallet with address: ' +
                          walletConnectors.activeWalletConnector?.address,
                      )
                      .then(() => {
                        setSignSuccess(true);
                        setSignLoading(false);
                      })
                      .catch(() => {
                        setSignError(true);
                        setSignLoading(false);
                      });
                  }}
                >
                  Sign a message using the active wallet (external-only)
                </button>
              )}
              {signSuccess && (
                <DismissableInfo
                  message="Signature was successful!"
                  clickHandler={() => setSignSuccess(false)}
                />
              )}
              {signError && (
                <DismissableInfo
                  message="Signature failed"
                  clickHandler={() => setSignError(false)}
                />
              )}
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

            <p className="mt-6 text-sm font-bold uppercase text-gray-600">Active wallet</p>
            <div className="my-2 flex items-center gap-4">
              <div className="flex flex-col items-center justify-center gap-2 rounded bg-white p-2">
                <p>ConnectorManager: </p>
                <p className="font-mono text-xs">
                  {formatAddress(walletConnectors?.activeWalletConnector?.address)}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded bg-white p-2">
                <p>user.wallet </p>
                <p className="font-mono text-xs">{formatAddress(user?.wallet?.address)}</p>
              </div>
              <p>
                {' '}
                {user?.wallet?.address === walletConnectors?.activeWalletConnector?.address
                  ? "✅ it's a match!"
                  : '🚫 mismatch!'}
              </p>
            </div>

            <p className="mt-6 text-sm font-bold uppercase text-gray-600">User object</p>
            <textarea
              value={JSON.stringify(user, null, 2)}
              className="mt-2 max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
              rows={JSON.stringify(user, null, 2).split('\n').length}
              disabled
            />
          </>
        ) : null}
      </main>
    </>
  );
}
