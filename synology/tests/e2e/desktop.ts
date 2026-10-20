import {openDesktop, signIn} from '@synopackageland/cli/e2e';

// Restore the requested account's shared profile and reload DSM. A live desktop
// left by another setup/session may belong to a different account.
export async function desktop(app: any, user = 'admin') {
  await signIn(app, user);
  return openDesktop(app);
}
