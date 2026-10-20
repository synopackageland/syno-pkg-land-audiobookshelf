import {test} from '@e2e-dev/web';
import {expect} from 'e2e';
import {openApp,dsmPage,registerDsmSecrets} from '@synopackageland/cli/e2e';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';

test('native Package Center remove-data choice reports the exact retained Audiobookshelf volume',
  {session:'admin',timeout:600_000}, async ({app,browser}) => {
    if (process.env.ABS_E2E_REMOVE_DATA !== '1') {
      test.skip('Run only after lifecycle checks on the owned disposable install');
      return;
    }
    const pc=await openApp(app,'SYNO.SDS.PkgManApp.Instance',120_000,browser);
    const page=dsmPage();await registerDsmSecrets(page);
    await pc.locator('.x-tree-node-text').filter({hasText:/^(Installed|已安裝)$/}).click();
    const card=pc.locator('[data-id="SynoPkgAudiobookshelf"]');
    await card.waitFor({timeout:60_000});
    await card.locator('.syno-pkglist-title').click();
    try {
      await pc.getByRole('button',{name:/^(Uninstall|解除安裝)$/}).click();
      const wizard=page.locator('.x-window').filter({hasText:'synopkgaudiobookshelf_data'}).last();
      expect(await wizard.innerText()).toContain('synopkgaudiobookshelf_data');
      expect(await wizard.innerText()).toMatch(/Container data volumes are kept, even when you select delete-data: synopkgaudiobookshelf_data|即使勾選刪除資料，容器資料(?:卷仍|磁碟區)會保留：synopkgaudiobookshelf_data/);
      const checkbox=wizard.locator('input[type=checkbox]:visible');
      await checkbox.focus();
      if (!await checkbox.isChecked()) await checkbox.press('Space');
      expect(await checkbox.count()).toBe(1);
      expect(await checkbox.isChecked()).toBe(true);
      await page.screenshot({path:join(process.env.DSM_E2E_OUTPUT_DIR!,'uninstall-delete-selected.png')});
      await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!,'uninstall-choice.json'),JSON.stringify({package:'SynoPkgAudiobookshelf',native_ui:true,remove_data_checked:true,retained_volume:'synopkgaudiobookshelf_data'})+'\n',{mode:0o600});
      await wizard.getByRole('button',{name:/^(Uninstall|解除安裝)$/}).click();
      // DSM shows the SDK's successful retained-volume message before finishing.
      await page.getByText(/COMPOSE_DATA_RETAINED/).waitFor({timeout:120_000});
      await page.getByRole('button',{name:/^(OK|確定|確認)$/}).click();
      await wizard.waitFor({state:'hidden',timeout:120_000});
      // Verify native package/volume state separately with the authorized operator.
      // The checked wizard is UI evidence; it cannot establish filesystem erasure.
    } finally {
      await page.screenshot({path:join(process.env.DSM_E2E_OUTPUT_DIR!,'uninstall-final.png')}).catch(()=>{});
      await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!,'uninstall-final.txt'),await page.locator('body').innerText(),{mode:0o600}).catch(()=>{});
    }
});
