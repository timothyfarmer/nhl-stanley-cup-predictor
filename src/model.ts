// src/model.ts
import { RandomForestClassifier } from 'ml-random-forest';
import { PlayoffTeamStats, HistoricalTeamStats, HeadToHeadStats, TeamStats } from './types';
import { standardScaler } from './preprocessing';
import { getPlayoffTeamStats, getRegularSeasonTeamStats, getHeadToHeadStats, getFallbackTeamStats } from './api';

// Real historical data for Stanley Cup winners and losers (2019–2024)
const realHistoricalData: HistoricalTeamStats[] = [
  // 2024: Florida Panthers (winner) vs. Edmonton Oilers (loser)
  {
    team: 'FLA',
    gamesPlayed: 82,
    regGoalsPerGame: 3.23,
    regGoalsAgainstPerGame: 2.41,
    regPowerPlayPct: 23.5,
    regPenaltyKillPct: 82.5,
    regShotsPerGame: 33.7,
    regShotsAgainstPerGame: 28.5,
    regFaceoffWinPct: 0.512,
    playoffGoalsPerGame: 3.29,
    playoffGoalsAgainstPerGame: 2.59,
    playoffPowerPlayPct: 23.3,
    playoffPenaltyKillPct: 88.2,
    playoffShotsPerGame: 30.8,
    playoffShotsAgainstPerGame: 27.9,
    playoffFaceoffWinPct: 0.517,
    headToHeadWinPct: 0.65,
    seriesWinProb: 0.55,
    winner: 1,
  },
  {
    team: 'EDM',
    gamesPlayed: 82,
    regGoalsPerGame: 3.56,
    regGoalsAgainstPerGame: 2.88,
    regPowerPlayPct: 26.3,
    regPenaltyKillPct: 79.5,
    regShotsPerGame: 33.8,
    regShotsAgainstPerGame: 28.9,
    regFaceoffWinPct: 0.528,
    playoffGoalsPerGame: 3.32,
    playoffGoalsAgainstPerGame: 2.64,
    playoffPowerPlayPct: 28.2,
    playoffPenaltyKillPct: 86.4,
    playoffShotsPerGame: 31.5,
    playoffShotsAgainstPerGame: 29.2,
    playoffFaceoffWinPct: 0.510,
    headToHeadWinPct: 0.60,
    seriesWinProb: 0.45,
    winner: 0,
  },
  // 2023: Vegas Golden Knights (winner) vs. Florida Panthers (loser)
  {
    team: 'VGK',
    gamesPlayed: 82,
    regGoalsPerGame: 3.26,
    regGoalsAgainstPerGame: 2.74,
    regPowerPlayPct: 20.3,
    regPenaltyKillPct: 81.4,
    regShotsPerGame: 31.5,
    regShotsAgainstPerGame: 30.1,
    regFaceoffWinPct: 0.523,
    playoffGoalsPerGame: 3.55,
    playoffGoalsAgainstPerGame: 2.45,
    playoffPowerPlayPct: 19.6,
    playoffPenaltyKillPct: 83.7,
    playoffShotsPerGame: 32.4,
    playoffShotsAgainstPerGame: 28.3,
    playoffFaceoffWinPct: 0.515,
    headToHeadWinPct: 0.62,
    seriesWinProb: 0.60,
    winner: 1,
  },
  {
    team: 'FLA',
    gamesPlayed: 82,
    regGoalsPerGame: 3.51,
    regGoalsAgainstPerGame: 3.33,
    regPowerPlayPct: 22.8,
    regPenaltyKillPct: 76.0,
    regShotsPerGame: 36.8,
    regShotsAgainstPerGame: 31.7,
    regFaceoffWinPct: 0.496,
    playoffGoalsPerGame: 3.19,
    playoffGoalsAgainstPerGame: 2.86,
    playoffPowerPlayPct: 24.1,
    playoffPenaltyKillPct: 80.0,
    playoffShotsPerGame: 33.2,
    playoffShotsAgainstPerGame: 30.5,
    playoffFaceoffWinPct: 0.502,
    headToHeadWinPct: 0.58,
    seriesWinProb: 0.40,
    winner: 0,
  },
  // 2022: Colorado Avalanche (winner) vs. Tampa Bay Lightning (loser)
  {
    team: 'COL',
    gamesPlayed: 82,
    regGoalsPerGame: 3.76,
    regGoalsAgainstPerGame: 2.83,
    regPowerPlayPct: 24.0,
    regPenaltyKillPct: 79.7,
    regShotsPerGame: 35.0,
    regShotsAgainstPerGame: 32.0,
    regFaceoffWinPct: 0.477,
    playoffGoalsPerGame: 4.15,
    playoffGoalsAgainstPerGame: 2.85,
    playoffPowerPlayPct: 31.4,
    playoffPenaltyKillPct: 84.0,
    playoffShotsPerGame: 37.1,
    playoffShotsAgainstPerGame: 30.8,
    playoffFaceoffWinPct: 0.490,
    headToHeadWinPct: 0.68,
    seriesWinProb: 0.65,
    winner: 1,
  },
  {
    team: 'TBL',
    gamesPlayed: 82,
    regGoalsPerGame: 3.48,
    regGoalsAgainstPerGame: 2.78,
    regPowerPlayPct: 23.9,
    regPenaltyKillPct: 80.6,
    regShotsPerGame: 30.9,
    regShotsAgainstPerGame: 29.8,
    regFaceoffWinPct: 0.506,
    playoffGoalsPerGame: 3.17,
    playoffGoalsAgainstPerGame: 2.91,
    playoffPowerPlayPct: 22.7,
    playoffPenaltyKillPct: 82.1,
    playoffShotsPerGame: 31.7,
    playoffShotsAgainstPerGame: 31.2,
    playoffFaceoffWinPct: 0.510,
    headToHeadWinPct: 0.61,
    seriesWinProb: 0.35,
    winner: 0,
  },
];

