declare global {
    interface Pagination<T> {
        content: T[]
        page: number
        size: number
        total: number
        totalPages: number
    }
}

export {}