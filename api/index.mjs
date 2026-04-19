import path from 'node:path';
import { pathToFileURL } from 'node:url';

const serverEntry = pathToFileURL(
  path.join(process.cwd(), 'dist/apps/web/server/server.mjs'),
).href;

const { reqHandler } = await import(serverEntry);

export default reqHandler;
