import { fetchListofSection } from "@/api/scheduling-api/fetch";
import { Department, Section } from "@/interface/general";
import { domain } from "@/lib/constant";
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
  }) => void;
  userId: number;
}> = ({ onSubmit, userId }) => {
  const [formData, setFormData] = useState({
    departmentId: "",
    batchYear: "",
    academicYear: "",
    semester: "",
    totalWeeks: "",
    sectionId: "",
  });
  const [institution_id, setInstitutionId] = useAtom(institutionIdAtom);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [section, setSection] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [loadingSections, setLoadingSections] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await axios.get(
        `${domain}/api/v1/department/list-of-department`,
        {
          headers: {
            "X-Institution-Id": `${institution_id}`,
          },
        }
      );
      setDepartments(response.data.department);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoadingSections(true);
      const data = await fetchListofSection();
      setSection(data.data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setLoadingSections(false);
    }
  };

  useEffect(() => {
    if (institution_id) {
      fetchDepartments();
      fetchSections();
    } else {
      const storedId = localStorage.getItem("institution-id");
      setInstitutionId(storedId ? Number(storedId) : null);
    }
  }, [institution_id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.departmentId) newErrors.departmentId = "Department is required";
    if (!formData.sectionId) newErrors.sectionId = "Section is required";
    if (!formData.batchYear) newErrors.batchYear = "Batch year is required";
    else if (Number(formData.batchYear) < 2000 || Number(formData.batchYear) > 2100) 
      newErrors.batchYear = "Please enter a valid year between 2000 and 2100";
    
    if (!formData.academicYear) newErrors.academicYear = "Academic year is required";
    else if (Number(formData.academicYear) < 2000 || Number(formData.academicYear) > 2100) 
      newErrors.academicYear = "Please enter a valid year between 2000 and 2100";
    
    if (!formData.semester) newErrors.semester = "Semester is required";
    else if (Number(formData.semester) < 1 || Number(formData.semester) > 8) 
      newErrors.semester = "Semester must be between 1 and 8";
    
    if (!formData.totalWeeks) newErrors.totalWeeks = "Total weeks is required";
    else if (Number(formData.totalWeeks) < 1 || Number(formData.totalWeeks) > 52) 
      newErrors.totalWeeks = "Total weeks must be between 1 and 52";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (validateForm() && userId) {
      setIsLoading(true);
      onSubmit({
        departmentId: Number(formData.departmentId),
        batchYear: Number(formData.batchYear),
        academicYear: Number(formData.academicYear),
        semester: Number(formData.semester),
        totalWeeks: Number(formData.totalWeeks),
        userId: userId,
        sectionId: formData.sectionId ? Number(formData.sectionId) : undefined,
      });
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Initialize Schedule</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <div className="relative">
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, departmentId: e.target.value, sectionId: "" }))
                }
                className={`w-full p-3 border ${
                  submitAttempted && errors.departmentId 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300 focus:border-blue-500"
                } rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                disabled={loadingDepartments}
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
              {loadingDepartments && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
            {submitAttempted && errors.departmentId && (
              <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <div className="relative">
              <select
                value={formData.sectionId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sectionId: e.target.value }))
                }
                className={`w-full p-3 border ${
                  submitAttempted && errors.sectionId 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300 focus:border-blue-500"
                } rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                disabled={loadingSections || !formData.departmentId}
                required
              >
                <option value="">Select Section</option>
                {section.filter(s => s?.department_id === parseInt(formData.departmentId)).map((s) => (
                  <option key={s.section_id} value={s.section_id}>
                    {s.section_name}
                  </option>
                ))}
              </select>
              {loadingSections && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
            {submitAttempted && errors.sectionId && (
              <p className="mt-1 text-sm text-red-600">{errors.sectionId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
            <input
              type="number"
              value={formData.batchYear}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, batchYear: e.target.value }))
              }
              placeholder={`${currentYear - 3} to ${currentYear}`}
              className={`w-full p-3 border ${
                submitAttempted && errors.batchYear 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300 focus:border-blue-500"
              } rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              required
            />
            {submitAttempted && errors.batchYear && (
              <p className="mt-1 text-sm text-red-600">{errors.batchYear}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <input
              type="number"
              value={formData.academicYear}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, academicYear: e.target.value }))
              }
              placeholder={`${currentYear}`}
              className={`w-full p-3 border ${
                submitAttempted && errors.academicYear 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300 focus:border-blue-500"
              } rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              required
            />
            {submitAttempted && errors.academicYear && (
              <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <input
              type="number"
              min="1"
              max="8"
              value={formData.semester}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, semester: e.target.value }))
              }
              placeholder="1-8"
              className={`w-full p-3 border ${
                submitAttempted && errors.semester 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300 focus:border-blue-500"
              } rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              required
            />
            {submitAttempted && errors.semester && (
              <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Weeks</label>
            <input
              type="number"
              value={formData.totalWeeks}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, totalWeeks: e.target.value }))
              }
              placeholder="16-24"
              className={`w-full p-3 border ${
                submitAttempted && errors.totalWeeks 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300 focus:border-blue-500"
              } rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
              required
            />
            {submitAttempted && errors.totalWeeks && (
              <p className="mt-1 text-sm text-red-600">{errors.totalWeeks}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md shadow transition duration-200 ease-in-out flex justify-center items-center disabled:bg-blue-400"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              "Initialize Schedule"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InitialForm;
