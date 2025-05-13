# NHL Stanley Cup Winner Prediction Model

![NHL Logo](https://www.nhl.com/assets/images/logos/nhl-logo.svg)

A TypeScript-based machine learning model to predict the 2025 Stanley Cup winner using 2024-2025 NHL season data. The model leverages team-level statistics from the regular season and playoffs, head-to-head matchup results, and series win probabilities, employing a Random Forest classifier trained on real historical data from 2022–2024 Stanley Cup winners and losers.

The model focuses on current playoff teams (WSH, CAR, TOR, FLA, WPG, DAL, VGK, EDM), at the time of this writing, the model is predicting the **Dallas Stars (DAL)** as the winner, narrowly edging out the Carolina Hurricanes (CAR), due to DAL’s balanced performance.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Data Sources](#data-sources)
- [Model Methodology](#model-methodology)
- [Current Prediction](#current-prediction)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Debugging](#debugging)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Real-Time Data**: Fetches team stats, playoff teams, and head-to-head results from NHL API endpoints.
- **Real Historical Data**: Trained on stats from 2022–2024 Stanley Cup winners (FLA, VGK, COL) and losers (EDM, FLA, TBL).
- **Comprehensive Metrics**: Includes regular season, playoff, and contextual features (e.g., goals per game, penalty kill percentage, series win probability).
- **Robust Error Handling**: Fallback data for API failures ensures reliability.
- **Simple Scoring**: Uses an unweighted heuristic score to combine normalized features for a balanced prediction.

## Prerequisites

- **Node.js**: Version 14.x or higher ([Download](https://nodejs.org/)).
- **npm**: For dependency management (included with Node.js).
- **TypeScript**: For compiling and running the code.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/nhl-stanley-cup-predictor.git
   cd nhl-stanley-cup-predictor