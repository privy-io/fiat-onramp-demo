import type { NextApiRequest, NextApiResponse } from "next";

import { PrivyClient } from "@privy-io/server-auth";
import crypto from "crypto";

export type APIError = {
  error: string;
  cause?: string;
};

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PRIVY_AUTH_URL_OVERRIDE = process.env.NEXT_PUBLIC_PRIVY_AUTH_URL;
const MOONPAY_BASE_URL = process.env.MOONPAY_BASE_URL;
const MOONPAY_SECRET_KEY = crypto.createSecretKey(
  process.env.MOONPAY_SECRET_KEY as string,
  "utf-8"
);
const client = new PrivyClient(
  PRIVY_APP_ID as string,
  PRIVY_APP_SECRET as string,
  {
    apiURL: PRIVY_AUTH_URL_OVERRIDE,
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | APIError>
) {
  if (req.method !== "POST") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // Authenticate user
  const header = req.headers.authorization;
  if (typeof header !== "string") {
    return res.status(401).json({ error: "Missing auth token." });
  }
  const authToken = header.replace(/^Bearer /, "");

  try {
    await client.verifyAuthToken(authToken);
  } catch {
    return res.status(401).json({ error: "Invalid auth token." });
  }

  // Construct onRampUrl
  const { address, email } = req.body;
  if (typeof address !== "string") {
    return res.status(412).json({ error: "Invalid wallet address." });
  }

  let onRampUrl = MOONPAY_BASE_URL as string;
  // If email is specified, auto-fill it in the URL
  if (typeof email === "string")
    onRampUrl = `${onRampUrl}&email=${encodeURIComponent(email)}`;
  // Specify the token to purchase (optional)
  onRampUrl = `${onRampUrl}&currencyCode=eth`;
  // Specify the wallet to fund (optional)
  onRampUrl = `${onRampUrl}&walletAddress=${encodeURIComponent(address)}`;
  // Specify the theme (optional)
  onRampUrl = `${onRampUrl}&theme=light`;

  const urlSignature = crypto
    .createHmac("sha256", MOONPAY_SECRET_KEY)
    .update(new URL(onRampUrl).search)
    .digest("base64");
  7;
  const onRampUrlWithSignature = `${onRampUrl}&signature=${encodeURIComponent(
    urlSignature
  )}`;
  return res.status(200).json({ url: onRampUrlWithSignature });
}
