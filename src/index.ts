// src/index.ts
import { getPlayoffTeams } from './api';
import { predictStanleyCupWinner } from './model';

async function main() {
  console.log('Fetching 2025 playoff teams...');
  const playoffTeams = await getPlayoffTeams();
  console.log('Playoff Teams:', playoffTeams);

  if (!playoffTeams.length) {
    console.error('No playoff teams available. Exiting.');
    return;
  }

  console.log('Predicting Stanley Cup winner...');
  const predictions = await predictStanleyCupWinner(playoffTeams);

  if (!predictions.length) {
    console.error('No predictions generated. Check API or data processing.');
    return;
  }

  console.log('Stanley Cup Winner Predictions:');
  console.table(predictions, ['team', 'score']);
  console.log('Predicted Winner:', predictions[0].team, `(${predictions[0].score.toFixed(2)} score)`);
}

main().catch(error => console.error('Main error:', error));