import { parseCentralityCSV } from "./util/parser";
import { format } from "date-fns";

import ApexCharts from "apexcharts";

function handleErrors(response: Response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

function insertAfter(newNode: HTMLElement, referenceNode: any) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
const downloadsSelector =
  "#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l.order-1-ns.order-0 > div:nth-child(3)";
const centralityDOM: any = document.createElement("dev");
centralityDOM.innerHTML = `
<div id="centrality-checker">
    <h3 class="c84e15be f5 mt2 pt2 mb0 black-50 _5cfc0900">
    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cube" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239.1 6.3l-208 78c-18.7 7-31.1 25-31.1 45v225.1c0 18.2 10.3 34.8 26.5 42.9l208 104c13.5 6.8 29.4 6.8 42.9 0l208-104c16.3-8.1 26.5-24.8 26.5-42.9V129.3c0-20-12.4-37.9-31.1-44.9l-208-78C262 2.2 250 2.2 239.1 6.3zM256 68.4l192 72v1.1l-192 78-192-78v-1.1l192-72zm32 356V275.5l160-65v133.9l-160 80z"></path></svg><span id="centrality-title">Centrality Ranking</span>
    <span id="is-centrality-decline"></span>
    </h3>
    <div class="_000ae427 flex flex-row-reverse items-end">
      <div id="centrality-chart"></div> 
      <p id="centrality-ranking" class="_9ba9a726 f4 tl flex-auto fw6 black-80 ma0 pr2 pb1">
      </p>
    </div>
  </div>
`;

const chartDOM = centralityDOM.querySelector("#centrality-chart");
const rankDOM = centralityDOM.querySelector("#centrality-ranking");
const isDeclineDOM = centralityDOM.querySelector("#is-centrality-decline");
const titleDOM = centralityDOM.querySelector("#centrality-title");
let mounted = false;

function loading() {
  rankDOM.innerText = "Loading...";
  isDeclineDOM.innerText = "";
}

function emptyContainer() {
  chartDOM.innerHTML = "";
  isDeclineDOM.innerText = "";
  rankDOM.innerText = "No data!";
  centralityDOM.className = "";
}

function CentralityContainer(pkg_name: string) {
  console.log("Request centrality:", pkg_name);

  function formatNumber(num: number) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  loading();
  fetch(
    `https://raw.githubusercontent.com/centrality-checker/storage/master/npm/${pkg_name}`
  )
    .then(handleErrors)
    .then((res) => res.text())
    .then(parseCentralityCSV)
    .then((data) => {
      let color = "#8955ff";
      let isDecline = "";
      let centralityClass = "";
      let centrality = "";

      if (!data.decline.length) {
        return emptyContainer();
      }

      if (data.decline[data.decline.length - 1] > 0) {
        color = "#d9534f";
        centralityClass = "in-decline";
        isDecline = ` (In decline ~${
          data.decline[data.decline.length - 1] + 5
        } months)`;
      }

      centrality = formatNumber(data.centrality[data.centrality.length - 1]);

      isDeclineDOM.innerText = isDecline;
      centralityDOM.className = centralityClass;
      rankDOM.innerText = centrality;

      chartDOM.addEventListener("mouseout", function () {
        rankDOM.innerText = centrality;
        isDeclineDOM.innerText = isDecline;
        titleDOM.innerText = "Centrality Ranking";
      });

      var options = {
        markers: {
          size: 0,
          strokeWidth: 0,
          hover: {
            size: 3.5,
            sizeOffset: 0,
            strokeWidth: 0,
          },
        },
        tooltip: {
          custom: ({ seriesIndex, series, dataPointIndex, w }: any) => {
            rankDOM.innerText = formatNumber(
              series[seriesIndex][dataPointIndex]
            );
            titleDOM.innerText = format(
              w.config.labels[dataPointIndex],
              "MMMM yyyy"
            );
            return "";
          },
        },
        plotOptions: {
          area: {
            fillTo: "end",
          },
        },
        colors: [color],
        series: [
          {
            name: "Centrality",
            data: data.centrality.slice(data.centrality.length - 12),
          },
        ],
        fill: {
          opacity: 0.2,
          type: "solid",
        },

        chart: {
          events: {
            dataPointMouseLeave: function (
              event: any,
              chartContext: any,
              config: any
            ) {
              console.log(event, chartContext, config);
            },
          },
          sparkline: {
            enabled: true,
          },
          type: "area",
          height: 40,
          width: 200,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
          animations: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
          width: 3,
        },
        labels: data.date.slice(data.centrality.length - 12),
        grid: {
          padding: {
            top: 5,
            right: 0,
            bottom: 0,
            left: 10,
          },
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: false,
            },
          },
        },
        xaxis: {
          tooltip: {
            enabled: false,
          },
          labels: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          type: "datetime",
          crosshairs: {
            show: true,
            position: "front",
            stroke: {
              color: color,
              width: 2,
              dashArray: 0,
            },
          },
        },
        yaxis: {
          tooltip: {
            enabled: false,
          },
          labels: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          reversed: true,
        },
        legend: {
          show: false,
        },
      };

      const chart = new ApexCharts(chartDOM, options);
      chartDOM.innerHTML = "";
      chart.render();
    })
    .catch(emptyContainer)
    .finally(() => {
      if (mounted) {
        return;
      }

      mounted = true;
      // const downloadsDOM = document.querySelector("#top > div:nth-child(4) > div");
      const downloadsDOM = document.querySelector(downloadsSelector);
      if (!downloadsDOM) {
        console.log("Cannot find the downloads DOM");
        return;
      }

      insertAfter(centralityDOM, downloadsDOM);
    });
}

let pkg_name = location.pathname.substring(9);
CentralityContainer(pkg_name);

const observer = new MutationObserver((event: any) => {
  const new_pkg_name = location.pathname.substring(9);

  mounted = !!document.getElementById("centrality-checker");
  if (!mounted) {
    mounted = true;
    const downloadsDOM = document.querySelector(downloadsSelector);
    insertAfter(centralityDOM, downloadsDOM);
  }

  if (new_pkg_name == pkg_name) {
    console.log("ignore event");
    return;
  }
  pkg_name = new_pkg_name;
  CentralityContainer(pkg_name);
});

observer.observe(document, {
  childList: true,
  subtree: true,
});
