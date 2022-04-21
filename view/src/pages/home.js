import React, { Component } from "react";
import axios from "axios";

import Settings from "../components/settings";
import Team from "../components/team";
import Alignment from "../components/alignment";
import Home from "../components/homepage";

import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import withStyles from "@material-ui/core/styles/withStyles";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import HomeIcon from "@material-ui/icons/Home";
import AlignmentIcon from "@material-ui/icons/Assignment";
import TeamIcon from "@material-ui/icons/RadioButtonUnchecked";
import CollapseIcon from "@material-ui/icons/FirstPage";
import ExpandIcon from "@material-ui/icons/LastPage";
import AddIcon from "@material-ui/icons/Add";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import { authMiddleWare } from "../util/auth";

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    display: "flex",
  },
  botnav: {
    bottom: 0,
    marginTop: "auto",
    position: "sticky",
  },
  teamnav: {
    marginTop: 30,
  },
  container: {
    marginLeft: 0,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerCollapsed: {
    width: 60,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerPaperCollapsed: {
    width: 60,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  avatar: {
    height: 110,
    width: 100,
    flexShrink: 0,
    flexGrow: 0,
    marginTop: 20,
  },
  uiProgess: {
    position: "fixed",
    zIndex: "1000",
    height: "31px",
    width: "31px",
    left: "45%",
    top: "35%",
  },
  toolbar: theme.mixins.toolbar,
  navTitle: {
    paddingLeft: 16,
    paddingRight: 16,
  },
});

class home extends Component {
  state = {
    page: "",
    teamId: "",
    loginRedirect: false,
  };

  loadAccountPage = (name, email) => {
    this.setState({ name: name });
    this.setState({ email: email });
    this.setState({ page: "account" });
  };

  loadAlignmentPage = () => {
    this.setState({ page: "alignment" });
  };

  loadHomePage = () => {
    this.setState({ page: "" });
  };

  loadTeamPage = (teamId) => {
    this.setState({ teamId: teamId });
    this.setState({ page: "team" });
    this.setState({ selectedItems: undefined });
  };

  teamHandler = (event) => {
    this.props.history.push("/add/team");
  };

  collapseHandler = (event) => {
    this.setState({ navCollapsed: !this.state.navCollapsed });
  };

  constructor(props) {
    super(props);

    this.viewResponsesHandler = this.viewResponsesHandler.bind(this);

    this.state = {
      name: "",
      uiLoading: true,
      externalData: {
        teams: [],
      },
      imageLoading: false,
      navCollapsed: false,
      openAlignments: [],
      page: "",
      selectedItems: undefined,
    };
  }

  viewResponsesHandler(page, id, alignmentId, sessionId) {
    let selectedList = {};
    selectedList["alignmentId"] = alignmentId;
    selectedList["sessionId"] = sessionId;
    this.setState({
      page: page,
      teamId: id,
      selectedItems: selectedList,
    });
  }

  componentDidMount() {
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem("AuthToken");
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    let obj;

    this._asyncRequest = axios
      .get("/user")
      .then((response) => {
        obj = {
          name: response.data.userCredentials.name,
          email: response.data.userCredentials.email,
          userId: response.data.userCredentials.userId,
          profilePicture: response.data.userCredentials.imageUrl,
          teamManager: response.data.userCredentials.teamManager,
        };
        return axios.get("/teams");
      })
      .then((response) => {
        obj.teams = response.data;
        return axios.get("/sessions");
      })
      .then((response) => {
        obj.sessions = response.data;
        return obj;
      })
      .then((externalData) => {
        this._asyncRequest = null;
        this.setState({
          externalData,
          uiLoading: false,
        });
      })
      .catch((error) => {
        if (error.response !== undefined) {
          if (error.response.status === 403) {
            this.setState({
              loginRedirect: true,
            });
            this.props.history.push("/login");
          }
        }
        console.log(error);
        this.setState({ errorMsg: "Error in retrieving the data" });
      });
  }

  componentWillUnmount() {
    if (this._asyncRequest && this.state.loginRedirect === false) {
      this._asyncRequest.cancel();
    }
  }

  render() {
    const { classes } = this.props;
    if (this.state.navCollapsed === true) {
      classes.handlePaperCollapsed = classes.drawerPaperCollapsed;
      classes.handleDrawerCollapsed = classes.drawerCollapsed;
    } else {
      classes.handlePaperCollapsed = classes.drawerPaper;
      classes.handleDrawerCollapsed = classes.drawer;
    }
    let page, colIcon;

    if (this.state.navCollapsed === true) {
      colIcon = <ExpandIcon />;
    } else {
      colIcon = <CollapseIcon />;
    }

    if (this.state.page === "account") {
      page = (
        <Settings
          data={this.state.externalData}
          name={this.state.name}
          email={this.state.email}
          history={this.props.history}
          teams={this.state.externalData.teams}
        />
      );
    } else if (this.state.page === "team") {
      page = (
        <Team
          teamId={this.state.teamId}
          externalData={this.state.externalData}
          selectedItems={this.state.selectedItems}
          key={this.state.teamId}
        />
      );
    } else if (this.state.page === "alignment") {
      page = (
        <Alignment
          teams={this.state.externalData.teams}
          history={this.props.history}
        />
      );
    } else {
      page = (
        <Home
          viewResponsesHandler={this.viewResponsesHandler}
          externalData={this.state.externalData}
          openAlignments={this.state.openAlignments}
          history={this.props.history}
        />
      );
    }
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
        <div className={classes.root}>
          <CssBaseline />
          <Drawer
            className={classes.handleDrawerCollapsed}
            variant="permanent"
            classes={{
              paper: classes.handlePaperCollapsed,
            }}
          >
            <center>
              <p>Alignpad</p>
            </center>
            <Divider />
            <List className="main-nav">
              <ListItem button key="Home" onClick={this.loadHomePage}>
                <ListItemIcon>
                  {" "}
                  <HomeIcon />{" "}
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
            </List>

            <List className={classes.teamnav}>
              {this.state.externalData.teams.map((listitem) => (
                <ListItem
                  button
                  key={listitem.name}
                  onClick={this.loadTeamPage.bind(this, listitem.id)}
                >
                  <ListItemIcon>
                    {" "}
                    <TeamIcon />{" "}
                  </ListItemIcon>
                  <ListItemText primary={listitem.name} />
                </ListItem>
              ))}
            </List>

            <List className={classes.botnav}>
              <ListItem button key="Alignment" onClick={this.loadAlignmentPage}>
                <ListItemIcon>
                  {" "}
                  <AlignmentIcon />{" "}
                </ListItemIcon>
                <ListItemText primary="Create Alignment" />
              </ListItem>

              <ListItem button key="Team" onClick={this.teamHandler}>
                <ListItemIcon>
                  {" "}
                  <AddIcon />{" "}
                </ListItemIcon>
                <ListItemText primary="Add Team" />
              </ListItem>

              <ListItem
                button
                key="Settings"
                onClick={this.loadAccountPage.bind(
                  this,
                  this.state.externalData.name,
                  this.state.externalData.email
                )}
              >
                <ListItemIcon>
                  {" "}
                  <AccountBoxIcon />{" "}
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>

              <ListItem button key="Collapse" onClick={this.collapseHandler}>
                <ListItemIcon> {colIcon} </ListItemIcon>
                <ListItemText primary="Collapse" />
              </ListItem>
            </List>
          </Drawer>

          <Container maxWidth="lg" className={classes.container}>
            {page}
          </Container>
        </div>
      );
    }
  }
}

export default withStyles(styles)(home);
