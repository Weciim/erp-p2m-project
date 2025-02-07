import { combineReducers } from 'redux';

import { reducer as authReducer } from './auth';


// Combine all reducers.

const rootReducer = combineReducers({
  auth: authReducer
});

export default rootReducer;