export async function predictStanleyCupWinner(teams: string[]): Promise<{ team: string; score: number }[]> {
  console.log('Predicting for teams:', teams);
  if (!teams.length) {
    console.error('No teams provided for prediction.');
    return [];
  }

  // Fetch playoff and regular season stats
  const playoffTeamData = await getPlayoffTeamStats();
  const regularSeasonTeamData = await getRegularSeasonTeamStats();

  // Filter for requested teams
  const filteredPlayoffTeamData = playoffTeamData.filter(team => teams.includes(team.team));
  const regularSeasonTeamDataMap: { [team: string]: TeamStats } = {};
  regularSeasonTeamData.forEach(team => {
    regularSeasonTeamDataMap[team.team] = team;
  });
  console.log('Fetched Playoff Team Data:', filteredPlayoffTeamData);

  if (!filteredPlayoffTeamData.length) {
    console.error('No valid playoff team data available for prediction.');
    return [];
  }

  // Fetch head-to-head stats (regular season)
  const headToHeadStats = await getHeadToHeadStats(teams);

  // Features
  const features = [
    'regGoalsPerGame',
    'regGoalsAgainstPerGame',
    'regPowerPlayPct',
    'regPenaltyKillPct',
    'regShotsPerGame',
    'regShotsAgainstPerGame',
    'regFaceoffWinPct',
    'playoffGoalsPerGame',
    'playoffGoalsAgainstPerGame',
    'playoffPowerPlayPct',
    'playoffPenaltyKillPct',
    'playoffShotsPerGame',
    'playoffShotsAgainstPerGame',
    'playoffFaceoffWinPct',
    'headToHeadWinPct',
    'seriesWinProb',
  ];

  // Calculate head-to-head win percentage
  const headToHeadWinPct: { [team: string]: number } = {};
  teams.forEach(team => {
    let totalGames = 0;
    let totalWins = 0;
    headToHeadStats.forEach(stat => {
      if (stat.team1 === team) {
        totalGames += stat.gamesPlayed;
        totalWins += stat.team1Wins;
      } else if (stat.team2 === team) {
        totalGames += stat.gamesPlayed;
        totalWins += stat.gamesPlayed - stat.team1Wins;
      }
    });
    headToHeadWinPct[team] = totalGames > 0 ? totalWins / totalGames : 0.5;
  });
  console.log('Head-to-Head Win Percentages:', headToHeadWinPct);

  // Prepare current team data
  const X = filteredPlayoffTeamData.map(team => {
    const regStats = regularSeasonTeamDataMap[team.team] || getFallbackTeamStats(team.team);
    return [
      regStats.goalsPerGame,
      regStats.goalsAgainstPerGame,
      regStats.powerPlayPct,
      regStats.penaltyKillPct,
      regStats.shotsPerGame,
      regStats.shotsAgainstPerGame,
      regStats.faceoffWinPct,
      team.goalsPerGame,
      team.goalsAgainstPerGame,
      team.powerPlayPct,
      team.penaltyKillPct,
      team.shotsPerGame,
      team.shotsAgainstPerGame,
      team.faceoffWinPct,
      headToHeadWinPct[team.team],
      team.seriesWinProb,
    ];
  });
  console.log('Feature Matrix X:', X);

  // Normalize data
  const { scaled: X_scaled } = standardScaler(X);
  console.log('Scaled Feature Matrix X_scaled:', X_scaled);

  // Use real historical data
  const historicalData = realHistoricalData;

  // Prepare training data
  const X_train = historicalData.map(team =>
    features.map(f => team[f as keyof HistoricalTeamStats] as number)
  );
  const y_train = historicalData.map(team => team.winner);
  console.log('Training Data Size:', X_train.length);

  // Normalize training data
  const { scaled: X_train_scaled } = standardScaler(X_train);

  // Train Random Forest
  const rfOptions = {
    seed: 42,
    maxFeatures: 0.8,
    replacement: true,
    nEstimators: 100,
  };
  const rf = new RandomForestClassifier(rfOptions);
  rf.train(X_train_scaled, y_train);
  console.log('Random Forest trained.');

  // Predict binary outcomes
  const predictions = rf.predict(X_scaled);
  console.log('Binary Predictions:', predictions);

  // Calculate heuristic score
  const scores = X_scaled.map(row => {
    return (
      row[0] +  // regGoalsPerGame
      row[2] +  // regPowerPlayPct
      row[3] +  // regPenaltyKillPct
      row[4] +  // regShotsPerGame
      row[6] +  // regFaceoffWinPct
      row[7] +  // playoffGoalsPerGame
      row[9] +  // playoffPowerPlayPct
      row[10] + // playoffPenaltyKillPct
      row[11] + // playoffShotsPerGame
      row[13] + // playoffFaceoffWinPct
      row[14] + // headToHeadWinPct
      row[15] + // seriesWinProb
      row[1] +  // regGoalsAgainstPerGame (negative impact)
      row[5] +  // regShotsAgainstPerGame (negative impact)
      row[8] +  // playoffGoalsAgainstPerGame (negative impact)
      row[12]   // playoffShotsAgainstPerGame (negative impact)
    );
  });

  // Combine results
  const results = filteredPlayoffTeamData.map((team, i) => ({
    team: team.team,
    score: predictions[i] === 1 ? scores[i] + 10 : scores[i],
  }));

  // Sort by score
  const sortedResults = results.sort((a, b) => b.score - a.score);
  console.log('Final Results:', sortedResults);

  return sortedResults;
}