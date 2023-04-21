import { usePrivy } from "@privy-io/react-auth";
import { createContext, useContext, useState } from "react";
import axios from "axios";
import OnRampModal from "../components/onramp";

type ChildrenProps = {
  children: React.ReactNode;
};

const PrivyOnrampContext = createContext<{
  fundWallet?: (address: string, email?: string | null) => Promise<boolean>;
}>({});

export const PrivyOnrampProvider = ({
  children,
}: ChildrenProps): JSX.Element => {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

  const getOnrampUrl = async (address: string, email?: string | null) => {
    try {
      const authToken = await getAccessToken();
      // This simulates a request to Privy's server
      const onrampResponse = await axios.post(
        "/api/onramp",
        {
          address: address,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return onrampResponse.data.url as string;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const fundWallet = async (address: string, email?: string | null) => {
    // TODO: Better error handling here.
    if (!(ready && authenticated) || !address.length) {
      console.error("Unable to fund wallet.");
      return false;
    }

    // TODO: Better error handling here.
    if (
      !user?.linkedAccounts.find(
        (account) => account.type === "wallet" && account.address === address
      )
    ) {
      console.error("Unable to fund wallet that has not been linked to user.");
      return false;
    }

    const url = await getOnrampUrl(address, email);
    if (url) setOnrampUrl(url);
    return true;
  };

  const ctx = {
    fundWallet: fundWallet,
  };

  return (
    <PrivyOnrampContext.Provider value={ctx}>
      <OnRampModal onRampUrl={onrampUrl} onClose={() => setOnrampUrl(null)} />
      {children}
    </PrivyOnrampContext.Provider>
  );
};

export const useOnramp = () => useContext(PrivyOnrampContext);
