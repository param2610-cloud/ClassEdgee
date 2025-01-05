import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { domain } from '@/lib/constant';
import { Institution, User, UserRole } from '@/interface/general';

interface AuthState {
  user: User | null;
  institution: Institution | null;
  isLoading: boolean;
  error: string | null;
}
interface LoginCredentials {
    email: string;
    password: string;
    role: UserRole;
  }

const initialState: AuthState = {
  user: null,
  institution: null,
  isLoading: false,
  error: null,
};

export const fetchInstitutionDetails = createAsyncThunk(
  'auth/fetchInstitutionDetails',
  async (institutionId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${domain}/api/v1/institution/${institutionId}`,
        {
          headers: {
            'X-Institution-Id': institutionId.toString(),
          },
        }
      );
      return response.data.institution;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institution details');
    }
  }
);
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
      try {
        const endpoint = `${domain}/api/v1/${credentials.role}/login`;
        const response = await axios.post(endpoint, {
          email: credentials.email,
          password: credentials.password
        }, {
          withCredentials: true
        });
  
        return response.data;
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          return rejectWithValue(error.response?.data?.message || "An error occurred");
        }
        return rejectWithValue("An unexpected error occurred");
      }
    }
  );

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setInstitution: (state, action) => {
      state.institution = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.institution = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstitutionDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInstitutionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institution = action.payload;
      })
      .addCase(fetchInstitutionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.userData || action.payload.user; // Handle both response formats
        state.error = null;
        if (action.payload.institution) {
            state.institution = action.payload.institution;
        }
    })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setInstitution, clearAuth } = authSlice.actions;
export default authSlice.reducer;