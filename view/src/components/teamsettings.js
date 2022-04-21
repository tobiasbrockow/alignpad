import React, { Component } from "react";

import axios from "axios";

import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import withStyles from "@material-ui/core/styles/withStyles";
import ArrowBack from "@material-ui/icons/ArrowBack";
import Switch from "@material-ui/core/Switch";

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
  backButton: {
    margin: 20,
    cursor: "pointer",
  },
});

class addTeam extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userEmail: "",
      isManager: false,
      errors: [],
      loading: false,
    };
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSwitchChange = (event) => {
    this.setState({
      [event.target.name]: event.target.checked,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const data = {
      email: this.state.userEmail,
      teamId: this.props.id,
      isManager: this.state.isManager,
    };
    axios
      .post("/team/add", data)
      .then(() => {
        this.setState({
          loading: false,
        });
        window.location.reload(false);
      })
      .catch((error) => {
        this.setState({
          errors: error,
          loading: false,
        });
      });
  };

  handleBack() {
    window.location.reload(false);
  }

  render() {
    const { classes } = this.props;
    const { errors, loading } = this.state;
    return (
      <main>
        <div
          className={classes.backButton}
          onClick={this.props.changePageHandler.bind(this, "")}
        >
          {" "}
          <ArrowBack></ArrowBack>{" "}
        </div>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Typography component="h1" variant="h5">
              Add User
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="userEmail"
                label="User Name"
                name="userEmail"
                helperText={errors.userEmail}
                error={errors.userEmail ? true : false}
                onChange={this.handleChange}
              />
              Is this user a team manager?
              <Switch
                onChange={this.handleSwitchChange}
                name="isManager"
                id="isManager"
              ></Switch>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={this.handleSubmit}
                disabled={loading || !this.state.userEmail}
              >
                Add User
                {loading && (
                  <CircularProgress size={30} className={classes.progess} />
                )}
              </Button>
              {errors.general && (
                <Typography variant="body2" className={classes.customError}>
                  {errors.general}
                </Typography>
              )}
            </form>
          </div>
        </Container>
      </main>
    );
  }
}

export default withStyles(styles)(addTeam);
