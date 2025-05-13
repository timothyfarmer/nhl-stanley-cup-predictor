// src/preprocessing.ts
export function standardScaler(data: number[][]): { scaled: number[][]; mean: number[]; std: number[] } {
  const n = data.length;
  const nFeatures = data[0].length;
  const mean = new Array(nFeatures).fill(0);
  const std = new Array(nFeatures).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < nFeatures; j++) {
      mean[j] += data[i][j] / n;
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < nFeatures; j++) {
      std[j] += Math.pow(data[i][j] - mean[j], 2);
    }
  }
  for (let j = 0; j < nFeatures; j++) {
    std[j] = Math.sqrt(std[j] / n) || 1;
  }

  const scaled = data.map(row =>
    row.map((value, j) => (value - mean[j]) / std[j])
  );

  return { scaled, mean, std };
}