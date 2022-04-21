import React, { Component } from "react";

import axios from "axios";

import { authMiddleWare } from "../util/auth";

import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import withStyles from "@material-ui/core/styles/withStyles";
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  textarea: {
    alignItems: "normal",
    minHeight: 200,
  },
});

class Session extends Component {
  constructor(props) {
    super(props);

    this.state = {
      body: "",
      uiLoading: true,
      step: 1,
      stepIndex: 0,
      pCount: 0,
      question: "",
      type: "",
      done: false,
      progress: 25,
      nQuestions: 0,
    };
  }

  componentDidMount() {
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem("AuthToken");
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    console.log(this.props.match.params.sessionId);

    let obj;

    this._asyncRequest = axios
      .get("/questions/" + this.props.match.params.sessionId)
      .then((response) => {
        obj = {
          privateQuestions: response.data.privateQuestions,
          teamQuestions: response.data.teamQuestions,
        };
        return axios.get("/session/" + this.props.match.params.sessionId);
      })
      .then((response) => {
        obj.session = response.data;
        return axios.get("/user");
      })
      .then((response) => {
        obj.userId = response.data.userCredentials.userId;
        return obj;
      })
      .catch((error) => {
        if (error.response.status === 403) {
          this.props.history.push("/login");
        }
        console.log(error);
        this.setState({ errorMsg: "Error in retrieving the data" });
      })
      .then((externalData) => {
        this._asyncRequest = null;
        this.setState({
          externalData,
          uiLoading: false,
        });
        this.setQuestion();
      });
  }

  componentWillUnmount() {
    if (this._asyncRequest !== undefined && this._asyncRequest !== null) {
      this._asyncRequest.cancel();
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  setQuestion() {
    let count = 0;
    let teamQ = this.state.externalData.teamQuestions;
    let privateQ = this.state.externalData.privateQuestions;
    let q = "";
    let t = "";
    let stepN = this.state.step - 1;
    let stepI = this.state.stepIndex;
    let pCount = this.state.pCount;
    let done = this.state.done;
    let nQuestions = teamQ.length + privateQ.length;

    /* Loop over team Questions */
    for (let i of teamQ) {
      if (count === stepN) {
        q = i;
        t = "team";
      }
      count++;
    }

    /* Loop over private Questions */
    for (let i of privateQ) {
      if (count === stepN) {
        q = i;
        t = "private";
        if (pCount === 0) {
          stepI = 0;
          pCount++;
        }
      }
      count++;
    }

    if (q === "") {
      done = true;
    }

    this.setState({
      question: q,
      type: t,
      stepIndex: stepI,
      pCount: pCount,
      done: done,
      nQuestions: nQuestions,
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let answer = {
      body: this.state.body,
    };
    axios
      .post(
        "/answer/" +
          this.props.match.params.sessionId +
          "/" +
          this.state.type +
          "/" +
          this.state.stepIndex +
          "/" +
          this.state.externalData.session.teamId,
        answer
      )
      .then(() => {
        let newStep = this.state.step + 1,
          newStepIndex = this.state.stepIndex + 1;

        let progress = 100 * (newStep / this.state.nQuestions);
        this.setState({
          loading: false,
          step: newStep,
          stepIndex: newStepIndex,
          body: "",
          progress: progress,
        });
        this.setQuestion();
        if (this.state.done === true) {
          this.handleDone();
          this.props.history.push("/");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleDone() {
    let list = this.state.externalData.session.completed;
    list.push(this.state.externalData.userId);
    let obj = {
      completed: list,
    };
    axios
      .put("/session/" + this.props.match.params.sessionId, obj)
      .then(() => {
        console.log("Hello");
      })
      .catch((error) => {
        this.setState({
          errors: error.response.data,
          loading: false,
        });
      });
  }

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    if (this.state.uiLoading === true) {
      return (
        <div className={classes.root}>
          {this.state.uiLoading && (
            <CircularProgress size={150} className={classes.uiProgess} />
          )}
        </div>
      );
    } else {
      return (
        <Box>
          <LinearProgress variant="determinate" value={this.state.progress} />
          <Container component="main" maxWidth="sm">
            <CssBaseline />
            <div className={classes.paper}>
              <Typography component="h1" variant="h5">
                {this.state.question}
              </Typography>
              <form className={classes.form} noValidate>
                <TextField
                  inputProps={{
                    className: classes.textarea,
                  }}
                  variant="outlined"
                  margin="normal"
                  multiline="true"
                  required
                  fullWidth
                  id="body"
                  label="Your answer"
                  name="body"
                  value={this.state.body}
                  onChange={this.handleChange}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={this.handleSubmit}
                  disabled={loading}
                >
                  Next
                  {loading && (
                    <CircularProgress size={30} className={classes.progess} />
                  )}
                </Button>
              </form>
            </div>
          </Container>
        </Box>
      );
    }
  }
}

export default withStyles(styles)(Session);
