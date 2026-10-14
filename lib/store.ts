import { configureStore } from '@reduxjs/toolkit';
import { api } from './features/api/apiSlice';
import authReducer from './features/slices/authSlice';

export const makeStore = () => {
  const store = configureStore({
    reducer: {
         auth: authReducer,
      [api.reducerPath]: api.reducer,  
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),   
  });

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];