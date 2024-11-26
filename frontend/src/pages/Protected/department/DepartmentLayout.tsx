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
        <div>
            <h1>Department Layout</h1>
            <ul>
                {departmentList &&
                    departmentList.map((department) => (
                        <li
                            key={department.department_id}
                            onClick={() =>
                                router(
                                    `/p/department/${department.department_id}`
                                )
                            }
                        >
                            {department.department_name}
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default DepartmentLayout;
