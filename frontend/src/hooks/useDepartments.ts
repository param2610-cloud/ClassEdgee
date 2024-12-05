import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { CACHE_DURATION, fetchDepartments } from '../store/slices/departmentSlice';

export const useDepartments = (institutionId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { departments, loading, error, lastFetched } = useSelector(
    (state: RootState) => state.department
  );

  useEffect(() => {
    const shouldFetch =
      !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

    if (shouldFetch) {
      dispatch(fetchDepartments(institutionId));
    }
  }, [dispatch, institutionId, lastFetched]);

  return { departments, loading, error };
};