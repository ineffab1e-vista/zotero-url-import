# Zotero URL Import

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

A Zotero 7 plugin that extends the `zotero://` scheme to import items directly from BibTeX strings or identifiers (ISBN, DOI, arXiv, etc.).

**Disclaimer: This plugin is still in alpha stage and may have unprecedented issues! I'm very new to Zotero plugin development and unsure whether my code may cause issues. All kinds of feedbacks/issue reports are very much appreciated!**

## URL Formats

### BibTeX

```
zotero://import?bibtex=<uri-encoded-bibtex>
```

Accepts one BibTeX entry; encode the string before use.

### Identifiers

```
zotero://import?identifier=<uri-encoded-identifiers>
```

- Same syntax as Zotero’s “Add by Identifier…” (`File` → `Add by Identifier…`).
- Multiple identifiers can be comma-separated; encode the full string.

## Notes

- Works with Zotero 7.
- Encode all parameters to avoid parsing issues.
- Issues and feedback are welcome.
