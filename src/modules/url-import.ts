// The type is provided by zotero-types; `ChromeUtils` and `Zotero` are globals.
export function registerURLImportHandler() {
  Zotero.log('Calling function registerURLImportHandler.');
  const { Services } = ChromeUtils.import(
    'resource://gre/modules/Services.jsm',
  );

  const protocol = Services.io.getProtocolHandler('zotero')
    .wrappedJSObject as any;

  Zotero.log(Object.entries(protocol._extensions['zotero://attachment']));

  protocol._extensions['zotero://url-import'] = async (uri: nsIURI) => {
    // Example uri.pathQueryRef: "/bibtex?data=...."
    const [rawPath, rawQuery = ''] = uri.pathQueryRef.split('?');
    const path = rawPath.replace(/^\/+/, ''); // strip leading "/"
    const params = new URLSearchParams(rawQuery);
    Zotero.log(params);

    // try {
    //   switch (path) {
    //     case 'bibtex':
    //       // await handleBibTeX(params);
    //       break;
    //     case 'identifier':
    //       await handleIdentifier(params);
    //       break;
    //     default:
    //       Zotero.debug(`quickadd: unknown subcommand "${path}"`);
    //   }
    // } catch (e) {
    //   Zotero.logError(e);
    //   Zotero.alert(
    //     null,
    //     'QuickAdd URL',
    //     `Error handling URL:\n${(e as Error).message}`,
    //   );
    // }
  };
}

async function handleIdentifier(params: URLSearchParams) {
  const query = params.get('q');
  if (!query) {
    Zotero.alert(null, 'QuickAdd URL', 'Missing ?q= parameter (identifier)');
    return;
  }

  const pane = Zotero.getActiveZoteroPane();

  // PSEUDOCODE: you’ll need to confirm the exact method name/signature
  // in Zotero source. It’s something like:
  //
  await pane.addByIdentifier(query);
  //
  // or a helper object that wraps the identifier workflow.

  // Example pseudo-call:
  // await (pane as any).addByIdentifier(query);
}
