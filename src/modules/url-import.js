const x = [
  'loadAsChrome',
  false,
  'newChannel',
  function (uri, loadInfo) {
    return new AsyncChannel(
      uri,
      loadInfo,
      function* () {
        try {
          let uriPath = uri.pathQueryRef;
          if (!uriPath) {
            return this._errorChannel('Invalid URL');
          }
          uriPath = uriPath.substr('//attachment/'.length);

          const params = {};
          const router = new Zotero.Router(params);
          router.add('library/items/:itemKey', function () {
            params.libraryID = Zotero.Libraries.userLibraryID;
          });
          router.add('groups/:groupID/items/:itemKey');
          router.run(uriPath);

          if (params.groupID) {
            params.libraryID = Zotero.Groups.getLibraryIDFromGroupID(
              params.groupID,
            );
          }
          if (!params.itemKey) {
            return this._errorChannel('Item key not provided');
          }
          const item = yield Zotero.Items.getByLibraryAndKeyAsync(
            params.libraryID,
            params.itemKey,
          );

          if (!item) {
            return this._errorChannel(`No item found for ${uriPath}`);
          }
          if (!item.isFileAttachment()) {
            return this._errorChannel(
              `Item for ${uriPath} is not a file attachment`,
            );
          }

          let path = yield item.getFilePathAsync();
          if (!path) {
            return this._errorChannel(`${path} not found`);
          }

          const resourcePathParts = uriPath
            .split('/')
            .slice(params.groupID !== undefined ? 4 : 3)
            .filter(Boolean);
          if (resourcePathParts.length) {
            if (item.attachmentReaderType !== 'snapshot') {
              return this._errorChannel(
                `Item for ${uriPath} is not a snapshot attachment -- cannot access resources`,
              );
            }

            try {
              path = PathUtils.join(
                PathUtils.parent(path),
                ...resourcePathParts,
              );
            } catch (e) {
              Zotero.logError(e);
              return this._errorChannel(
                `Resource ${resourcePathParts.join('/')} not found`,
              );
            }
            if (!(yield IOUtils.exists(path))) {
              return this._errorChannel(
                `Resource ${resourcePathParts.join('/')} not found`,
              );
            }
          }

          // Set originalURI so that it seems like we're serving from zotero:// protocol.
          // This is necessary to allow url() links to work from within CSS files.
          // Otherwise they try to link to files on the file:// protocol, which isn't allowed.
          this.originalURI = uri;

          return Zotero.File.pathToFile(path);
        } catch (e) {
          return this._errorChannel(e.message);
        }
      }.bind(this),
    );
  },
  '_errorChannel',
  function (msg) {
    Zotero.logError(msg);
    this.status = Components.results.NS_ERROR_FAILURE;
    this.contentType = 'text/plain';
    return msg;
  },
];

// The type is provided by zotero-types; `ChromeUtils` and `Zotero` are globals.
export function registerURLImportHandler() {
  Zotero.log('Calling function registerURLImportHandler.');
  const { Services } = ChromeUtils.import(
    'resource://gre/modules/Services.jsm',
  );

  const protocol = Services.io.getProtocolHandler('zotero')
    .wrappedJSObject;

  Zotero.log(Object.keys(protocol._extensions['zotero://select']));

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
