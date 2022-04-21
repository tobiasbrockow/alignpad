import React, { Component } from "react";

import axios from "axios";
import { authMiddleWare } from "../util/auth";

import CircularProgress from "@material-ui/core/CircularProgress";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";

import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  table: {
    minWidth: 650,
  },
  headerQuestionCell: {
    backgroundColor: "#2d4888",
    border: 0.2,
    borderStyle: "solid",
    borderColor: "#2d4888",
    width: 500,
    color: "#ffffff",
  },
  answerCell: {
    backgroundColor: "#fafafa",
    height: 150,
    border: 0.2,
    borderStyle: "solid",
    borderColor: "#f1f1f1",
  },
  firstRowCell: {
    backgroundColor: "#ffffff",
    border: 0.2,
    borderStyle: "solid",
    borderColor: "#f1f1f1",
  },
});

class Team extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uiLoading: true,
      externalData: {},
      selectedAlignment: "",
      sessionsOfSelectedAlignment: [],
      selectedSession: "",
      displayedAnswers: [],
      displayedQuestions: [],
      teamName: "",
    };
  }

  componentDidMount() {
    this.getTeamName();

    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem("AuthToken");
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    let obj = {};

    let setup;
    if (this.props.selectedItems !== undefined) {
      setup = "selectedSetUp";
    } else {
      setup = "initialSetUp";
    }

    this._asyncRequest = axios
      .get("/alignments/" + this.props.teamId)
      .then((response) => {
        obj.alignments = response.data;
        return axios.get("/sessions/" + this.props.teamId);
      })
      .then((response) => {
        obj.sessions = response.data;
        return axios.get("/users/" + this.props.teamId);
      })
      .then((response) => {
        obj.users = response.data;
        return axios.get("/answers/" + this.props.teamId);
      })
      .then((response) => {
        obj.answers = response.data;
        return obj;
      })
      .then((externalData) => {
        this._asyncRequest = null;
        this.setState({
          externalData,
          uiLoading: false,
        });
      })
      .then(() => {
        this.handleAlignmentChange(setup);
        this.handleSessionChange(setup);
      })
      .catch((error) => {
        console.log(error);
        this.setState({ errorMsg: "Error in retrieving the data" });
      });
  }

  componentWillUnmount() {
    if (this._asyncRequest && this.state.loginRedirect === false) {
      this._asyncRequest.cancel();
    }
  }

  getTeamName() {
    let teams = this.props.externalData.teams;
    let id = this.props.teamId;
    let name = "";

    for (let x of teams) {
      if (x.id === id) {
        name = x.name;
      }
    }

    this.setState({
      teamName: name,
    });
  }

  handleAlignmentChange = (event) => {
    let alignmentId;
    let selectedAlignment;

    if (this.state.externalData.alignments[0] !== undefined) {
      selectedAlignment = this.state.externalData.alignments[0].alignmentId;
    } else {
      selectedAlignment = undefined;
    }

    this.setState({
      selectedAlignment: selectedAlignment,
    });

    if (event === "initialSetUp") {
      alignmentId = this.state.selectedAlignment;
    } else if (event === "selectedSetUp") {
      alignmentId = this.props.selectedItems.alignmentId;
    } else {
      this.setState({
        [event.target.name]: event.target.value,
      });

      alignmentId = event.target.value;
    }

    let sessions = this.state.externalData.sessions;
    let sessionsOfSelectedAlignment = [];

    for (let x of sessions) {
      if (x.alignmentId === alignmentId) {
        sessionsOfSelectedAlignment.push(x);
      }
    }

    this.setState({
      sessionsOfSelectedAlignment: sessionsOfSelectedAlignment,
      selectedAlignment: alignmentId,
    });
  };

  handleSessionChange = (event) => {
    let sessionId;
    let selectedSession;

    if (this.state.externalData.sessions[0] !== undefined) {
      selectedSession = this.state.externalData.sessions[0].sessionId;
    } else {
      selectedSession = undefined;
    }

    this.setState({
      selectedSession: selectedSession,
    });

    if (event === "initialSetUp") {
      sessionId = this.state.selectedSession;
    } else if (event === "selectedSetUp") {
      sessionId = this.props.selectedItems.sessionId;
    } else {
      this.setState({
        [event.target.name]: event.target.value,
      });

      sessionId = event.target.value;
    }

    this.setState({
      selectedSession: sessionId,
    });

    this.getQuestions(sessionId);
    this.getAnswers(sessionId);
  };

  getAnswers(sessionId) {
    let users = this.state.externalData.users;
    let answers = this.state.externalData.answers;
    let data = [];

    for (let x of users) {
      let row = [];
      let validAnswers = [];
      let sortedAnswers = [];
      let count = 0;
      row.push(x.name);

      // Find answers from this user and this session
      for (let y of answers) {
        if (y.userId === x.userId && y.sessionId === sessionId) {
          validAnswers.push(y);
        }
      }

      // Split answers in private and team
      let answerObj = {};
      answerObj["team"] = [];
      answerObj["private"] = [];
      for (let x of validAnswers) {
        answerObj[x.type].push(x);
      }
      console.log(answerObj);

      // Sort team questions first
      for (let i = answerObj.team.length; i > sortedAnswers.length; ) {
        for (let a of answerObj.team) {
          if (parseInt(a.questionNum) === sortedAnswers.length) {
            sortedAnswers.push(a);
          }
        }
        count++;
        if (count > 20) {
          break;
        }
      }

      // Now sort private questions
      for (
        let i2 = answerObj.private.length;
        i2 > sortedAnswers.length - answerObj.team.length;

      ) {
        for (let a of answerObj.private) {
          if (
            parseInt(a.questionNum) ===
            sortedAnswers.length - answerObj.team.length
          ) {
            sortedAnswers.push(a);
          }
        }
        count++;
        if (count > 40) {
          break;
        }
      }

      for (let y of sortedAnswers) {
        row.push(y.body);
      }

      data.push(row);
    }

    this.setState({
      displayedAnswers: data,
    });
  }

  getQuestions(sessionId) {
    let selectedSessionId = sessionId;
    let allSessions = this.state.externalData.sessions;
    let session;
    let questionRow = [];

    console.log(selectedSessionId);
    console.log(allSessions);

    for (let x of allSessions) {
      if (x.sessionId === selectedSessionId) {
        session = x;
      }
    }

    let pQ = session.privateQuestions;
    let tQ = session.teamQuestions;

    for (let x of tQ) {
      questionRow.push(x);
    }

    for (let x of pQ) {
      questionRow.push(x);
    }

    this.setState({
      displayedQuestions: questionRow,
    });
  }

  render() {
    const { classes } = this.props;
    if (this.state.uiLoading === true) {
      return (
        <div>{this.state.uiLoading && <CircularProgress size={150} />}</div>
      );
    } else {
      return (
        <Box m={1} mt={4}>
          <Box component="h2">{this.state.teamName}</Box>

          <form>
            <FormControl className={classes.formControl}>
              <InputLabel id="alignment">Alignment</InputLabel>
              <Select
                labelId="alignment"
                id="alignment"
                name="selectedAlignment"
                value={this.state.selectedAlignment}
                onChange={this.handleAlignmentChange}
              >
                {this.state.externalData.alignments.map((alignment) => (
                  <MenuItem key={alignment.name} value={alignment.alignmentId}>
                    {alignment.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl className={classes.formControl}>
              <InputLabel id="session">Check-In</InputLabel>
              <Select
                labelId="session"
                id="session"
                name="selectedSession"
                value={this.state.selectedSession}
                onChange={this.handleSessionChange}
              >
                {this.state.sessionsOfSelectedAlignment.map((session) => (
                  <MenuItem key={session.startDate} value={session.sessionId}>
                    {session.name}, {session.startDate}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>

          <br></br>

          <TableContainer component={Paper}>
            <Table
              stickyHeader
              className={classes.table}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell className={classes.firstRowCell}></TableCell>
                  {this.state.displayedQuestions.map((question) => (
                    <TableCell
                      className={classes.headerQuestionCell}
                      align="left"
                    >
                      {question}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.displayedAnswers.map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell
                      className={classes.firstRowCell}
                      component="th"
                      scope="row"
                    >
                      {row[0]}
                    </TableCell>
                    <TableCell className={classes.answerCell} align="left">
                      <Box fontWeight="fontWeightLight">{row[1]}</Box>
                    </TableCell>
                    <TableCell className={classes.answerCell} align="left">
                      <Box fontWeight="fontWeightLight">{row[2]}</Box>
                    </TableCell>
                    <TableCell className={classes.answerCell} align="left">
                      <Box fontWeight="fontWeightLight">{row[3]}</Box>
                    </TableCell>
                    <TableCell className={classes.answerCell} align="left">
                      <Box fontWeight="fontWeightLight">{row[4]}</Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    }
  }
}

export default withStyles(styles)(Team);
