import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { 
  setUser, 
  setInstitution, 
  clearAuth,
  fetchInstitutionDetails 
} from '../store/slices/authSlice';
import { User } from '@/interface/general';

export const useAppAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, institution, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const initializeAuth = async (userData: User, institutionId: number) => {
    dispatch(setUser(userData));
    await dispatch(fetchInstitutionDetails(institutionId));
  };

  const logout = () => {
    dispatch(clearAuth());
    localStorage.removeItem('institution_id');
  };

  return {
    user,
    institution,
    isLoading,
    error,
    initializeAuth,
    logout,
  };
};