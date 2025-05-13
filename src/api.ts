// src/api.ts
import axios from 'axios';
import { PlayoffData, TeamStats, ScheduleData, BoxscoreData, HeadToHeadStats, PlayoffTeamStats, TeamSummaryResponse, Game } from './types';

// Hardcoded series probabilities from web results [Web:5]
const seriesWinProbabilities: { [team: string]: number } = {
  'TOR': 0.59,
  'FLA': 0.41,
  'WSH': 0.35,
  'CAR': 0.65,
  'WPG': 0.39,
  'DAL': 0.61,
  'VGK': 0.33,
  'EDM': 0.67,
};

// Map team full names to abbreviations for consistency
const teamNameToAbbrev: { [key: string]: string } = {
  'New Jersey Devils': 'NJD',
  'Tampa Bay Lightning': 'TBL',
  'Colorado Avalanche': 'COL',
  'Winnipeg Jets': 'WPG',
  'Ottawa Senators': 'OTT',
  'Washington Capitals': 'WSH',
  'Minnesota Wild': 'MIN',
  'St. Louis Blues': 'STL',
  'Florida Panthers': 'FLA',
  'Toronto Maple Leafs': 'TOR',
  'Vegas Golden Knights': 'VGK',
  'Edmonton Oilers': 'EDM',
  'Dallas Stars': 'DAL',
  'Montréal Canadiens': 'MTL',
  'Carolina Hurricanes': 'CAR',
  'Los Angeles Kings': 'LAK',
};

export async function getPlayoffTeams(): Promise<string[]> {
  const url = 'https://api-web.nhle.com/v1/playoff-series/carousel/20242025';
  try {
    const response = await axios.get<PlayoffData[]>(url);
    console.log('Playoff API Response:', JSON.stringify(response.data, null, 2));
    const teams = new Set<string>();

    response.data.forEach((series: any) => {
      if (series.team1?.abbrev) teams.add(series.team1.abbrev);
      if (series.team2?.abbrev) teams.add(series.team2.abbrev);
      if (series.matchup?.team1?.abbrev) teams.add(series.matchup.team1.abbrev);
      if (series.matchup?.team2?.abbrev) teams.add(series.matchup.team2.abbrev);
    });

    const teamList = Array.from(teams);
    if (teamList.length === 0) {
      console.warn('No playoff teams found. Using fallback teams.');
      return ['WSH', 'CAR', 'TOR', 'FLA', 'WPG', 'DAL', 'VGK', 'EDM'];
    }
    console.log('Fetched Playoff Teams:', teamList);
    return teamList;
  } catch (error) {
    console.error('Error fetching playoff teams:', error);
    console.warn('Using fallback teams.');
    return ['WSH', 'CAR', 'TOR', 'FLA', 'WPG', 'DAL', 'VGK', 'EDM'];
  }
}

export async function getTeamStats(gameType: number): Promise<TeamStats[]> {
  const url = `https://api.nhle.com/stats/rest/en/team/summary?sort=powerPlayPct&cayenneExp=seasonId=20242025%20and%20gameTypeId=${gameType}`;
  try {
    const response = await axios.get<TeamSummaryResponse>(url);
    const data = response.data;
    console.log(`Team Stats Response (gameType=${gameType}):`, JSON.stringify(data, null, 2));

    if (!data.data?.length) {
      console.warn(`No valid stats for gameType=${gameType}. Using fallback stats.`);
      return [];
    }

    return data.data.map(team => ({
      team: teamNameToAbbrev[team.teamFullName] || team.teamFullName,
      gamesPlayed: team.gamesPlayed,
      goalsPerGame: team.goalsForPerGame,
      goalsAgainstPerGame: team.goalsAgainstPerGame,
      powerPlayPct: team.powerPlayPct * 100, // Convert to percentage
      penaltyKillPct: team.penaltyKillPct * 100, // Convert to percentage
      shotsPerGame: team.shotsForPerGame,
      shotsAgainstPerGame: team.shotsAgainstPerGame,
      faceoffWinPct: team.faceoffWinPct,
    }));
  } catch (error) {
    console.error(`Error fetching stats for gameType=${gameType}:`, error);
    return [];
  }
}

