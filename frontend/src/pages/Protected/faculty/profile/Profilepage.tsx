import { User } from '@/interface/general'
import { domain } from '@/lib/constant'
import { useAuth } from '@/services/AuthContext'
import axios from 'axios'
import React, { useEffect, useState } from 'react'


const Profilepage = () => {
    const {user} = useAuth()
    const [profileData,setProfileData] = useState<User | null>(null)
    useEffect(()=>{
      fetchFaculty()
    },[])
    const fetchFaculty = async () => {
        try {
            const response = await axios.get(`${domain}/api/v1/faculty/get-faculty/${user?.user_id}`);
            const { data } = response.data; 
            setProfileData(data);
            console.log(data);
        }catch(error){
          console.log(error)
        }
    }
    
  return (
    <div>
      
    </div>
  )
}

export default Profilepage
