import React, { Component } from "react";

import axios from "axios";
import { authMiddleWare } from "../util/auth";
import withStyles from "@material-ui/core/styles/withStyles";

import { Button, TextField } from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import CircularProgress from "@material-ui/core/CircularProgress";
import MenuItem from "@material-ui/core/MenuItem";
import InputBase from "@material-ui/core/InputBase";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Card from "@material-ui/core/Card";

import moment from "moment";

const styles = (theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  root: {},
  details: {
    display: "flex",
  },
  avatar: {
    height: 110,
    width: 100,
    flexShrink: 0,
    flexGrow: 0,
  },
  locationText: {
    paddingLeft: "15px",
  },
  buttonProperty: {
    position: "absolute",
    top: "50%",
  },
  uiProgess: {
    position: "fixed",
    zIndex: "1000",
    height: "31px",
    width: "31px",
    left: "50%",
    top: "35%",
  },
  progess: {
    position: "absolute",
  },
  uploadButton: {
    marginLeft: "8px",
    margin: theme.spacing(1),
  },
  customError: {
    color: "red",
    fontSize: "0.8rem",
    marginTop: 10,
  },
  submitButton: {
    marginTop: 30,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  alignmentName: {
    fontSize: 30,
  },
  editIcon: {
    fill: "#d2d2d2",
    fontSize: 25,
    marginRight: "5px",
  },
  input: {
    width: "25ch",
    marginRight: 30,
    marginTop: 30,
    marginBottom: 30,
  },
  teamSelection: {
    backgroundColor: "#2d4888",
    color: "#ffffff",
  },
  formControl: {
    minWidth: 120,
  },
  card: {
    padding: theme.spacing(3),
  },
});

