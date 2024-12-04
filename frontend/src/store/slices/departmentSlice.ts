import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { domain } from '@/lib/constant';
import { Department } from '@/interface/general';

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Cache duration in milliseconds (e.g., 5 minutes)
export const CACHE_DURATION = 5 * 60 * 1000;

export const fetchDepartments = createAsyncThunk<
  Department[],
  string,
  { rejectValue: string }
>('departments/fetchDepartments', async (institutionId, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${domain}/api/v1/department/list-of-department`,
      {
        headers: {
          'X-Institution-Id': institutionId,
        },
      }
    );
    return response.data.department;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch departments'
    );
  }
});

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    clearDepartments: (state) => {
      state.departments = [];
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch departments';
      });
  },
});

export const { clearDepartments } = departmentSlice.actions;
export default departmentSlice.reducer;
