// The type is provided by zotero-types; `ChromeUtils` and `Zotero` are globals.
export function registerURLImportHandler() {
  const protocol = Services.io.getProtocolHandler('zotero')
    .wrappedJSObject as any;

  protocol._extensions['zotero://import'] = {
    noContent: true,
    newChannel(uri: nsIURI) {
      this.doAction(uri);
    },
    async doAction(uri: nsIURI) {
      // Zotero.log(uri);
      const [_, rawQuery = ''] = uri.pathQueryRef.split('?');
      // const path = rawPath.replace(/^\/+/, '');
      const params = new URLSearchParams(rawQuery);
      // Zotero.log(params);

      const bibtexString = params.get('bibtex');
      if (typeof bibtexString === 'string') {
        const decodedString = decodeURI(bibtexString);
        // Zotero.log(decodedString);
        await createFromBibTeX(decodeURI(bibtexString));
      }
      const identifer = params.get('identifier');
      if (typeof identifer === 'string') {
        // NOP
      }
    },
  };
}

async function createFromBibTeX(bibtexString: string) {
  const translate = new Zotero.Translate.Import();
  translate.setString(bibtexString);

  // Use the BibTeX translator (GUID for standard BibTeX translator)
  const translators = await Zotero.Translate.getTranslators(
    Zotero.Translate.getStandardTranslatorDirectory(),
    null,
  );
  const bibtexTranslator = translators.find((t) => t.label === 'BibTeX');

  if (bibtexTranslator) {
    translate.setTranslator(bibtexTranslator);
    await translate.translate({ libraryID: Zotero.Libraries.userLibraryID });
    Zotero.debug('Zotero URL Expander: Created item from BibTeX');
  } else {
    Zotero.debug('Zotero URL Expander: BibTeX translator not found');
  }
}

// async function handleIdentifier(params: URLSearchParams) {
//   const query = params.get('q');
//   if (!query) {
//     Zotero.alert(null, 'QuickAdd URL', 'Missing ?q= parameter (identifier)');
//     return;
//   }

//   const pane = Zotero.getActiveZoteroPane();

//   // PSEUDOCODE: you’ll need to confirm the exact method name/signature
//   // in Zotero source. It’s something like:
//   //
//   await pane.addByIdentifier(query);
//   //
//   // or a helper object that wraps the identifier workflow.

//   // Example pseudo-call:
//   // await (pane as any).addByIdentifier(query);
// }
