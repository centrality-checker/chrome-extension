import ApexCharts from "apexcharts";
import format from "date-fns/format";
import { CentralityData } from "./util/parser";

const CentralityContainerTemplate = `
<div class="centrality-checker">
  <h3 class="c84e15be f5 mt2 pt2 mb0 black-50 _5cfc0900">
    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cube" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239.1 6.3l-208 78c-18.7 7-31.1 25-31.1 45v225.1c0 18.2 10.3 34.8 26.5 42.9l208 104c13.5 6.8 29.4 6.8 42.9 0l208-104c16.3-8.1 26.5-24.8 26.5-42.9V129.3c0-20-12.4-37.9-31.1-44.9l-208-78C262 2.2 250 2.2 239.1 6.3zM256 68.4l192 72v1.1l-192 78-192-78v-1.1l192-72zm32 356V275.5l160-65v133.9l-160 80z"></path></svg><span class="centrality-title">Centrality Ranking</span>
    <span class="is-centrality-decline"></span>
  </h3>
  <div class="_000ae427 flex flex-row-reverse items-end">
    <div class="centrality-chart"></div> 
    <p class="_9ba9a726 f4 tl flex-auto fw6 black-80 ma0 pr2 pb1 centrality-ranking"></p>
  </div>
</div>
`;

export default class CentralityContainer {
  public readonly centralityDOM: Element;
  private chartDOM: Element;
  private rankDOM: HTMLElement;
  private inDeclineDOM: HTMLElement;
  private titleDOM: HTMLElement;
  private chart?: ApexCharts;

  constructor(id: string) {
    const centralityDOM = document.createElement("dev");
    centralityDOM.id = id;
    centralityDOM.innerHTML = CentralityContainerTemplate;

    const rankDOM = centralityDOM.querySelector(".centrality-ranking");
    const inDeclineDOM = centralityDOM.querySelector(".is-centrality-decline");
    const titleDOM = centralityDOM.querySelector(".centrality-title");
    const chartDOM = centralityDOM.querySelector(".centrality-chart");

    if (!rankDOM || !inDeclineDOM || !titleDOM || !chartDOM) {
      throw Error("Invalid centrality container template.");
    }

    this.centralityDOM = centralityDOM;
    this.chartDOM = chartDOM;
    this.rankDOM = rankDOM as HTMLElement;
    this.inDeclineDOM = inDeclineDOM as HTMLElement;
    this.titleDOM = titleDOM as HTMLElement;
  }

  loading() {
    this.rankDOM.innerText = "Loading...";
    this.inDeclineDOM.innerText = "";
  }

  emptyContainer() {
    this.inDeclineDOM.innerText = "";
    this.rankDOM.innerText = "No data!";
    this.centralityDOM.className = "";
    this.chart?.hideSeries("Centrality");
  }

  private showCentralityRanking(num: number) {
    this.rankDOM.innerText = num
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  private showInDecline(months: number) {
    if (!months) {
      this.inDeclineDOM.innerText = "";
      this.centralityDOM.className = "";
      return;
    }

    this.inDeclineDOM.innerText = `(In decline ~${months + 5} months)`;
    this.centralityDOM.className = "in-decline";
  }

  renderData(data: CentralityData) {
    const inDeclineData = data.decline.slice(data.decline.length - 12);

    let color = "#8955ff";

    if (!inDeclineData.length) {
      this.emptyContainer();
      return;
    }

    if (inDeclineData[inDeclineData.length - 1] > 0) {
      color = "#d9534f";
    }

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
          this.titleDOM.innerText = format(
            w.config.labels[dataPointIndex],
            "MMM yyyy"
          );

          this.showCentralityRanking(series[seriesIndex][dataPointIndex]);
          this.showInDecline(inDeclineData[dataPointIndex]);

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
        width: 210,
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
          right: 10,
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

    this.showInDecline(inDeclineData[inDeclineData.length - 1]);
    this.showCentralityRanking(data.centrality[data.centrality.length - 1]);

    const originalRank = this.rankDOM.innerText;
    const originalInDecline = this.inDeclineDOM.innerText;
    this.chartDOM.addEventListener("mouseout", () => {
      this.rankDOM.innerText = originalRank;
      this.inDeclineDOM.innerText = originalInDecline;
      this.centralityDOM.className = originalInDecline ? "in-decline" : "";
      this.titleDOM.innerText = "Centrality Ranking";
    });

    if (!this.chart) {
      this.chart = new ApexCharts(this.chartDOM, options);
      this.chart.render();
    } else {
      this.chart.updateOptions(options);
      this.chart.resetSeries();
    }
  }
}
