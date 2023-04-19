import styled from "styled-components";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import type { DetailedHTMLProps, DialogHTMLAttributes } from "react";
import { useEffect, useRef } from "react";

export const BaseModal = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  width: 450px;
  height: auto;
  background: var(--privy-color-background);
  box-shadow: 0px 8px 36px rgba(55, 65, 81, 0.15);
  border-radius: 24px;
  padding: 24px;

  &&[data-height="full"] {
    height: 620px;
  }

  &&[data-height="medium"] {
    min-height: 480px;
  }

  /* Mobile */
  @media (max-width: 440px) {
    &&& {
      border-radius: 24px 24px 0 0;
      height: auto;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      /* Same as above, but move y offset to 0 to help differentiate top from
    white backgrounds on mobile. */
      box-shadow: 0px 0px 36px rgba(55, 65, 81, 0.15);
      /* Always override on mobile if min-height is set */
      min-height: 0;
    }
  }
`;

const Dialog = ({
  children,
  ...props
}: DetailedHTMLProps<
  DialogHTMLAttributes<HTMLDialogElement>,
  HTMLDialogElement
>) => {
  const ref = useRef(null);

  // From an accessibility POV, inert prevents other forms on the page from being
  // focused. We do a best-effort pass to minimize this (create-react-app/next),
  // but it's not perfect or comprehensive.
  useEffect(() => {
    (document?.activeElement as any)?.blur();
    const root =
      document?.getElementById("root") || document?.getElementById("__next");
    if (!root) return;

    root.setAttribute("inert", "true");
    disableBodyScroll((ref as any)?.current);

    return () => {
      const root =
        document?.getElementById("root") || document?.getElementById("__next");
      if (!root) return;

      root.removeAttribute("inert");
      clearAllBodyScrollLocks();
    };
  }, [props.open, props.onClose]);

  return (
    <dialog open role="dialog" {...props} ref={ref}>
      {children}
    </dialog>
  );
};

export const StyledDialog = styled(Dialog)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  padding: 0;
  border: 0;
  z-index: 999999;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
`;
