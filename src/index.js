import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
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
      <div>
        {rows}
      </div>
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
      showComponent: true,
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

// class SearchBar extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       date: ''
//     }
//     this.handleChange = this.handleChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }
//
//   handleChange(e) {
//     this.setState({
//       date: e.target.value
//     })
//   }
//
//   handleSubmit(e) {
//     e.preventDefault();
//     console.log(this.state.date)
//   }
//
//   render() {
//     return (
//       <form style={{textAlign: 'center'}} onSubmit={this.handleSubmit}>
//         <input type="date" placeholder="Enter a date..." onChange={this.handleChange}>
//         </input>
//         <input type="submit"></input>
//       </form>
//     )
//   }
// }

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
    const {home_code, linescore, away_code, status} = this.props.data;

    return (
      <div className="scores" style={{display: 'inline-block', margin: '20px'}}>
        <h4>{status.status}</h4>
          <p>{home_code} | {linescore.r.home}</p>
          <p>{away_code} | {linescore.r.away}</p>
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
      date: ''
    }
    this.fetchData = this.fetchData.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  fetchData(month, day, year) {
    axios.get(`http://gd2.mlb.com/components/game/mlb/year_${year}/month_${month}/day_${day}/master_scoreboard.json`)
      .then((res) => {
        console.log(res.data.data.games.game)

        this.setState({
          games: res.data.data.games.game
        })
      })
      .catch((error) => {
        console.log(error.response)
      });
  }

  componentDidMount() {
    // add function to get last game played

    this.fetchData(10, 11, 2016);
  }

  handleChange(e) {
    this.setState({
      date: e.target.value
    });
    console.log(this.state.date)
  }



  render() {
    var scores = [];

    this.state.games.forEach((game, index) => {
      scores.push(<Scores data={game} key={index} />);
    });
    console.log(this.state.games);
    return (
      <div>
      <form style={{textAlign: 'center'}} onSubmit={this.handleSubmit}>
        <input type="date" placeholder="Enter a date..." onChange={this.handleChange} />
        <input type="submit"></input>
      </form>
      <DateSelector date={this.state.games.modified_date} />
        {scores}
      </div>
    );
  }
}



ReactDOM.render(
  <ScoreBoard />,
  document.getElementById('app')
);
