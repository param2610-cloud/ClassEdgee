import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ProfilePageComponent from '@/components/ProfilePage'
import { User } from '@/interface/general'
import { domain } from '@/lib/constant'
import { useAuth } from '@/services/AuthContext'
import axios from 'axios'
import { useEffect, useState } from 'react'

const Profilepage = () => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
            <ProfilePageComponent profileData={profileData} />

  )
}

export default Profilepage
