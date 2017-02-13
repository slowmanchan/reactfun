import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
require('./main.css');

class ScoreHeadingsRow extends Component {
  render() {
    var cols = []
    let {inning_line_score} = this.props.linescore;

    inning_line_score.forEach((col) => {
      cols.push(<td>{col.inning}</td>)
    })

     return (
        <tr>
          <td></td>
          {cols}
          <td>R</td>
          <td>H</td>
          <td>E</td>
        </tr>
    )
  }
}

class HomeRow extends Component {
  render() {
    var cols = []
    let {
      home_team_runs,
      home_team_hits,
      home_team_errors,
      inning_line_score
    } = this.props.linescore;

    inning_line_score.forEach((inning) => {
      cols.push(<td>{inning.home}</td>)
    })

    return (
      <tr>
        <td>{this.props.home_sname}</td>
        {cols}
        <td>{home_team_runs}</td>
        <td>{home_team_hits}</td>
        <td>{home_team_errors}</td>
      </tr>
    )
  }
}

class AwayRow extends Component {
  render() {
    var rows = []
    let {
      inning_line_score,
      away_team_runs,
      away_team_hits,
      away_team_errors
    } = this.props.linescore;

    inning_line_score.forEach((inning) => {
      rows.push(<td>{inning.away}</td>)
    })

    return (
      <tr>
        <td>{this.props.away_sname}</td>
        {rows}
        <td>{away_team_runs}</td>
        <td>{away_team_hits}</td>
        <td>{away_team_errors}</td>
      </tr>
    )
  }
}

class BatterRow extends Component {
  render() {
    const {
      name_display_first_last, ab, r, h, rbi, bb, hr, so, avg
    } = this.props.batter;

    return (
      <tr>
        <td>{name_display_first_last}</td>
        <td>{ab}</td>
        <td>{r}</td>
        <td>{h}</td>
        <td>{rbi}</td>
        <td>{bb}</td>
        <td>{hr}</td>
        <td>{so}</td>
        <td>{avg}</td>
      </tr>
    )
  }
}

class BatterTable extends Component {
  render() {
    var rows = [];

    this.props.details.batting[(this.props.teamIndex)].batter.forEach((batter) => {
      rows.push(<BatterRow batter={batter}/>)
    })

    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>AB</th>
            <th>R</th>
            <th>H</th>
            <th>RBI</th>
            <th>BB</th>
            <th>HR</th>
            <th>SO</th>
            <th>AVG</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

class ScoreTable extends Component {
  render() {
    return (
      <table>
        <thead>
          <ScoreHeadingsRow linescore={this.props.data.linescore}/>
        </thead>
        <tbody>
          <HomeRow linescore={this.props.data.linescore}
                   home_sname={this.props.data.home_sname}/>
          <AwayRow linescore={this.props.data.linescore}
                   away_sname={this.props.data.away_sname}/>
        </tbody>
      </table>
    )
  }
}

class DetailsBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
      teamIndex: 0
    }
    this.handleTeamToggle = this.handleTeamToggle.bind(this)
  }

  handleTeamToggle(team) {
    this.setState({
      teamIndex: team
    })
  }

  render() {
    console.log("++" + this.state.teamIndex)
    return (
      <div>
        <h1>Details</h1>
        <ScoreTable data={this.props.details} linescore={this.props.linescore} />
        <TeamSelector handleTeamToggle={this.handleTeamToggle}/>
        <BatterTable teamIndex={this.state.teamIndex} details={this.props.details} />
      </div>
    )
  }
}

class TeamSelector extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.handleTeamToggle(1)
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick}>WAS</button> | <button onClick={this.handleClick}>LA</button>
      </div>
    )
  }
}

class DetailsButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boxscore: []
    }

    this.clickHandler = this.clickHandler.bind(this);
    this.fetchBatterData = this.fetchBatterData.bind(this);
  }

  fetchBatterData() {
    let gameDayString = this.props.gameday.split('_');
    let year = gameDayString[0];
    let month = gameDayString[1];
    let day = gameDayString[2];
    let homeCode = gameDayString[3];
    let awayCode = gameDayString[4];

    gameDayString = "year_" + year + "/month_" + month + "/day_" + day + "/gid_" + this.props.gameday;

    console.log(gameDayString);
    axios.get(`http://gd2.mlb.com/components/game/mlb/${gameDayString}/boxscore.json`)
      .then((res) => {
        this.props.handleDetailsUpdate(res.data.data.boxscore)
      })
      .catch((error) => {
        console.log(error.response)
      })
  }

  clickHandler(e) {
    //DetailsBox
    e.preventDefault();

    // Reset existing.
    this.props.handleDetailsUpdate(null)
    this.fetchBatterData()
  }

  render() {
    console.log("---" + this.props.linescore)
    return (
      <div>
      <button onClick={this.clickHandler}>details</button>
      {this.state.showComponent ? <DetailsBox linescore={this.props.linescore} home={this.props.home} away={this.props.away}/> : null}
      </div>
    )
  }
}

