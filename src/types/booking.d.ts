declare global {
    type Shift = 0 | 1 // 0: Morning, 1: Afternoon
    
    type AppointmentState = 'CREATED' | 'CANCELED' | 'NO_SHOWED' | 'SHOWED'
    
    type ICreateBookingArgs = {
        slotId: string
        name: string
        email: string
        phone: string
    }

    type ISlot = {
        slotId: string
        medicalPackageId: string
        date: string
        shift: Shift
        maxQuantity: number
        remainingQuantity: number
    }

    type IBookingStatus = {
        createdAt?: string
        updatedAt?: string
        deletedAt?: string
        bookingId: string
        appointmentId: string
        status: 'PENDING' | 'APPROVED' | 'REJECTED'
        message?: 'TIMEOUT'
    }

    type IServiceDto = {
        id: string
        name: string
    }

    type IAppointment = {
        id: string
        patientId: string
        patientName: string
        shift: Shift
        date: string // LocalDate as ISO string
        medicalPackageId: string
        medicalPackageName: string
        state: AppointmentState
        createdAt: string // LocalDateTime as ISO string
        updatedAt: string // LocalDateTime as ISO string
    }

    type IAppointmentDetails = IAppointment & {
        services: IServiceDto[]
    }

    type ICreateAppointmentRequest = {
        patientId: string
        slotId: string
    }

    type ICreateSlotRequest = {
        shift: Shift
        date: string // LocalDate as ISO string
        medicalPackageId: string
        maxQuantity: number
    }

    type ISearchAppointmentsParams = {
        page?: number
        size?: number
        sortBy?: string
        sort?: 'ASC' | 'DESC'
        keyword?: string
        state?: AppointmentState
        dateFrom?: string // LocalDate as ISO string
        dateTo?: string // LocalDate as ISO string
    }
}

export {}
