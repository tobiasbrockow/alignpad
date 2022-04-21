import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import moment from "moment";
import Button from "@material-ui/core/Button";

import todoIcon from "../images/todo-icon.png";
import doneIcon from "../images/done-icon.png";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  smPaper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    backgroundColor: "#FAFAFA",
  },
  smTodoPaper: {
    padding: theme.spacing(2),
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#2d4888",
    color: "#ffffff",
  },
  lgPaper: {
    padding: theme.spacing(5),
    marginBottom: 30,
  },
  lgTodoPaper: {
    padding: theme.spacing(5),
    marginBottom: 30,
    backgroundImage: `url(${todoIcon})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "250px",
    backgroundPositionX: "110%",
  },
  lgDonePaper: {
    padding: theme.spacing(5),
    marginBottom: 30,
    backgroundImage: `url(${doneIcon})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "300px",
    backgroundPositionY: "-100%",
    minHeight: "200px",
    backgroundPositionX: "110%",
  },
  doneText: {},
});

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openAlignments: [],
      completedAlignments: [],
      todos: [],
    };
  }

  alignmentHandler(id) {
    this.props.history.push("/alignment/" + id);
  }

  componentDidMount() {
    this.calculateOpenAlignments();
    this.addStatusToAlignments();
  }

  calculateOpenAlignments() {
    let sessions = this.props.externalData.sessions;

    for (let i of sessions) {
      i.fStartDate = moment(i.startDate).format("ddd, MMM D, H:mm");
      i.fEndDate = moment(i.endDate).format("ddd, MMM D, H:mm");
    }

    for (let x of sessions) {
      if (x.completed.length === 0) {
        let openAlignments = this.state.openAlignments;
        openAlignments.push(x);
        this.setState({
          openAlignments: openAlignments,
        });
      } else {
        if (!x.completed.includes(this.props.externalData.userId)) {
          let openAlignments = this.state.openAlignments;
          openAlignments.push(x);
          this.setState({
            openAlignments: openAlignments,
          });
        } else if (x.completed.includes(this.props.externalData.userId)) {
          let completedAlignments = this.state.completedAlignments;
          completedAlignments.push(x);
          this.setState({
            completedAlignments: completedAlignments,
          });
        }
      }
    }
  }

  addStatusToAlignments() {
    let openAlignments = this.state.openAlignments;
    let completedAlignments = this.state.completedAlignments;

    for (let x of openAlignments) {
      if (moment(x.endDate) < moment()) {
        x.status = "Closed";
      } else if (
        moment(x.startDate) < moment() &&
        moment(x.endDate) > moment()
      ) {
        x.status = "Open";
      } else if (moment(x.startDate) > moment()) {
        x.status = "Scheduled";
      } else {
        x.status = "Unknown";
      }
    }

    for (let x of completedAlignments) {
      if (moment(x.endDate) < moment()) {
        x.status = "Closed";
      } else if (
        moment(x.startDate) < moment() &&
        moment(x.endDate) > moment()
      ) {
        x.status = "Open";
      } else if (moment(x.startDate) > moment()) {
        x.status = "Scheduled";
      } else {
        x.status = "Unknown";
      }
    }

    this.setState({
      openAlignments: openAlignments,
      completedAlignments: completedAlignments,
    });
  }

  render() {
    const { classes } = this.props;

    let bgImage = this.props.classes.lgTodoPaper;
    let doneElement;
    if (
      this.state.openAlignments.filter((a) => a.status === "Scheduled")
        .length === 0
    ) {
      bgImage = this.props.classes.lgDonePaper;
      doneElement = (
        <Box className={classes.doneText}>
          <Box mt={5}>
            <b>Done!</b>
          </Box>
          <Box>There are no open to-do's</Box>
        </Box>
      );
    }

    return (
      <Box m={2} mt={4}>
        <Paper elevation={2} className={bgImage}>
          <Box mt={0} component="h2">
            To-Do's
          </Box>
          <div className={classes.root}>
            <Grid container spacing={3}>
              {this.state.openAlignments
                .filter((a) => a.status === "Scheduled")
                .map((alignment) => (
                  <Grid item xs={3}>
                    <Paper
                      className={classes.smTodoPaper}
                      key={alignment.name}
                      onClick={this.alignmentHandler.bind(
                        this,
                        alignment.sessionId
                      )}
                    >
                      <Box mb={1} fontWeight="fontWeightBold">
                        {alignment.name}
                      </Box>
                      <Box>Open until:</Box>
                      <Box fontWeight="fontWeightLight">
                        {alignment.fEndDate}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </div>
          {doneElement}
        </Paper>

        {this.props.externalData.teams.map((team) => (
          <Paper variant="outlined" elevation={0} className={classes.lgPaper}>
            <Box mt={0} pb={1} component="h2" lineHeight={1}>
              {team.name}
            </Box>
            <Box mt={0} pb={1} component="h5" lineHeight={1}>
              Completed check-ins
            </Box>
            <Grid container spacing={3}>
              {this.state.completedAlignments
                .filter((a) => a.teamId === team.id)
                .map((alignment) => (
                  <Grid item xs={3}>
                    <Paper className={classes.smPaper} key={alignment.name}>
                      <Box mb={1}>{alignment.status}</Box>
                      <Box fontWeight="fontWeightBold" mb={1}>
                        {alignment.name}
                      </Box>
                      <Box fontWeight="fontWeightLight">
                        {alignment.fStartDate}
                      </Box>
                    </Paper>

                    <Button
                      fullWidth="true"
                      key={alignment.sessionId}
                      onClick={this.props.viewResponsesHandler.bind(
                        this,
                        "team",
                        alignment.teamId,
                        alignment.alignmentId,
                        alignment.sessionId
                      )}
                    >
                      View responses
                    </Button>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        ))}
      </Box>
    );
  }
}

export default withStyles(styles)(Home);
