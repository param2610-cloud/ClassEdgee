import { fetchListofSection } from "@/api/scheduling-api/fetch";
import { Department, Section } from "@/interface/general";
import { domain } from "@/lib/constant";
import { useAuth } from "@/services/AuthContext";
import { institutionIdAtom } from "@/store/atom";
import axios from "axios";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
const InitialForm: React.FC<{
  onSubmit: (data: {
    departmentId: number;
    batchYear: number;
    academicYear: number;
    semester: number;
    totalWeeks: number;
    userId: number;
    sectionId: number | undefined;
  }) => void,userId:number;
}> = ({ onSubmit,userId }) => {
  const [formData, setFormData] = useState({
    departmentId: "",
    batchYear: "",
    academicYear: "",
    semester: "",
    totalWeeks: "",
    sectionId: "",
  });
  const [institution_id, setInstitutionId] = useAtom(institutionIdAtom);
  // const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [section, setSection] = useState<Section[]>([]);


  const fetchDepartments = async () => {
    const response = await axios.get(
      `${domain}/api/v1/department/list-of-department`,
      {
        headers: {
          "X-Institution-Id": `${institution_id}`,
        },
      }
    );
    console.log(response.data.department);
    setDepartments(response.data.department);
  };

  useEffect(() => {
    if (institution_id) {
      fetchDepartments();
      fetchListofSection().then((data) => {
        setSection(data.data);
      });
    } else {
      setInstitutionId(localStorage.getItem("institution-id"));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userId && formData.sectionId != "") {
      onSubmit({
        departmentId: Number(formData.departmentId),
        batchYear: Number(formData.batchYear),
        academicYear: Number(formData.academicYear),
        semester: Number(formData.semester),
        totalWeeks: Number(formData.totalWeeks),
        userId: userId,
        sectionId: formData.sectionId ? Number(formData.sectionId) : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <div>
        <label className="block mb-1">Department</label>
        <select
          value={formData.departmentId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, departmentId: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option
              key={department.department_id}
              value={department.department_id}
            >
              {department.department_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Section</label>
        <select
          value={formData.sectionId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, sectionId: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Section</option>
          {section.map((section) => {
            if (section?.department_id == parseInt(formData.departmentId)) {
              return (
                <option key={section.section_id} value={section.section_id}>
                  {section.section_name}
                </option>
              );
            }
          })}
        </select>
      </div>

      <div>
        <label className="block mb-1">Batch Year</label>
        <input
          type="number"
          value={formData.batchYear}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, batchYear: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Academic Year</label>
        <input
          type="number"
          value={formData.academicYear}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, academicYear: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Semester</label>
        <input
          type="number"
          min="1"
          max="8"
          value={formData.semester}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, semester: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Total Weeks</label>
        <input
          type="number"
          value={formData.totalWeeks}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, totalWeeks: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Initialize Schedule
      </button>
    </form>
  );
};
export default InitialForm;
