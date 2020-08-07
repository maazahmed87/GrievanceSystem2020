import { combineReducers } from "redux";
import * as actionTypes from "../actions/types";

const initialUserState = {
  currentUser: null,
  isLoading: true,
};

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false,
      };
    case actionTypes.CLEAR_USER:
      return {
        currentUser: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialTicketState = {
  userDetails: null,
  tickets: [],
};

const ticket_reducer = (state = initialTicketState, action) => {
  switch (action.type) {
    case actionTypes.SET_TICKETS:
      return {
        ...state,
        tickets: action.payload.tickets,
      };
    case actionTypes.SET_USER_DETAILS:
      return {
        ...state,
        userDetails: action.payload.userDetails,
      };
    case actionTypes.CLEAR_USER_DETAILS:
      return {
        userDetails: null,
      };
    case actionTypes.CLEAR_TICKETS:
      return {
        tickets: [],
      };
    default:
      return state;
  }
};

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null,
};

const channel_reducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel,
      };
    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel,
      };

    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer,
  tickets: ticket_reducer,
});

export default rootReducer;
