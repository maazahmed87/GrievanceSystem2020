import * as actionTypes from "./types";

/* User Actions */
export const setUser = (user) => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user,
    },
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER,
  };
};

export const clearTickets = () => {
  return {
    type: actionTypes.CLEAR_TICKETS,
  };
};

export const clearUserDetails = () => {
  return {
    type: actionTypes.CLEAR_USER_DETAILS,
  };
};
/* Channel Actions */
export const setCurrentChannel = (channel) => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel,
    },
  };
};

export const setPrivateChannel = (isPrivateChannel) => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel,
    },
  };
};

export const setUserPosts = (userPosts) => {
  return {
    type: actionTypes.SET_USER_POSTS,
    payload: {
      userPosts,
    },
  };
};

//
export const setTickets = (posts) => {
  return {
    type: actionTypes.SET_TICKETS,
    payload: {
      tickets: posts,
    },
  };
};

export const setUserDetails = (details) => {
  return {
    type: actionTypes.SET_USER_DETAILS,
    payload: {
      userDetails: details,
    },
  };
};
