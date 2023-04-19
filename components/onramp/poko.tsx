import { XMarkIcon } from "@heroicons/react/24/outline";
import { BaseModal, StyledDialog } from "../base";
import ReactDOM from "react-dom";

export type PokoOnRampProps = {
  userId?: string;
  address?: string;
  active: boolean;
  onClose: () => void;
};

export const PokoOnRamp = ({
  userId,
  address,
  active,
  onClose,
}: PokoOnRampProps) => {
  if (!userId || !address) return null;

  const pokoConfig = {
    fiat: "USD",
    fiatList: "usd",
    crypto: "ETH-ethereum",
    cryptoList: "ETH-ethereum",
    strictMode: "true",
  }

  if (!active) {
    return null;
  }

  return ReactDOM.createPortal(
    <StyledDialog>
      <BaseModal>
        <button
          onClick={() => onClose()}
          className="flex hover:text-blue"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
        <iframe
          src={`https://${process.env.NEXT_PUBLIC_POKO_DOMAIN}?strictMode=${pokoConfig.strictMod}&fiat=${pokoConfig.fiat}&crypto=${pokoConfig.crypto}&receiveWalletAddress=${address}&userId=${userId}&apiKey=${process.env.NEXT_PUBLIC_POKO_API_KEY}&fiatList=${pokoConfig.fiatList}&cryptoList=${pokoConfig.cryptoList}`}
          height="650em"
          width="400em"
          title="Privy Fiat OnRamp"
          allow="accelerometer; autoplay; camera; gyroscope; payment"
        >
          {" "}
        </iframe>
      </BaseModal>
    </StyledDialog>,
    document.body
  );
};
