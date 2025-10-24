import { OAuth2Client } from "google-auth-library";
import config from "../config";

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload; // contains email, sub (id), name, picture etc.
}
