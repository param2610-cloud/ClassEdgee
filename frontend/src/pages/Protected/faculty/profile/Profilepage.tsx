
import ProfilePageComponent from '@/components/ProfilePage'
import { domain } from '@/lib/constant'
import { useAuth } from '@/services/AuthContext'
import axios from 'axios'
import { useEffect, useState } from 'react'

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string; // Make phone_number optional
  college_uid: string;
  faculty?: { // Make faculty optional
    designation?: string;
    expertise?: string[];
    qualifications?: string[];
    joining_date?: string;
    contract_end_date?: string;
    research_interests?: string[];
  };
  departments: {
    department_id: string;
    department_name: string;
    department_code: string;
    contact_email: string;
    contact_phone: string;
  }[];
}
const Profilepage = () => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      const response = await axios.get(`${domain}/api/v1/faculty/get-faculty/${user?.user_id}`)
      const { data } = response.data
      setProfileData(data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
            profileData ? <ProfilePageComponent profileData={profileData} /> : <div>Loading profile data...</div>

  )
}

export default Profilepage
