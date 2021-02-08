import { parseCentralityCSV } from "./util/parser";
import CentralityContainer from "./CentralityContainer";

console.log("[Centrality Checker] Activated!");

function handleErrors(response: Response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

let mounted = false;

const constrainer = new CentralityContainer("embedded-npm-website");

function mountCentralityContainer() {
  if (mounted) {
    mounted = !!document.getElementById(constrainer.centralityDOM.id);
  }

  if (mounted) {
    return;
  }

  const targetNode = document.querySelector('svg[stroke="#8956FF"]')?.parentNode
    ?.parentNode;
  if (!targetNode) {
    console.log("[Centrality Checker] Cannot find the downloads DOM.");
    return;
  }

  console.log("[Centrality Checker] Mounting!");

  mounted = true;
  targetNode.insertBefore(constrainer.centralityDOM, targetNode.nextSibling);
}

function FetchAndEmbedCentrality(pkg_name: string) {
  console.log("[Centrality Checker] Request data for:", pkg_name);

  constrainer.loading();
  mountCentralityContainer();
  fetch(
    `https://raw.githubusercontent.com/centrality-checker/storage/master/npm/${pkg_name}`
  )
    .then(handleErrors)
    .then((res) => res.text())
    .then(parseCentralityCSV)
    .then((data) => constrainer.renderData(data))
    .catch(() => constrainer.emptyContainer());
}

function getPackageName() {
  if (location.pathname.substring(0, 9) !== "/package/") {
    return null;
  }

  return location.pathname.substring(9);
}

let packageName = getPackageName();
if (packageName) {
  FetchAndEmbedCentrality(packageName);
}

const observer = new MutationObserver(() => {
  const newPackageName = getPackageName();
  if (!newPackageName) {
    console.log("[Centrality Checker] Ignore update event: not a package.");
    return;
  }

  mountCentralityContainer();

  if (newPackageName == packageName) {
    console.log("[Centrality Checker] Ignore update event: same package.");
    return;
  }

  packageName = newPackageName;
  FetchAndEmbedCentrality(packageName);
});

observer.observe(document, {
  childList: true,
  subtree: true,
});
