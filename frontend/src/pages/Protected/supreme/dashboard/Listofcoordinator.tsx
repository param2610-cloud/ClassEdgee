// import {
//     Table,
//     TableHeader,
//     TableRow,
//     TableCell,
//     TableCaption,
// } from "@/components/ui/table";
// import { domain } from "@/lib/constant";
// import axios from "axios";
// import { useEffect, useState } from "react";

// const PrincipalList = () => {
//     const [principals, setPrincipals] = useState([]);

//     useEffect(() => {
//         const fetchPrincipals = async () => {
//             const response = await axios.get(
//                 `${domain}/api/v1/principal/list-of-principals`
//             );
//             console.log(response);

//             const data = await response.data;
//             setPrincipals(data);
//         };
//         fetchPrincipals();
//     }, []);

//     return (
//         <Table>
//             <TableHeader>
//                 <TableRow>
//                     <TableCell>Name</TableCell>
//                     <TableCell>Email</TableCell>
//                     <TableCell>Account Creation Date</TableCell>
//                 </TableRow>
//             </TableHeader>
//             <tbody>
//                 {principals.map((principal: any) => (
//                     <TableRow key={principal._id}>
//                         <TableCell>{principal.fullName}</TableCell>
//                         <TableCell>{principal.contactInfo.email}</TableCell>
//                         <TableCell>
//                             {new Date(
//                                 principal.accountCreationDate
//                             ).toLocaleDateString()}
//                         </TableCell>
//                     </TableRow>
//                 ))}
//             </tbody>
//             <TableCaption>List of Principals</TableCaption>
//         </Table>
//     );
// };
// export default PrincipalList;

import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { domain } from "@/lib/constant";
import { useAtom } from "jotai";
import { institutionIdAtom } from "@/store/atom";

// Interface for Coordinator data
interface Coordinator {
  college_uid: string;
  first_name: string;
  last_name: string;
  email: string;
  institution_id: string;
  created_at: string;
}

// Interface for API Response
interface CoordinatorsResponse {
  message: string;
  data: Coordinator[];
}

// Interface for Filters
interface CoordinatorFilters {
  institution_id?: string;
}

const Listofcoordinator: React.FC = () => {
  // State to manage coordinators data
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CoordinatorFilters>({
    institution_id: "",
  });
  const [institution_id] = useAtom(institutionIdAtom);
  // Fetch coordinators data

  const fetchCoordinators = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response: AxiosResponse<CoordinatorsResponse> = await axios.get(
        `${domain}/api/v1/supreme/coordinators`,
        {
          params: {
            institution_id: institution_id,
          },
        }
      );

      // Type-safe data assignment
      setCoordinators(response.data.data || []);
      setIsLoading(false);
    } catch (err) {
      // Improved error handling
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "An unexpected error occurred";

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (institution_id) {
      console.log(institution_id);

      fetchCoordinators();
    }
  }, [institution_id]);

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Coordinators</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p>Loading coordinators...</p>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Coordinators</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>College UID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Institution ID</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coordinators.map((coordinator) => (
              <TableRow key={coordinator.college_uid}>
                <TableCell>{coordinator.college_uid}</TableCell>
                <TableCell>{coordinator.first_name}</TableCell>
                <TableCell>{coordinator.last_name}</TableCell>
                <TableCell>{coordinator.email}</TableCell>
                <TableCell>{coordinator.institution_id}</TableCell>
                <TableCell>
                  {new Date(coordinator.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Listofcoordinator;
