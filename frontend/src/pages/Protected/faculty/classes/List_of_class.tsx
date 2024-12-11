import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Class } from '@/interface/general';
import { useAuth } from '@/services/AuthContext';


const ListOfClass: React.FC<Props> = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const {user} = useAuth()
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get(`${domain}/api/v1/faculty/classes/list-of-past-classes/${studentId}`);
                console.log("response:",response);
                
                setClasses(response.data);
            } catch (err) {
                setError('Failed to fetch classes');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [studentId, domain]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Past Classes</h1>
            <ul>
                {classes.map((classItem) => (
                    <li key={classItem.id}>
                        {classItem.name} - {classItem.date}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListOfClass;