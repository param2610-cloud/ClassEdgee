import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import departmentReducer from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    department: departmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