export async function getPlayoffTeamStats(): Promise<PlayoffTeamStats[]> {
  const stats = await getTeamStats(3); // Playoff stats
  return stats.map(stat => ({
    ...stat,
    seriesWinProb: seriesWinProbabilities[stat.team] || 0.5,
  }));
}

export async function getRegularSeasonTeamStats(): Promise<TeamStats[]> {
  return getTeamStats(2); // Regular season stats
}

export async function getTeamSchedule(teamAbbr: string): Promise<Game[]> {
  const url = `https://api-web.nhle.com/v1/club-schedule-season/${teamAbbr}/20242025`;
  try {
    const response = await axios.get<ScheduleData>(url);
    console.log(`Schedule Response for ${teamAbbr}:`, JSON.stringify(response.data, null, 2));
    const games = response.data.games?.filter(game => game.gameType === 2) || [];
    return games;
  } catch (error) {
    console.error(`Error fetching schedule for ${teamAbbr}:`, error);
    return [];
  }
}

export async function getGameBoxscore(gameId: string): Promise<BoxscoreData | null> {
  const url = `https://api-web.nhle.com/v1/gamecenter/${gameId}/boxscore`;
  try {
    const response = await axios.get<BoxscoreData>(url);
    console.log(`Boxscore Response for Game ${gameId}:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(`Error fetching boxscore for game ${gameId}:`, error);
    return null;
  }
}

export async function getHeadToHeadStats(playoffTeams: string[]): Promise<HeadToHeadStats[]> {
  const headToHead: HeadToHeadStats[] = [];
  for (let i = 0; i < playoffTeams.length; i++) {
    const team1 = playoffTeams[i];
    const schedule = await getTeamSchedule(team1);
    for (let j = i + 1; j < playoffTeams.length; j++) {
      const team2 = playoffTeams[j];
      const games = schedule.filter(game =>
        (game.homeTeam.abbrev === team2 && game.awayTeam.abbrev === team1) ||
        (game.homeTeam.abbrev === team1 && game.awayTeam.abbrev === team2)
      );
      let team1Wins = 0;
      let team1Goals = 0;
      let team2Goals = 0;
      for (const game of games) {
        const boxscore = await getGameBoxscore(game.id);
        if (boxscore) {
          const homeTeam = boxscore.homeTeam.abbrev;
          const awayTeam = boxscore.awayTeam.abbrev;
          const homeScore = boxscore.homeTeam.score;
          const awayScore = boxscore.awayTeam.score;
          if (homeTeam === team1 && homeScore > awayScore) team1Wins++;
          if (awayTeam === team1 && awayScore > homeScore) team1Wins++;
          if (homeTeam === team1) {
            team1Goals += homeScore;
            team2Goals += awayScore;
          } else {
            team1Goals += awayScore;
            team2Goals += homeScore;
          }
        }
      }
      if (games.length > 0) {
        headToHead.push({
          team1,
          team2,
          gamesPlayed: games.length,
          team1Wins,
          team1Goals,
          team2Goals,
        });
      }
    }
  }
  console.log('Head-to-Head Stats:', headToHead);
  return headToHead;
}

export function getFallbackTeamStats(teamAbbr: string): TeamStats {
  console.log('fallback used');
  process.exit();
  return {
    team: teamAbbr,
    gamesPlayed: 82,
    goalsPerGame: 3.0 + Math.random() * 0.5,
    goalsAgainstPerGame: 2.5 + Math.random() * 0.5,
    powerPlayPct: 20.0 + Math.random() * 5.0,
    penaltyKillPct: 80.0 + Math.random() * 5.0,
    shotsPerGame: 30.0 + Math.random() * 5.0,
    shotsAgainstPerGame: 30.0 + Math.random() * 5.0,
    faceoffWinPct: 0.50 + Math.random() * 0.05,
  };
}