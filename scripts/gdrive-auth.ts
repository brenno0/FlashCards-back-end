/**
 * One-time Google Drive setup for STORAGE_DRIVER=gdrive.
 *
 * 1. Google Cloud console: enable "Google Drive API", create an OAuth client of type
 *    "Desktop app", and set the OAuth consent screen to "In production"
 *    (in "Testing" refresh tokens expire after 7 days).
 * 2. Run: GDRIVE_CLIENT_ID=... GDRIVE_CLIENT_SECRET=... npx tsx scripts/gdrive-auth.ts
 * 3. Open the printed URL, approve, and copy the printed env vars into the back-end env.
 *
 * Scope drive.file: the app only sees files it created, so this script also creates the
 * app folder (the folder must be app-created to be visible to the app).
 */
/* eslint-disable no-console */
import { createServer } from 'node:http';

import { auth, drive_v3 } from '@googleapis/drive';

const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
const FOLDER_NAME = 'bflashcards-board-assets';

const clientId = process.env.GDRIVE_CLIENT_ID;
const clientSecret = process.env.GDRIVE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Set GDRIVE_CLIENT_ID and GDRIVE_CLIENT_SECRET first.');
  process.exit(1);
}

const client = new auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
const url = client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive.file'],
});

const server = createServer(async (req, res) => {
  const code = new URL(req.url ?? '/', REDIRECT_URI).searchParams.get('code');
  if (!code) {
    res.writeHead(400).end('Missing code');
    return;
  }

  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error(
        'No refresh token returned; revoke app access and retry.',
      );
    }
    client.setCredentials(tokens);

    const drive = new drive_v3.Drive({ auth: client });
    const { data: folder } = await drive.files.create({
      requestBody: {
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    res.writeHead(200).end('Done. You can close this tab.');
    console.log('\nAdd to the back-end environment:\n');
    console.log('STORAGE_DRIVER=gdrive');
    console.log(`GDRIVE_CLIENT_ID=${clientId}`);
    console.log(`GDRIVE_CLIENT_SECRET=${clientSecret}`);
    console.log(`GDRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GDRIVE_FOLDER_ID=${folder.id}`);
  } catch (error) {
    res.writeHead(500).end('Failed, see terminal.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Open this URL and approve access:\n\n${url}\n`);
});
