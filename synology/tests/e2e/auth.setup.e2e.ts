import { dsmLoginSetup } from '@synopackageland/cli/e2e';
dsmLoginSetup({session: 'admin', user: 'admin', timeout:240_000});
dsmLoginSetup({session: 'nonadmin', user: 'ordinary', timeout:240_000});
