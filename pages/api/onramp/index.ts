import type { NextApiRequest, NextApiResponse } from "next";

import { PrivyClient } from "@privy-io/server-auth";
import axios from "axios";

export type APIError = {
  error: string;
  cause?: string;
};

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PRIVY_AUTH_URL_OVERRIDE = process.env.NEXT_PUBLIC_PRIVY_AUTH_URL;
const SARDINE_AUTH_URL = process.env.SARDINE_AUTH_URL as string;
const SARDINE_BASE_URL = process.env.SARDINE_BASE_URL as string;
const SARDINE_CLIENT_ID = process.env.SARDINE_CLIENT_ID as string;
const SARDINE_CLIENT_SECRET = process.env.SARDINE_CLIENT_SECRET as string;

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

  // (1) Authenticate user in your server
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

  // (2) Obtain Sardine client token
  let sardineToken;
  try {
    const sardineResponse = await axios.post(
      SARDINE_AUTH_URL,
      {},
      {
        headers: {
          Authorization: `Basic ${btoa(
            `${SARDINE_CLIENT_ID}:${SARDINE_CLIENT_SECRET}`
          )}`,
        },
      }
    );
    sardineToken = sardineResponse.data.clientToken;
  } catch {}
  if (typeof sardineToken !== "string") {
    return res
      .status(500)
      .json({ error: "Unable to authenticate with fiat on-ramp provider." });
  }

  // (3) Using the client token and information about the user, construct onramp URL
  const { address } = req.body;
  if (typeof address !== "string") {
    return res.status(412).json({ error: "Invalid wallet address." });
  }
  const onrampUrl = new URL(SARDINE_BASE_URL);
  onrampUrl.searchParams.set("client_token", sardineToken); // (Required) Add the Sardine client token
  onrampUrl.searchParams.set("address", address); // (Optional) Pre-fill the user's wallet address
  onrampUrl.searchParams.set("fixed_asset_type", "ETH"); // (Optional) Pre-fill the currency the user needs to buy

  // (4) Return onramp URL to client
  return res.status(200).json({ url: onrampUrl.toString() });
}
