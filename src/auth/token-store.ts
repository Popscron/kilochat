import { File, Paths } from 'expo-file-system';

const FILE_NAME = 'session-token.txt';

function tokenFile() {
  return new File(Paths.document, FILE_NAME);
}

export async function readStoredToken(): Promise<string | null> {
  try {
    const file = tokenFile();
    if (!file.exists) return null;
    const value = (await file.text()).trim();
    return value || null;
  } catch {
    return null;
  }
}

export async function writeStoredToken(token: string | null) {
  try {
    const file = tokenFile();
    if (!token) {
      if (file.exists) file.delete();
      return;
    }
    if (!file.exists) file.create();
    file.write(token);
  } catch {
    // Session still works for this launch.
  }
}
