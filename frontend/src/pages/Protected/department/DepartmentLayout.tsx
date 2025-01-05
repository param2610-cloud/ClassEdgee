import { useToast } from "@/hooks/use-toast";
import { Department } from "@/interface/general";
import { domain } from "@/lib/constant";
import { institutionIdAtom } from "@/store/atom";
import axios from "axios";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DepartmentLayout = () => {
    const { toast } = useToast();
    const [departmentList, setdepartmentList] = useState<Department[]>([]);
    const [institution_id] = useAtom(institutionIdAtom);
    const router = useNavigate();
    useEffect(() => {
        const fetchdepartmentlistdata = async () => {
            try {
                const response = await axios.get(
                    `${domain}/api/v1/department/list-of-department`,
                    {
                        headers: {
                            "X-Institution-Id": `${institution_id}`,
                        },
                    }
                );

                setdepartmentList(response.data.department);
            } catch (error) {
                console.log(error);
                toast({
                    title: "Error",
                    description: "Something went wrong",
                });
            }
        };
        fetchdepartmentlistdata();
        console.log(departmentList);
    }, []);
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
                <p className="text-gray-600 mt-2">Select a department to view details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentList && departmentList.map((department) => (
                    <div
                        key={department.department_id}
                        onClick={() => router(`/p/department/${department.department_id}`)}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer 
                                 hover:shadow-lg transition-shadow duration-300
                                 border border-gray-200 hover:border-blue-500"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {department.department_name}
                        </h2>
                        <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>Click to view details</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentLayout;
