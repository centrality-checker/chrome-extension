export interface CentralityData {
  date: number[];
  centrality: number[];
  decline: number[];
}
export function parseCentralityCSV(text: String, size = 0): CentralityData {
  const res = text
    .trim()
    .split("\n")
    .map((row) => row.split(","));

  const series = {
    date: new Array<number>(res.length),
    centrality: new Array<number>(res.length),
    decline: new Array<number>(res.length),
  };

  for (var i = 0; i < res.length; i++) {
    const row = res[i];
    series.date[i] = parseInt(row[0]) * 1000;
    series.centrality[i] = parseInt(row[1]);
    series.decline[i] = row[2] ? parseInt(row[2]) : 0;
  }

  return series;
}