class Alignment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      aligntmentName: "Monday Standup",
      description: "Create alignment to start off a great week",
      teamQuestions: [
        "What have you achieved yesterday?",
        "What will you do today?",
      ],
      privateQuestions: [
        "Is there anything we can do better?",
        "What can I do to help you this week?",
      ],
      firstDate: moment().add(1, "days").format("YYYY-MM-DD"),
      time: "10:00",
      cadence: "weekly",
      day: "Monday",
      duration: "5",
      buttonLoading: false,
      teamId: "",
    };
  }

  componentDidMount() {
    let firstTeam = this.props.teams[0].id;
    this.setState({
      teamId: firstTeam,
    });
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleDateChange(date, name) {
    let fDate = moment(date).format("YYYY-MM-DD");
    this.setState({
      [name]: fDate,
    });
  }

  handleTimeChange(time, name) {
    let fTime = moment(time).format("HH:mm");
    this.setState({
      [name]: fTime,
    });
  }

  handleQuestionChange(event, name, i) {
    if (name === "teamQuestions") {
      let teamQuestions = this.state.teamQuestions.slice();
      console.log(teamQuestions);
      teamQuestions[i] = event.target.value;
      console.log(teamQuestions);
      this.setState({
        teamQuestions: teamQuestions,
      });
    }
    if (name === "privateQuestions") {
      let privateQuestions = this.state.privateQuestions.slice();
      console.log(privateQuestions);
      privateQuestions[i] = event.target.value;
      console.log(privateQuestions);
      this.setState({
        privateQuestions: privateQuestions,
      });
    }
  }

  updateFormValues = (event) => {
    event.preventDefault();
    this.setState({ buttonLoading: true });
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem("AuthToken");
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    const formRequest = {
      name: this.state.aligntmentName,
      description: this.state.description,
      teamQuestions: this.state.teamQuestions,
      privateQuestions: this.state.privateQuestions,
      cadence: this.state.cadence,
      day: moment(this.state.firstDate).format("dddd"),
      time: this.state.time,
      firstDate: moment(this.state.firstDate)
        .add(this.state.time.substring(0, 2), "hours")
        .add(this.state.time.substring(3, 5), "minutes"),
      duration: this.state.duration,
      teamId: this.state.teamId,
    };
    axios
      .post("/alignment", formRequest)
      .then(() => {
        this.setState({ buttonLoading: false });
        window.location.reload(false);
      })
      .catch((error) => {
        console.log(error);
        if (error.reponse !== undefined) {
          if (error.response.status === 403) {
            this.props.history.push("/login");
          }
        }
        this.setState({
          buttonLoading: false,
        });
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <main className={classes.content}>
        <form className={classes.root} noValidate autoComplete="off">
          <Grid container>
            <Grid item xs={9}>
              <InputBase
                required
                autoFocus
                id="standard-required"
                className={classes.alignmentName}
                inputProps={{ "aria-label": "naked" }}
                label="Name"
                name="aligntmentName"
                value={this.state.aligntmentName}
                onChange={this.handleChange}
              />

              <InputBase
                required
                fullWidth
                inputProps={{ "aria-label": "naked" }}
                id="standard-required"
                label="Description"
                name="description"
                value={this.state.description}
                onChange={this.handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <Box align="right">
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select
                    className={classes.teamSelection}
                    value={this.state.teamId}
                    name="teamId"
                    onChange={this.handleChange}
                  >
                    {this.props.teams.map((listitem) => (
                      <MenuItem value={listitem.id}>{listitem.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>

          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <div>
              <KeyboardDatePicker
                className={classes.input}
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="firstDate"
                label="First Date"
                name="firstDate"
                value={this.state.firstDate}
                onChange={(date) => this.handleDateChange(date, "firstDate")}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />

              <KeyboardTimePicker
                className={classes.input}
                margin="normal"
                format="HH:mm"
                id="time"
                label="Time"
                name="time"
                inputValue={this.state.time}
                onChange={(time) => this.handleTimeChange(time, "time")}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
              />

              <TextField
                className={classes.input}
                select
                label="Cadence"
                id="cadence"
                name="cadence"
                value={this.state.cadence}
                onChange={this.handleChange}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </TextField>

              <TextField
                required
                className={classes.input}
                id="standard-required"
                label="Duration in Hours"
                name="duration"
                value={this.state.duration}
                onChange={this.handleChange}
              />
            </div>
          </MuiPickersUtilsProvider>

          <Card className={classes.card}>
            <h3>Team Questions</h3>
            <div>
              <TextField
                id="outlined-full-width"
                label="1"
                placeholder="Placeholder"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                name="teamQuestions"
                value={this.state.teamQuestions[0]}
                onChange={(e) =>
                  this.handleQuestionChange(e, "teamQuestions", 0)
                }
              />
            </div>
            <div>
              <TextField
                id="outlined-full-width"
                label="2"
                placeholder="Placeholder"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                name="teamQuestions"
                value={this.state.teamQuestions[1]}
                onChange={(e) =>
                  this.handleQuestionChange(e, "teamQuestions", 1)
                }
              />
            </div>
            <h3>Private Questions</h3>
            <div>
              <TextField
                id="outlined-full-width"
                label="3"
                placeholder="Placeholder"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                name="privateQuestions"
                value={this.state.privateQuestions[0]}
                onChange={(e) =>
                  this.handleQuestionChange(e, "privateQuestions", 0)
                }
              />
            </div>
            <div>
              <TextField
                id="outlined-full-width"
                label="4"
                placeholder="Placeholder"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                name="teamQuestions"
                value={this.state.privateQuestions[1]}
                onChange={(e) =>
                  this.handleQuestionChange(e, "privateQuestions", 1)
                }
              />
            </div>
          </Card>
        </form>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          className={classes.submitButton}
          onClick={this.updateFormValues}
          disabled={
            this.state.buttonLoading ||
            !this.state.aligntmentName ||
            !this.state.description ||
            !this.state.cadence ||
            !this.state.firstDate ||
            !this.state.time ||
            !this.state.duration ||
            !this.state.teamQuestions ||
            !this.state.privateQuestions ||
            !this.state.teamId
          }
        >
          Create Alignment
          {this.state.buttonLoading && (
            <CircularProgress size={30} className={classes.progess} />
          )}
        </Button>
      </main>
    );
  }
}

export default withStyles(styles)(Alignment);
