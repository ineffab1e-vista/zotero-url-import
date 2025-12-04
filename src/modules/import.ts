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
      if (typeof bibtexString === 'string') {
        await createFromBibTeX(decodeURI(bibtexString));
      }

      const identifierString = params.get('identifier');
      if (typeof identifierString === 'string') {
        await handleIdentifier(identifierString);
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

async function handleIdentifier(identifierString: string) {
  try {
    const identifiers = Zotero.Utilities.extractIdentifiers(identifierString);
    identifiers.forEach(async (identifier) => {
      const search = new Zotero.Translate.Search();
      search.setIdentifier(identifier);
      await search.translate({ libraryID: Zotero.Libraries.userLibraryID });
    });
  } catch (e) {
    Zotero.logError(e as Error);
  }
}
