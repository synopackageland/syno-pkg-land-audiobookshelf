import {appOpenSmoke} from '@synopackageland/cli/e2e';

// The upstream account link is rendered only after native authentication.
appOpenSmoke({ready: '#appbar a[href^="/audiobookshelf/account"]'});
