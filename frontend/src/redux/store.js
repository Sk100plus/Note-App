import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import storage from "redux-persist/lib/storage"; // Import storage
import { persistReducer } from "redux-persist"; 
import { persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

// Combine reducers if you have more than one
const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create a persisted store
export const persistor = persistStore(store);
