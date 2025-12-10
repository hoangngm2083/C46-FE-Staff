import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

const useBookingService = ({
  medicalPackageId,
  bookingId,
  appointmentId,
  appointmentsParams,
  slotsParams,
}: {
  medicalPackageId?: string;
  bookingId?: string;
  appointmentId?: string;
  appointmentsParams?: ISearchAppointmentsParams;
  slotsParams?: { size?: number; page?: number };
}) => {
  const queryClient = useQueryClient();

  // Booking mutations (existing)
  const booking = useMutation({
    mutationFn: (args: ICreateBookingArgs) =>
      axiosInstance
        .post<{
          bookingId: string;
        }>("/booking", args)
        .then((res) => res.data),
  });

  // Booking status query (existing)
  const bookingStatus = useQuery({
    queryKey: ["checkBookingStatus", bookingId],
    queryFn: () => {
      return axiosInstance
        .get<{
          bookingStatus: IBookingStatus;
        }>(`/booking/${bookingId}/status`)
        .then((res) => res.data);
    },
    enabled: !!bookingId,
    refetchInterval: 5000,
  });

  // Slots queries
  const slots = useQuery({
    queryKey: ["slots", medicalPackageId, slotsParams],
    queryFn: () =>
      axiosInstance
        .get<Pagination<ISlot>>("/slot", {
          params: { size: 5, ...slotsParams, medicalPackageId },
        })
        .then((res) => res.data),
    enabled: !!medicalPackageId,
  });

  const createSlot = useMutation({
    mutationFn: (args: ICreateSlotRequest) =>
      axiosInstance
        .post<{
          slotId: string;
        }>("/slot", args)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });

  const updateSlot = useMutation({
    mutationFn: ({
      slotId,
      maxQuantity,
    }: {
      slotId: string;
      maxQuantity: number;
    }) =>
      axiosInstance
        .patch(`/slot/${slotId}`, { maxQuantity })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });

  // Appointment queries
  const appointments = useQuery({
    queryKey: ["appointments", appointmentsParams],
    queryFn: () =>
      axiosInstance
        .get<Pagination<IAppointment>>("/appointments", {
          params: { size: 5, ...appointmentsParams },
        })
        .then((res) => res.data),
    enabled: !!appointmentsParams,
  });

  const appointment = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () =>
      axiosInstance
        .get<IAppointmentDetails>(`/appointments/${appointmentId}`)
        .then((res) => res.data),
    enabled: !!appointmentId,
  });

  // Appointment mutations
  const createAppointment = useMutation({
    mutationFn: (args: ICreateAppointmentRequest) =>
      axiosInstance
        .post<{
          appointmentId: string;
        }>("/appointments", args)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });

  const updateAppointmentState = useMutation({
    mutationFn: ({
      appointmentId,
      state,
    }: {
      appointmentId: string;
      state: AppointmentState;
    }) =>
      axiosInstance
        .patch(`/appointments/${appointmentId}`, state)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: (appointmentId: string) =>
      axiosInstance.delete(`/appointments/${appointmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });

  return {
    // Booking
    booking,
    bookingStatus,
    // Slots
    slots,
    createSlot,
    updateSlot,
    // Appointments
    appointments,
    appointment,
    createAppointment,

    updateAppointmentState,
    deleteAppointment,
  };
};

export default useBookingService;
