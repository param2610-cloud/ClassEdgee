import { fetchFaculty } from '@/api/scheduling-api/fetch';
import React, { useEffect, useState } from 'react';

const FacultySelector: React.FC<{
  subjectId: number;
  slotId: number;
  onChange: (id: number) => void;
}> = ({ subjectId, slotId, onChange }) => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFaculty = async () => {
      setIsLoading(true);
      try {
        const data = await fetchFaculty(subjectId, slotId);
        setFaculty(data);
      } catch (error) {
        console.error('Error loading faculty:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaculty();
  }, [subjectId, slotId]);

  if (isLoading) return <div>Loading faculty...</div>;

  return (
    <div>
      <label className="block mb-1">Select Faculty</label>
      <select 
        onChange={e => onChange(Number(e.target.value))}
        className="w-full p-2 border rounded"
      >
        <option value="">Choose Faculty</option>
        {faculty.map(f => (
          <option 
            key={f.id} 
            value={f.id}
            disabled={!f.isAvailable}
          >
            {f.name} {!f.isAvailable && '(Not Available)'}
          </option>
        ))}
      </select>
    </div>
  );
};
export default FacultySelector;