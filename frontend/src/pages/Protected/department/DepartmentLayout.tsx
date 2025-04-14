import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/interface/general";
import { domain } from "@/lib/constant";
import { institutionIdAtom } from "@/store/atom";
import axios from "axios";
import { useAtom } from "jotai";
import { Plus, Building2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DepartmentLayout = () => {
    const { toast } = useToast();
    const [departmentList, setDepartmentList] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [institution_id] = useAtom(institutionIdAtom);
    const router = useNavigate();

    const getAccentColor = () => {
        const colors = [
            'bg-blue-500',
            'bg-purple-500',
            'bg-teal-500',
            'bg-rose-500',
            'bg-indigo-500'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    useEffect(() => {
        const fetchDepartmentListData = async () => {
            try {
                const response = await axios.get(
                    `${domain}/api/v1/department/list-of-department`,
                    {
                        headers: {
                            "X-Institution-Id": `${institution_id}`,
                        },
                    }
                );
                setDepartmentList(response.data.department);
            } catch (error) {
                console.log(error);
                toast({
                    title: "Error",
                    description: "Something went wrong while fetching departments",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDepartmentListData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    onClick={() => router(-1)}
                    variant="ghost"
                    className="mb-6 group hover:bg-blue-100 transition-colors duration-300"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Dashboard
                </Button>

                {/* Header Section */}
                <div className="relative mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <div className="md:flex md:justify-between md:items-center">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-500 p-2 rounded-lg">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
                                        Departments
                                    </h1>
                                </div>
                                <p className="text-gray-600 text-lg">
                                    Explore Departments
                                </p>
                            </div>
                            <Button 
                                onClick={() => router('/p/department/create')}
                                className="mt-6 md:mt-0 w-full md:w-auto flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Plus className="h-5 w-5" />
                                Create Department
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="space-y-4 text-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse" />
                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
                            </div>
                            <p className="text-gray-600 font-medium">Loading departments...</p>
                        </div>
                    </div>
                ) : departmentList.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Building2 className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="mt-6 text-xl font-semibold text-gray-900">No departments found</h3>
                        <p className="mt-3 text-gray-600 max-w-sm mx-auto">
                            Get started by creating a new department for your institution.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departmentList.map((department) => (
                            <div
                                key={department.department_id}
                                onClick={() => router(`/p/department/${department.department_id}`)}
                                className="group bg-white rounded-xl shadow-md hover:shadow-xl 
                                         transition-all duration-300 overflow-hidden cursor-pointer
                                         border border-gray-100 hover:border-blue-200"
                            >
                                <div className={`p-6 space-y-4`}>
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {department.department_name}
                                        </h2>
                                        <div className={`p-2 rounded-lg ${getAccentColor()} text-white`}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center space-x-2 text-gray-600 group-hover:text-blue-600 transition-colors">
                                            <span className="text-sm font-medium">Click to View</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-1 bg-gray-50 group-hover:bg-blue-500 transition-colors duration-300" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentLayout;