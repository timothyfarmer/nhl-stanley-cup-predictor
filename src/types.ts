// src/types.ts
export interface PlayoffSeries {
  team1?: { abbrev: string };
  team2?: { abbrev: string };
  matchup?: { team1?: { abbrev: string }; team2?: { abbrev: string } };
}

export interface PlayoffData {
  // Array of series for carousel endpoint
  [key: number]: PlayoffSeries;
}

export interface TeamSummaryStats {
  teamId: number;
  teamFullName: string;
  gamesPlayed: number;
  goalsForPerGame: number;
  goalsAgainstPerGame: number;
  powerPlayPct: number;
  penaltyKillPct: number;
  shotsForPerGame: number;
  shotsAgainstPerGame: number;
  faceoffWinPct: number;
}

export interface TeamSummaryResponse {
  data: TeamSummaryStats[];
  total: number;
}

export interface TeamStats {
  team: string; // Abbreviation (e.g., 'TOR')
  gamesPlayed: number;
  goalsPerGame: number;
  goalsAgainstPerGame: number;
  powerPlayPct: number;
  penaltyKillPct: number;
  shotsPerGame: number;
  shotsAgainstPerGame: number;
  faceoffWinPct: number;
}

export interface PlayoffTeamStats extends TeamStats {
  seriesWinProb: number; // Probability of winning current series
}

export interface HistoricalTeamStats {
  team: string;
  gamesPlayed: number;
  regGoalsPerGame: number;
  regGoalsAgainstPerGame: number;
  regPowerPlayPct: number;
  regPenaltyKillPct: number;
  regShotsPerGame: number;
  regShotsAgainstPerGame: number;
  regFaceoffWinPct: number;
  playoffGoalsPerGame: number;
  playoffGoalsAgainstPerGame: number;
  playoffPowerPlayPct: number;
  playoffPenaltyKillPct: number;
  playoffShotsPerGame: number;
  playoffShotsAgainstPerGame: number;
  playoffFaceoffWinPct: number;
  headToHeadWinPct: number;
  seriesWinProb: number;
  winner: number;
}

export interface HeadToHeadStats {
  team1: string;
  team2: string;
  gamesPlayed: number;
  team1Wins: number;
  team1Goals: number;
  team2Goals: number;
}

export interface Game {
  id: string;
  homeTeam: { id: number; abbrev: string };
  awayTeam: { id: number; abbrev: string };
  gameDate: string;
  gameType: number;
}

export interface ScheduleData {
  games: Game[];
}

export interface BoxscoreTeam {
  abbrev: string;
  score: number;
}

export interface BoxscoreData {
  homeTeam: BoxscoreTeam;
  awayTeam: BoxscoreTeam;
}