class Scores extends Component {

  render() {
    let {
      away_name_abbrev,
      home_name_abbrev,
      status,
      linescore,
      home_code,
      away_code,
      home_sport_code,
      away_sport_code
    } = this.props.data;


    let homeWinning = false;
    let awayWinning = false;
    // check to see which is the winning scores
    if (status.status !== 'Preview') {
      homeWinning = linescore.r.home > linescore.r.away;
      awayWinning = linescore.r.away > linescore.r.home;
    }

    // display scores and bolding the winning team
    return (
      <div className="scores" style={{display: 'inline-block', margin: '20px'}}>
        <h4>{status.status}</h4>
          <p className={homeWinning ? 'bold' : null}>{home_name_abbrev} | {linescore.r.home}</p>
          <p className={awayWinning ? 'bold' : null}>{away_name_abbrev} | {linescore.r.away}</p>
        {status.status == 'Final' || status.status == "Completed Early" ? <DetailsButton linescore={this.props.data.linescore} gameday={this.props.gameday} handleDetailsUpdate={this.props.handleDetailsUpdate} home_sport_code={home_sport_code} home={home_code} away={away_code} away_sport_code={away_sport_code} date={this.props.date}/> : <div>&nbsp;</div>}
      </div>
    );
  }
}

class ScoreBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
      date: [],
      noGameData: true,
      details: null,

    }
    this.fetchData = this.fetchData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDetailsUpdate = this.handleDetailsUpdate.bind(this);
  }

  handleDetailsUpdate(details) {
    this.setState ({
      details: details
    })
  }

  // fetch data from MLB JSON API
  fetchData(month, day, year) {
    axios.get(`http://gd2.mlb.com/components/game/mlb/year_${year}/month_${month}/day_${day}/master_scoreboard.json`)
      .then((res) => {
        // 1 or more games, obj or array.
        if (res.data.data.games.game) {

          let games;
          // Just one game: single object
          if (typeof res.data.data.games.game.length === "undefined") {
            games = [res.data.data.games.game]
          } else {
            games = res.data.data.games.game;
          }

          // map over games, create copy of games and if game is missing linescore, create
          // blank linescore

          games = games.map((game, idx) => {
            let gameCopy = Object.assign({}, game);

            if (!gameCopy.hasOwnProperty('linescore')) {
              gameCopy.linescore = {
                r: {
                  home: '',
                  away: '',
                }
              };
            }
            return gameCopy;
          })

          let gamesToronto = [];
          let gamesNotToronto = [];
          games.forEach((game) => {

            // Store toronto game.
            if (game.away_code === "tor" || game.home_code === "tor") {
              gamesToronto.push(game);
            } else {
              gamesNotToronto.push(game); //Not toronto game.
            }
          })

          gamesToronto = gamesToronto.concat(gamesNotToronto)


          this.setState({
            games: gamesToronto,
            noGameData: false,
          });
        } else {
          this.setState({
            games: [],
            noGameData: true,
          })
        }
      })

      .catch((error) => {
        this.setState({
          games: [],
          noGameData: true,
        })
      });
  }

  handleChange(e) {
    this.handleDetailsUpdate(null);
    const dateString = e.target.value.split('-');
    const year = dateString[0];
    const month = dateString[1];
    const day = dateString[2];

    this.fetchData(month, day, year)
    this.setState({
      date: [month, day, year]
    })
  }

  render() {
    const checkGameData = () => {
      if (this.state.noGameData) {
        return (
          <div>
            No games found
          </div>
        );
      }
    }

    var scores = [];

    this.state.games.forEach((game, index) => {
      scores.push(
        <Scores handleDetailsUpdate={this.handleDetailsUpdate}
                gameday={game.gameday}
                data={game} key={index}
                date={this.state.date} />);
    });

    return (
      <div>
        <DateSelector handleChange={this.handleChange} />
        {checkGameData()}
        {scores}
        {this.state.details ? <DetailsBox details={this.state.details}/> : null}
      </div>
    );
  }
}

class DateSelector extends Component {
  render() {
    return (
      <form>
        <input type="date" onChange={this.props.handleChange} />
      </form>
    )
  }
}

ReactDOM.render(
  <ScoreBoard />,
  document.getElementById('app')
);
