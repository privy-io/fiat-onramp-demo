import Portal from '../components/graphics/portal';
import {usePrivy, VERSION} from '@privy-io/react-auth';
import Head from 'next/head';
import {useEffect} from 'react';
import {useRouter} from 'next/router';
import type {PrivyTheme} from '../src/types';

export default function LoginPage({
  themes,
  theme,
  setTheme,
}: {
  themes: Array<PrivyTheme>;
  theme: PrivyTheme;
  setTheme: (theme: PrivyTheme) => void;
}) {
  const router = useRouter();
  const {ready, authenticated, login} = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>

      <div className="absolute top-1 left-1 right-0 flex items-center justify-between px-2 py-2 text-slate-500">
        <span>
          <b>SDK Version</b>: {VERSION}
        </span>
        <select
          value={theme.name}
          onChange={(e) => setTheme(themes.find((theme) => theme.name === e.target.value)!)}
        >
          {themes.map((theme: any) => (
            <option key={theme.name} value={theme.name}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
      <main className="flex min-h-screen min-w-[100vw]">
        <div className="flex flex-1 items-center justify-center bg-privy-light-blue p-6">
          <div>
            <div>
              <Portal style={{maxWidth: '100%', height: 'auto'}} />
            </div>
            <div className="mt-6 flex justify-center text-center">
              <button
                className="rounded-lg bg-violet-600 py-3 px-6 text-white hover:bg-violet-700"
                onClick={login}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
