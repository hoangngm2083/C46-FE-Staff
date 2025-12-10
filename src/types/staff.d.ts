declare global {
  interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    description: string;
    image: string;
    role: number;
    eSignature: string;
    departmentId: string;
    departmentName: string;
  }

  interface Department {
    id: string;
    name: string;
    description: string;
  }

  interface CreateStaffRequest {
    name: string;
    email: string;
    phone?: string;
    description?: string;
    image?: string;
    role: number;
    eSignature?: string;
    departmentId?: string;
    accountName: string;
    password: string;
  }

  interface UpdateStaffRequest {
    name: string;
    phone?: string;
    description?: string;
    image?: string;
    role: number;
    eSignature?: string;
    departmentId: string;
  }

  interface DateOffRequest {
    date: string; // ISO date string
    shift: "MORNING" | "AFTERNOON" | "EVENING";
    reason?: string;
  }

  interface RequestDayOffsRequest {
    dayOffs: DateOffRequest[];
  }

  interface CreateDepartmentRequest {
    name: string;
    description?: string;
  }

  interface GetAllStaffsParams {
    keyword?: string;
    role?: number;
    departmentId?: string;
    sortBy?: string;
    sort?: "ASC" | "DESC";
    page?: number;
    size?: number;
  }

  interface GetAllDepartmentsParams {
    page?: number;
    size?: number;
    keyword?: string;
  }

  interface GetStaffScheduleParams {
    month: number;
    year: number;
  }
}

export {};
