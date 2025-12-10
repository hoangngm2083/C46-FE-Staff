import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

const useStaffService = ({
  staffId,
  departmentId,
  staffsParams,
  departmentsParams,
  scheduleParams,
}: {
  staffId?: string;
  departmentId?: string;
  staffsParams?: GetAllStaffsParams;
  departmentsParams?: GetAllDepartmentsParams;
  scheduleParams?: GetStaffScheduleParams;
}) => {
  const queryClient = useQueryClient();

  // Staff Mutations
  const createStaff = useMutation({
    mutationFn: (request: CreateStaffRequest) =>
      axiosInstance.post<string>("/staff", request).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });

  const updateStaff = useMutation({
    mutationFn: ({
      staffId,
      request,
    }: {
      staffId: string;
      request: UpdateStaffRequest;
    }) =>
      axiosInstance
        .put<void>(`/staff/${staffId}`, request)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const requestDayOff = useMutation({
    mutationFn: ({
      staffId,
      request,
    }: {
      staffId: string;
      request: RequestDayOffsRequest;
    }) =>
      axiosInstance
        .post<void>(`/staff/${staffId}/day-off`, request)
        .then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff", variables.staffId] });
      queryClient.invalidateQueries({ queryKey: ["staffSchedule"] });
    },
  });

  const deleteStaff = useMutation({
    mutationFn: (staffId: string) =>
      axiosInstance
        .delete<void>(`/staff/${staffId}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });

  // Department Mutations
  const createDepartment = useMutation({
    mutationFn: (request: CreateDepartmentRequest) =>
      axiosInstance
        .post<{ departmentId: string }>("/department", request)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  // Department Mutations
  const deleteDepartment = useMutation({
    mutationFn: (departmentId: string) =>
      axiosInstance
        .delete<void>(`/department/${departmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  // Staff Queries
  const staffs = useQuery({
    queryKey: ["staffs", staffsParams],
    queryFn: () =>
      axiosInstance
        .get<Pagination<Staff>>("/staff", {
          params: { size: 5, ...staffsParams },
        })
        .then((res) => res.data),
    enabled: !!staffsParams,
  });

  const staff = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () =>
      axiosInstance.get<Staff>(`/staff/${staffId}`).then((res) => res.data),
    enabled: !!staffId,
  });

  const staffSchedule = useQuery({
    queryKey: ["staffSchedule", scheduleParams],
    queryFn: () =>
      axiosInstance
        .get<Staff[]>("/staff/schedule", {
          params: scheduleParams,
        })
        .then((res) => res.data),
    enabled: !!scheduleParams?.month && !!scheduleParams?.year,
  });

  // Department Queries
  const departments = useQuery({
    queryKey: ["departments", departmentsParams],
    queryFn: () =>
      axiosInstance
        .get<Pagination<Department>>("/department", {
          params: { size: 5, ...departmentsParams },
        })
        .then((res) => res.data),
    enabled: !!departmentsParams,
  });

  const department = useQuery({
    queryKey: ["department", departmentId],
    queryFn: () =>
      axiosInstance
        .get<Department>(`/department/${departmentId}`)
        .then((res) => res.data),
    enabled: !!departmentId,
  });

  return {
    // Mutations
    createStaff,
    updateStaff,
    requestDayOff,
    deleteStaff,
    createDepartment,
    deleteDepartment,

    // Queries
    staffs,
    staff,
    staffSchedule,
    departments,
    department,
  };
};

export default useStaffService;
