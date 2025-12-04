export function registerURLImportHandler() {
  const protocol = Services.io.getProtocolHandler('zotero')
    .wrappedJSObject as any;

  protocol._extensions['zotero://import'] = {
    noContent: true,
    newChannel(uri: nsIURI) {
      this.doAction(uri);
    },
    async doAction(uri: nsIURI) {
      const [_, rawQuery = ''] = uri.pathQueryRef.split('?');
      const params = new URLSearchParams(rawQuery);

      const bibtexString = params.get('bibtex');
      Zotero.log(bibtexString);
      if (typeof bibtexString === 'string') {
        await createFromBibTeX(decodeURI(bibtexString));
      }
      const identifer = params.get('identifier');
      if (typeof identifer === 'string') {
        // NOP
      }
    },
  };
}

async function getAllTranslators() {
  return await Zotero.Translators.getAll();
}

async function createFromBibTeX(bibtexString: string) {
  try {
    const bibtexTranslator = (await getAllTranslators()).find(
      (t: any) => t.label === 'BibTeX',
    );
    const translate = new Zotero.Translate.Import();
    translate.setTranslator(bibtexTranslator);
    translate.setString(bibtexString);
    await translate.translate({ libraryID: Zotero.Libraries.userLibraryID });
  } catch (e) {
    Zotero.logError(e as Error);
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
