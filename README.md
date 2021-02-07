# Centrality Checker (Chrome Extension)

<p align="center"><img src="resources/logo_128.png" width="128"></p>

This extension embeds the centrality information about _npm_ packages when you browse a package on [npmjs.com](https://www.npmjs.com/).

## Installation

You can install the extension from **Chrome Web Store**: [Centrality Checker](https://chrome.google.com/webstore/detail/centrality-checker/bmpafkghbmojppjoeienibieljacdoaj).

## Privacy

The extension **does not connect to our servers**; we store the centrality data in a [GitHub repository](https://github.com/centrality-checker/storage), and the extension requests data from there.

## Screen Shot

![Screen Shot](resources/screenshot_2021-02-04.png)

## Build From Source Code

You first need to clone the repository locally:

```sh
git clone https://github.com/centrality-checker/chrome-extension.git
```

Then, install the dependencies:

```sh
npm install
```

To build for development environment and automatically update when you modify the source code:

```sh
npm run watch
```

To build for production:

```sh
npm run build
```

The `watch` command requires installing [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) to reload the unpacked extension automatically after source code modifications.

The build result always will be in `./dist`.
