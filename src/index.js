import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
require('./main.css');

const MLB = require('./mlb.json');

class StatRow extends Component {
  render() {
    console.log("statrow" + this.props.data)
    var rows = []

    this.props.data.inning_line_score.forEach((row) => {
      rows.push(<td>{row.inning}</td>)
    })
     return (
      <tr>
        {rows}<td>R</td><td>H</td><td>E</td>
      </tr>
    )
  }
}

class HomeRow extends Component {
  render() {
    var rows = []

    this.props.data.inning_line_score.forEach((row) => {
      rows.push(<td>{row.home}</td>)
    })
    return (
      <tr>
        {rows}<td>{this.props.data.home_team_runs}</td><td>{this.props.data.home_team_hits}</td><td>{this.props.data.home_team_errors}</td>
      </tr>
    )
  }
}

class AwayRow extends Component {
  render() {
    var rows = []

    this.props.data.inning_line_score.forEach((row) => {
      rows.push(<td>{row.away}</td>)
    })
    return (
      <tr>
        {rows}<td>{this.props.data.away_team_runs}</td><td>{this.props.data.away_team_hits}</td><td>{this.props.data.away_team_errors}</td>
      </tr>
    )
  }
}
class BatterRow extends Component {
  render() {
    var rows = []

    this.props.data.forEach((row) => {
      rows.push(<tr><td>{row.name_display_first_last}</td><td>{row.ab}</td><td>{row.r}</td><td>{row.h}</td><td>{row.rbi}</td><td>{row.bb}</td><td>{row.so}</td><td>{row.avg}</td></tr>)
    })
    return (
      <tr>
        {rows}
      </tr>
    )
  }
}
class BatterDetail extends Component {
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr><th>Name</th><th>AB</th><th>R</th><th>RBI</th><th>BB</th><th>SO</th><th>AVG</th></tr>
            <BatterRow data={this.props.data[0].batter} />
          </tbody>
        </table>
      </div>
    )
  }
}

class ScoreDetail extends Component {
  render() {
    console.log("scoredetail" + this.props.data)

    return (
      <div>
        <h1>ScoreDetails</h1>
        <table>
          <tbody>
            <StatRow data={this.props.data} />
            <HomeRow data={this.props.data} />
            <AwayRow data={this.props.data} />
          </tbody>
        </table>
      </div>
    )
  }
}

class DetailsBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: []
    }
    this.fetchData = this.fetchData.bind(this);
  }

  fetchData(month, day, year) {
     axios.get(`http://gd2.mlb.com/components/game/mlb/year_${year}/month_${month}/day_${day}/gid_2016_10_11_wasmlb_lanmlb_1/boxscore.json`)
       .then((res) => {
         console.log(res.data.data.boxscore)
         this.setState({
           games: res.data.data.boxscore
         })
       })
       .catch((error) => {
         console.log(error.response)
       });
  }

  componentDidMount() {
    this.fetchData(10, 11, 2016);
  }

  render() {
    return (
      <div>
        <h1>Details</h1>

        <ScoreDetail data={this.state.games.linescore}/>
        <TeamSelector />
        <BatterDetail data={this.state.games.batting}/>
      </div>
    )
  }
}

class TeamSelector extends Component {
  render() {
    return (
      <div>
        <button>WAS</button> | <button>LA</button>
      </div>
    )
  }
}

class DetailsButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showComponent: false
    }
    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler() {
    this.setState({
      showComponent: true
    })
  }


  render() {
    return (
      <div>
      <button onClick={this.clickHandler}>details</button>
      {this.state.showComponent ? <DetailsBox home={this.props.home} away={this.props.away}/> : null}
      </div>
    )
  }
}

class DateSelector extends Component {
  render() {
    return (
      <div style={{textAlign: 'center'}}>
        <h1>{this.props.date}</h1>
        <button>prev</button>
        <button>next</button>
      </div>
   )
  }
}

class Scores extends Component {

  render() {
    let {home_code, linescore, away_code, status} = this.props.data;


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
          <p className={homeWinning ? 'bold' : null}>{home_code} | {linescore.r.home}</p>
          <p className={awayWinning ? 'bold' : null}>{away_code} | {linescore.r.away}</p>
        <DetailsButton />
      </div>
    );
  }
}

class ScoreBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
      date: '',
      noGameData: true,
      details: null,

    }
    this.fetchData = this.fetchData.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  // fetch data from MLB JSON API
  fetchData(month, day, year) {
    axios.get(`http://gd2.mlb.com/components/game/mlb/year_${year}/month_${month}/day_${day}/master_scoreboard.json`)
      .then((res) => {

        console.log(res.data.data.games.game)

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
  /*
  componentDidMount() {
    // add function to get last game played

    this.fetchData(10, 11, 2016);
  }
  */
  handleChange(e) {
    /*
    this.setState({
      date: e.target.value
    });
    */
    const dateString = e.target.value.split('-');
    const year = dateString[0];
    const month = dateString[1];
    const day = dateString[2];

    this.fetchData(month, day, year)
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
      scores.push(<Scores data={game} key={index} />);
    });

    return (
      <div>
      <form style={{textAlign: 'center'}} onSubmit={this.handleSubmit}>
        <input type="date" placeholder="Enter a date..." onChange={this.handleChange} />
      </form>
      <DateSelector date={this.state.games.modified_date} />
        {checkGameData()}
        {scores}
        <DetailsBox />
      </div>
    );
  }
}



ReactDOM.render(
  <ScoreBoard />,
  document.getElementById('app')
);
