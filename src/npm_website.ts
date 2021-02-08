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

function getPackagePage() {
  if (location.pathname.substring(0, 9) !== "/package/") {
    return null;
  }

  return location.pathname.substring(9);
}

let pkg_name = getPackagePage();
if (pkg_name) {
  FetchAndEmbedCentrality(pkg_name);
}

const observer = new MutationObserver(() => {
  const new_pkg_name = getPackagePage();
  if (!new_pkg_name) {
    console.log("[Centrality Checker] Ignore update event: not a package.");
    return;
  }

  mountCentralityContainer();

  if (new_pkg_name == pkg_name) {
    console.log("[Centrality Checker] Ignore update event: same package.");
    return;
  }

  pkg_name = new_pkg_name;
  FetchAndEmbedCentrality(pkg_name);
});

observer.observe(document, {
  childList: true,
  subtree: true,
});
