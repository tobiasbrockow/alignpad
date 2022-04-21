import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {
  Card,
  CardContent,
  Divider,
  Button,
  Grid,
  TextField,
} from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";

import TeamSettings from "../components/teamsettings";

import clsx from "clsx";

import axios from "axios";
import { authMiddleWare } from "../util/auth";

const styles = (theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
    marginTop: 16,
  },
  toolbar: theme.mixins.toolbar,
  root: {
    padding: theme.spacing(2),
  },
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
    paddingLeft: "0px",
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
    marginLeft: "0px",
    margin: theme.spacing(1),
  },
  customError: {
    color: "red",
    fontSize: "0.8rem",
    marginTop: 10,
  },
  submitButton: {
    marginTop: "10px",
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  teamnav: {
    paddingBottom: 0,
  },
});

class settings extends Component {
  constructor(props) {
    super(props);

    this.changePageHandler = this.changePageHandler.bind(this);

    this.state = {
      profilePicture: this.props.data.profilePicture,
      name: this.props.name,
      email: this.props.email,
      buttonLoading: false,
      page: "",
      imageError: "",
    };
  }

  changePageHandler(page) {
    this.setState({
      page: page,
    });
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleImageChange = (event) => {
    this.setState({
      image: event.target.files[0],
    });
  };

  logoutHandler = (event) => {
    localStorage.removeItem("AuthToken");
    this.props.history.push("/login");
  };

  loadTeamSettingsPage = (teamId, teamName) => {
    this.setState({ teamId: teamId });
    this.setState({ teamName: teamName });
    this.setState({ page: "teamsettings" });
  };

  profilePictureHandler = (event) => {
    event.preventDefault();
    this.setState({
      uiLoading: true,
    });
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem("AuthToken");
    let form_data = new FormData();
    form_data.append("image", this.state.image);
    form_data.append("content", this.state.content);
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    axios
      .post("/user/image", form_data, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        if (error.response.status === 403) {
          this.props.history.push("/login");
        }
        console.log(error);
        this.setState({
          uiLoading: false,
          imageError: "Error in posting the data",
        });
      });
  };

  updateFormValues = (event) => {
    event.preventDefault();
    this.setState({ buttonLoading: true });
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem("AuthToken");
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    const formRequest = {
      name: this.state.name,
    };
    axios
      .post("/user", formRequest)
      .then(() => {
        this.setState({ buttonLoading: false });
      })
      .catch((error) => {
        if (error.response.status === 403) {
          this.props.history.push("/login");
        }
        console.log(error);
        this.setState({
          buttonLoading: false,
        });
      });
  };

  render() {
    const { classes, ...rest } = this.props;
    if (this.state.uiLoading === true) {
      return (
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.state.uiLoading && (
            <CircularProgress size={150} className={classes.uiProgess} />
          )}
        </main>
      );
    } else if (this.state.page === "teamsettings") {
      return (
        <div>
          <TeamSettings
            changePageHandler={this.changePageHandler}
            id={this.state.teamId}
            name={this.state.teamName}
          />
        </div>
      );
    } else {
      return (
        <main className={classes.content}>
          <Card {...rest} className={clsx(classes.root, classes)}>
            <CardContent className={classes.card}>
              <div className={classes.details}>
                <div>
                  <Grid container>
                    <Grid item xs={2}>
                      <Avatar
                        alt="Remy Sharp"
                        src={this.state.profilePicture}
                        className={classes.large}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Box className={classes.locationText} component="h2">
                        {this.state.name}
                      </Box>
                    </Grid>
                  </Grid>

                  <Button
                    variant="outlined"
                    color="primary"
                    type="submit"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    className={classes.uploadButton}
                    onClick={this.profilePictureHandler}
                  >
                    Upload Photo
                  </Button>
                  <input type="file" onChange={this.handleImageChange} />

                  {this.state.imageError ? (
                    <div className={classes.customError}>
                      {" "}
                      Wrong Image Format || Supported Format are PNG and JPG
                    </div>
                  ) : (
                    false
                  )}
                </div>
              </div>
              <div className={classes.progress} />
            </CardContent>

            <form autoComplete="off" noValidate>
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      margin="dense"
                      name="name"
                      variant="outlined"
                      value={this.state.name}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      margin="dense"
                      name="email"
                      variant="outlined"
                      disabled={true}
                      value={this.state.email}
                      onChange={this.handleChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </form>
          </Card>

          <Box mt={2}>
            <Button
              color="primary"
              variant="contained"
              type="submit"
              className={classes.submitButton}
              onClick={this.updateFormValues}
              disabled={this.state.buttonLoading || !this.state.name}
            >
              Save details
              {this.state.buttonLoading && (
                <CircularProgress size={30} className={classes.progess} />
              )}
            </Button>
          </Box>

          <Box mt={4}>
            <Card className={classes.root}>
              <Box component="h2" ml={2} mt={2}>
                Team settings
              </Box>

              <List className={classes.teamnav}>
                {this.props.teams.map((listitem) => (
                  <div>
                    <ListItem
                      button
                      key={listitem.name}
                      onClick={this.loadTeamSettingsPage.bind(
                        this,
                        listitem.id,
                        listitem.name
                      )}
                    >
                      <ListItemText primary={listitem.name} />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </Card>
          </Box>

          <Box mt={4}>
            <ListItem button key="Logout" onClick={this.logoutHandler}>
              <ListItemIcon>
                {" "}
                <ExitToAppIcon />{" "}
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </Box>
        </main>
      );
    }
  }
}

export default withStyles(styles)(settings);
