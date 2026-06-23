import { apiClient } from "../api-client";

export interface FAQ {
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  speciality_id: string;
  program_id?: string;
  language_code?: string;
  status: "active" | "inactive";
  course_image?: string;
  duration?: string;
  duration_number?: number;
  duration_unit?: string;
  price: number;
  display_order?: number;
  faqs?: FAQ[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  speciality_id: string;
  program_id?: string;
  language_code?: string;
  status?: "active" | "inactive";
  duration?: string;
  duration_number?: number;
  duration_unit?: string;
  faqs?: FAQ[];
  file?: File;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  speciality_id?: string;
  program_id?: string;
  language_code?: string;
  status?: "active" | "inactive";
  duration?: string;
  duration_number?: number;
  duration_unit?: string;
  price?: number;
  display_order?: number | string;
  faqs?: FAQ[];
  file?: File;
}

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
  specialityId?: string;
  programId?: string;
}

export interface CoursesListResponse {
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const coursesApi = {
  async create(data: CreateCourseData): Promise<Course> {
    const formData = new FormData();
    
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("speciality_id", data.speciality_id);
    if (data.program_id) formData.append("program_id", data.program_id);
    if (data.language_code) formData.append("language_code", data.language_code);
    if (data.status) formData.append("status", data.status);
    if (data.duration) formData.append("duration", data.duration);
    if (data.duration_number !== undefined) formData.append("duration_number", data.duration_number.toString());
    if (data.duration_unit) formData.append("duration_unit", data.duration_unit);
    if (data.faqs) formData.append("faqs", JSON.stringify(data.faqs));
    if (data.file) formData.append("file", data.file);

    const response = await apiClient.post("/knowledge-base/courses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async list(params?: ListCoursesParams): Promise<CoursesListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.specialityId) queryParams.append("specialityId", params.specialityId);
    if (params?.programId) queryParams.append("programId", params.programId);

    const response = await apiClient.get(`/knowledge-base/courses?${queryParams.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Course> {
    const response = await apiClient.get(`/knowledge-base/courses/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateCourseData): Promise<Course> {
    const formData = new FormData();
    
    if (data.title) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.speciality_id) formData.append("speciality_id", data.speciality_id);
    if (data.program_id !== undefined) formData.append("program_id", data.program_id);
    if (data.language_code !== undefined) formData.append("language_code", data.language_code);
    if (data.status) formData.append("status", data.status);
    if (data.duration !== undefined) formData.append("duration", data.duration);
    if (data.duration_number !== undefined) {
      formData.append("duration_number", data.duration_number.toString());
    }
    if (data.duration_unit !== undefined) {
      formData.append("duration_unit", data.duration_unit);
    }
    if (data.price !== undefined) formData.append("price", data.price.toString());
    if (data.faqs) formData.append("faqs", JSON.stringify(data.faqs));
    if (data.file) formData.append("file", data.file);

    const response = await apiClient.put(`/knowledge-base/courses/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/knowledge-base/courses/${id}`);
    return response.data;
  },

  async restore(id: string): Promise<Course> {
    const response = await apiClient.patch(`/knowledge-base/courses/${id}/restore`);
    return response.data;
  },

  async toggleStatus(id: string): Promise<Course> {
    const response = await apiClient.patch(`/knowledge-base/courses/${id}/toggle-status`);
    return response.data;
  },
};
