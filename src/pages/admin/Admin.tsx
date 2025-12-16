import { useState } from "react";
import {
  UserCog,
  Users,
  UserPlus,
  Building2,
  Package,
  Stethoscope,
} from "lucide-react";
import LogoutButton from "../../components/LogoutButton";
import StatsCard from "./components/StatsCard";
import SearchFilter from "./components/SearchFilter";
import StaffTable from "./components/StaffTable";
import DepartmentTable from "./components/DepartmentTable";
import MedicalPackageTable from "./components/MedicalPackageTable";
import MedicalServiceTable from "./components/MedicalServiceTable";
import MedicalPackageDetailView from "./components/MedicalPackageDetailView";
import Pagination from "./components/Pagination";
import StaffFormModal from "./components/StaffFormModal";
import DepartmentFormModal from "./components/DepartmentFormModal";
import MedicalPackageFormModal from "./components/MedicalPackageFormModal";
import MedicalServiceFormModal from "./components/MedicalServiceFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import useStaffService from "../../services/staffService";
import useMedicalPackageService from "../../services/medicalPackageService";
import useAuthService from "@/services/authService";
import toast from "react-hot-toast";

type TabType = "staff" | "department" | "medical-package" | "medical-service";

export default function Admin() {
  const { account } = useAuthService();
  const [activeTab, setActiveTab] = useState<TabType>("staff");
  const [staffSearchKeyword, setStaffSearchKeyword] = useState("");
  const [departmentSearchKeyword, setDepartmentSearchKeyword] = useState("");
  const [medicalPackageSearchKeyword, setMedicalPackageSearchKeyword] =
    useState("");
  const [medicalServiceSearchKeyword, setMedicalServiceSearchKeyword] =
    useState("");
  const [selectedRole, setSelectedRole] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedMedicalPackage, setSelectedMedicalPackage] =
    useState<IMedicalPackage | null>(null);
  const [selectedMedicalService, setSelectedMedicalService] =
    useState<MedicalServiceDTO | null>(null);
  const [showMedicalPackageDetail, setShowMedicalPackageDetail] =
    useState(false);
  const [selectedMedicalPackageId, setSelectedMedicalPackageId] = useState<
    string | undefined
  >(undefined);

  // Fetch staffs with filters
  const {
    staffs,
    departments,
    createStaff,
    updateStaff,
    deleteStaff,
    createDepartment,
    deleteDepartment,
  } = useStaffService({
    staffsParams:
      activeTab === "staff"
        ? {
            keyword: staffSearchKeyword || undefined,
            role: selectedRole,
            page: currentPage,
            sort: "ASC",
          }
        : { page: 1, sort: "ASC" },
    departmentsParams:
      activeTab === "department"
        ? { page: currentPage, keyword: departmentSearchKeyword || undefined }
        : activeTab === "medical-service"
        ? { page: 1, keyword: undefined }
        : { page: 1 },
  });

  const {
    medicalPackages,
    medicalPackage,
    medicalServices,
    getMedicalService,
    createMedicalPackage,
    createMedicalService,
    updateMedicalPackageInfo,
    updateMedicalPackagePrice,
    deleteMedicalPackage,
    updateMedicalService,
    deleteMedicalService,
  } = useMedicalPackageService({
    medicalPackagesParams:
      activeTab === "medical-package"
        ? {
            page: currentPage,
            keyword: medicalPackageSearchKeyword || undefined,
            sort: "ASC",
          }
        : { page: 1, sort: "ASC" },
    medicalServicesParams:
      activeTab === "medical-service"
        ? {
            page: currentPage,
            keyword: medicalServiceSearchKeyword || undefined,
          }
        : { page: 1 },
    medicalPackageId: selectedMedicalPackageId,
    medicalServiceId: selectedMedicalService?.medicalServiceId ?? undefined,
  });

  // Form state for create/edit staff
  const [staffFormData, setStaffFormData] = useState<CreateStaffRequest>({
    name: "",
    email: "",
    phone: "",
    description: "",
    image: "",
    role: 0,
    eSignature: "",
    departmentId: "",
    accountName: "",
    password: "",
  });

  // Form state for create/edit department
  const [departmentFormData, setDepartmentFormData] =
    useState<CreateDepartmentRequest>({
      name: "",
      description: "",
    });

  // Form state for create/edit medical package
  const [medicalPackageFormData, setMedicalPackageFormData] =
    useState<CreateMedicalPackageRequest>({
      name: "",
      description: "",
      serviceIds: [],
      price: null,
      image: "",
    });

  // Form state for create/edit medical service
  const [medicalServiceFormData, setMedicalServiceFormData] = useState<
    CreateMedicalServiceRequest | UpdateMedicalServiceRequest
  >({
    name: "",
    description: "",
    departmentId: "",
    processingPriority: 1,
    formTemplate: "",
  });

  // Staff handlers
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff.mutateAsync(staffFormData);
      setShowCreateModal(false);
      resetStaffForm();
      staffs.refetch();
    } catch (error: any) {
      console.error("Error creating staff:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo nhân viên");
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      await updateStaff.mutateAsync({
        staffId: selectedStaff.id,
        request: {
          name: staffFormData.name,
          phone: staffFormData.phone,
          description: staffFormData.description,
          image: staffFormData.image,
          role: staffFormData.role,
          eSignature: staffFormData.eSignature,
          departmentId: staffFormData.departmentId || "",
        },
      });
      setShowEditModal(false);
      setSelectedStaff(null);
      resetStaffForm();
      staffs.refetch();
    } catch (error: any) {
      console.error("Error updating staff:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật nhân viên"
      );
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      await deleteStaff.mutateAsync(selectedStaff.id);
      setShowDeleteModal(false);
      setSelectedStaff(null);
      staffs.refetch();
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  // Department handlers
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDepartment.mutateAsync(departmentFormData);
      setShowCreateModal(false);
      resetDepartmentForm();
      departments.refetch();
    } catch (error) {
      console.error("Error creating department:", error);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      await deleteDepartment.mutateAsync(selectedDepartment.id);
      setShowDeleteModal(false);
      setSelectedDepartment(null);
      departments.refetch();
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const resetStaffForm = () => {
    setStaffFormData({
      name: "",
      email: "",
      phone: "",
      description: "",
      image: "",
      role: 0,
      eSignature: "",
      departmentId: "",
      accountName: "",
      password: "",
    });
  };

  const resetDepartmentForm = () => {
    setDepartmentFormData({
      name: "",
      description: "",
    });
  };

  const resetMedicalPackageForm = () => {
    setMedicalPackageFormData({
      name: "",
      description: "",
      serviceIds: [],
      price: null,
      image: "",
    });
  };

  const resetMedicalServiceForm = () => {
    setMedicalServiceFormData({
      name: "",
      description: "",
      departmentId: "",
      processingPriority: 1,
      formTemplate: "",
    });
  };

  // Medical Package handlers
  const handleCreateMedicalPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMedicalPackage.mutateAsync(medicalPackageFormData);
      setShowCreateModal(false);
      resetMedicalPackageForm();
      medicalPackages.refetch();
    } catch (error) {
      console.error("Error creating medical package:", error);
    }
  };

  const handleUpdateMedicalPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicalPackage) return;

    try {
      await Promise.all([
        updateMedicalPackageInfo.mutateAsync({
          id: selectedMedicalPackage.medicalPackageId,
          request: {
            name: medicalPackageFormData.name,
            description: medicalPackageFormData.description,
            image: medicalPackageFormData.image,
            serviceIds: medicalPackageFormData.serviceIds,
          },
        }),
        updateMedicalPackagePrice.mutateAsync({
          id: selectedMedicalPackage.medicalPackageId,
          request: {
            price: medicalPackageFormData.price ?? 0,
          },
        }),
      ]);
      setShowEditModal(false);
      setSelectedMedicalPackage(null);
      resetMedicalPackageForm();
      medicalPackages.refetch();
    } catch (error) {
      console.error("Error updating medical package:", error);
    }
  };

  const handleDeleteMedicalPackage = async () => {
    if (!selectedMedicalPackage) return;

    try {
      await deleteMedicalPackage.mutateAsync(
        selectedMedicalPackage.medicalPackageId
      );
      setShowDeleteModal(false);
      setSelectedMedicalPackage(null);
      medicalPackages.refetch();
    } catch (error) {
      console.error("Error deleting medical package:", error);
    }
  };

  // Medical Service handlers
  const handleCreateMedicalService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMedicalService.mutateAsync(medicalServiceFormData);
      setShowCreateModal(false);
      resetMedicalServiceForm();
      medicalServices.refetch();
    } catch (error) {
      console.error("Error creating medical service:", error);
    }
  };

  const handleUpdateMedicalService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicalService) return;

    try {
      await updateMedicalService.mutateAsync({
        id: selectedMedicalService.medicalServiceId,
        request: {
          name: medicalServiceFormData.name,
          description: medicalServiceFormData.description,
          departmentId: medicalServiceFormData.departmentId,
          processingPriority: medicalServiceFormData.processingPriority,
          formTemplate: medicalServiceFormData.formTemplate,
        },
      });
      setShowEditModal(false);
      resetMedicalServiceForm();
      medicalServices.refetch();
    } catch (error) {
      console.error("Error updating medical service:", error);
    }
  };

  const handleDeleteMedicalService = async () => {
    if (!selectedMedicalService) return;

    try {
      await deleteMedicalService.mutateAsync(
        selectedMedicalService.medicalServiceId
      );
      setShowDeleteModal(false);
      setSelectedMedicalService(null);

      medicalServices.refetch();
    } catch (error) {
      console.error("Error deleting medical service:", error);
    }
  };

  const openEditStaffModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setStaffFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      description: staff.description,
      image: staff.image,
      role: staff.role,
      eSignature: staff.eSignature,
      departmentId: staff.departmentId,
      accountName: account.data?.accountName || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const openDeleteStaffModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const openEditDepartmentModal = (department: Department) => {
    setSelectedDepartment(department);
    setDepartmentFormData({
      name: department.name,
      description: department.description || "",
    });
    setShowEditModal(true);
  };

  const openDeleteDepartmentModal = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const openEditMedicalPackageModal = (pkg: IMedicalPackage) => {
    setSelectedMedicalPackage(pkg);
    setMedicalPackageFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price ?? null,
      image: pkg.image || "",
      serviceIds: pkg.services?.map((s) => s.medicalServiceId) || [],
    });
    setShowEditModal(true);
  };

  const openDeleteMedicalPackageModal = (pkg: IMedicalPackage) => {
    setSelectedMedicalPackage(pkg);
    setShowDeleteModal(true);
  };

  const openMedicalPackageDetailView = (pkg: IMedicalPackage) => {
    setSelectedMedicalPackageId(pkg.medicalPackageId);
    setShowMedicalPackageDetail(true);
  };

  const closeMedicalPackageDetailView = () => {
    setShowMedicalPackageDetail(false);
    setSelectedMedicalPackageId(undefined);
  };

  const openEditMedicalServiceModal = async (service: MedicalServiceDTO) => {
    setSelectedMedicalService(service);
    try {
      const serviceDetail = await getMedicalService(service.medicalServiceId);
      setMedicalServiceFormData({
        name: serviceDetail.name,
        description: serviceDetail.description,
        departmentId: serviceDetail.departmentId,
        processingPriority: serviceDetail.processingPriority,
        formTemplate: serviceDetail.formTemplate || "",
      });
      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching service detail:", error);
    }
  };

  const openDeleteMedicalServiceModal = (service: MedicalServiceDTO) => {
    setSelectedMedicalService(service);
    setShowDeleteModal(true);
  };

  const handleStaffFormChange = (
    data: Partial<CreateStaffRequest | UpdateStaffRequest>
  ) => {
    setStaffFormData((prev) => ({ ...prev, ...data }));
  };

  const handleDepartmentFormChange = (
    data: Partial<CreateDepartmentRequest>
  ) => {
    setDepartmentFormData((prev) => ({ ...prev, ...data }));
  };

  const handleMedicalPackageFormChange = (
    data: Partial<CreateMedicalPackageRequest>
  ) => {
    setMedicalPackageFormData((prev) => ({ ...prev, ...data }));
  };

  const handleMedicalServiceFormChange = (
    data: Partial<CreateMedicalServiceRequest>
  ) => {
    setMedicalServiceFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <UserCog className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Bảng điều khiển quản trị viên
              </h1>
              <p className="text-sm text-slate-400">
                {/* {account?.displayName || "Admin"} */}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            iconColor="text-blue-400"
            title="Tổng số nhân viên"
            value={staffs.data?.total || 0}
            subtitle="Nhân viên đang hoạt động"
          />

          <StatsCard
            icon={Building2}
            iconColor="text-green-400"
            title="Tổng số phòng ban"
            value={departments.data?.total || 0}
            subtitle="Phòng ban hoạt động"
          />

          <StatsCard
            icon={Package}
            iconColor="text-purple-400"
            title="Tổng số gói khám"
            value={medicalPackages.data?.total || 0}
            subtitle="Gói khám có sẵn"
          />

          <StatsCard
            icon={Stethoscope}
            iconColor="text-orange-400"
            title="Tổng số dịch vụ"
            value={medicalServices.data?.total || 0}
            subtitle="Dịch vụ y tế"
          />
        </div>

        {/* Tabs with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab("staff");
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "staff"
                  ? "bg-cyan-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Nhân viên</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("department");
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "department"
                  ? "bg-green-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Phòng ban</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("medical-package");
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "medical-package"
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Gói khám</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("medical-service");
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "medical-service"
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Dịch vụ</span>
              </div>
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>
              {activeTab === "staff"
                ? "Thêm nhân viên"
                : activeTab === "department"
                ? "Thêm phòng ban"
                : activeTab === "medical-package"
                ? "Thêm gói khám"
                : "Thêm dịch vụ"}
            </span>
          </button>
        </div>

        {/* Search and Filter - Only show for staff tab */}
        {activeTab === "staff" && (
          <SearchFilter
            searchKeyword={staffSearchKeyword}
            selectedRole={selectedRole}
            onSearchChange={setStaffSearchKeyword}
            onRoleChange={setSelectedRole}
            onClearFilters={() => {
              setStaffSearchKeyword("");
              setSelectedRole(undefined);
              setCurrentPage(1);
            }}
          />
        )}

        {/* Search for Department */}
        {activeTab === "department" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
            <h2 className="text-xl font-bold mb-4">Tìm kiếm phòng ban</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên phòng ban..."
                value={departmentSearchKeyword}
                onChange={(e) => setDepartmentSearchKeyword(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={() => {
                  setDepartmentSearchKeyword("");
                  setCurrentPage(1);
                }}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* Search for Medical Package */}
        {activeTab === "medical-package" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
            <h2 className="text-xl font-bold mb-4">Tìm kiếm gói khám</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên gói khám..."
                value={medicalPackageSearchKeyword}
                onChange={(e) => setMedicalPackageSearchKeyword(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={() => {
                  setMedicalPackageSearchKeyword("");
                  setCurrentPage(1);
                }}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* Search for Medical Service */}
        {activeTab === "medical-service" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
            <h2 className="text-xl font-bold mb-4">Tìm kiếm dịch vụ</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên dịch vụ..."
                value={medicalServiceSearchKeyword}
                onChange={(e) => setMedicalServiceSearchKeyword(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={() => {
                  setMedicalServiceSearchKeyword("");
                  setCurrentPage(1);
                }}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">
            {activeTab === "staff"
              ? "Danh sách nhân viên"
              : activeTab === "department"
              ? "Danh sách phòng ban"
              : activeTab === "medical-package"
              ? "Danh sách gói khám"
              : "Danh sách dịch vụ"}
          </h2>

          {activeTab === "staff" ? (
            <>
              <StaffTable
                staffsQuery={staffs}
                onEdit={openEditStaffModal}
                onDelete={openDeleteStaffModal}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={staffs.data?.totalPages || 1}
                onPageChange={setCurrentPage}
              />
            </>
          ) : activeTab === "department" ? (
            <>
              <DepartmentTable
                departmentsQuery={departments}
                onEdit={openEditDepartmentModal}
                onDelete={openDeleteDepartmentModal}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={departments.data?.totalPages || 1}
                onPageChange={setCurrentPage}
              />
            </>
          ) : activeTab === "medical-package" ? (
            <>
              {showMedicalPackageDetail && medicalPackage.data ? (
                <MedicalPackageDetailView
                  packageData={medicalPackage.data}
                  onBack={closeMedicalPackageDetailView}
                />
              ) : (
                <>
                  <MedicalPackageTable
                    packagesQuery={medicalPackages}
                    onEdit={openEditMedicalPackageModal}
                    onDelete={openDeleteMedicalPackageModal}
                    onViewDetail={openMedicalPackageDetailView}
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={medicalPackages.data?.totalPages || 1}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {medicalServices.isLoading || medicalServices.isRefetching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
              ) : (
                <>
                  <MedicalServiceTable
                    services={medicalServices.data?.content || []}
                    onEdit={openEditMedicalServiceModal}
                    onDelete={openDeleteMedicalServiceModal}
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={medicalServices.data?.totalPages || 1}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals for Staff */}
      {activeTab === "staff" && (
        <>
          <StaffFormModal
            isOpen={showCreateModal}
            title="Tạo nhân viên mới"
            formData={staffFormData}
            isSubmitting={createStaff.isPending}
            showEmailField={true}
            onClose={() => {
              setShowCreateModal(false);
              resetStaffForm();
            }}
            onSubmit={handleCreateStaff}
            onChange={handleStaffFormChange}
          />

          <StaffFormModal
            isOpen={showEditModal && !!selectedStaff}
            title="Chỉnh sửa nhân viên"
            formData={staffFormData}
            isSubmitting={updateStaff.isPending}
            showEmailField={false}
            onClose={() => {
              setShowEditModal(false);
              setSelectedStaff(null);
              resetStaffForm();
            }}
            onSubmit={handleUpdateStaff}
            onChange={handleStaffFormChange}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal && !!selectedStaff}
            staffName={selectedStaff?.name || ""}
            isDeleting={deleteStaff.isPending}
            onConfirm={handleDeleteStaff}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedStaff(null);
            }}
          />
        </>
      )}

      {/* Modals for Department */}
      {activeTab === "department" && (
        <>
          <DepartmentFormModal
            isOpen={showCreateModal}
            title="Tạo phòng ban mới"
            formData={departmentFormData}
            isSubmitting={createDepartment.isPending}
            onClose={() => {
              setShowCreateModal(false);
              resetDepartmentForm();
            }}
            onSubmit={handleCreateDepartment}
            onChange={handleDepartmentFormChange}
          />

          <DepartmentFormModal
            isOpen={showEditModal && !!selectedDepartment}
            title="Chỉnh sửa phòng ban"
            formData={departmentFormData}
            isSubmitting={false}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDepartment(null);
              resetDepartmentForm();
            }}
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement update department when API is ready
              setShowEditModal(false);
              setSelectedDepartment(null);
              resetDepartmentForm();
            }}
            onChange={handleDepartmentFormChange}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal && !!selectedDepartment}
            staffName={selectedDepartment?.name || ""}
            isDeleting={false}
            onConfirm={handleDeleteDepartment}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedDepartment(null);
            }}
          />
        </>
      )}

      {/* Modals for Medical Package */}
      {activeTab === "medical-package" && (
        <>
          <MedicalPackageFormModal
            isOpen={showCreateModal}
            title="Tạo gói khám mới"
            formData={medicalPackageFormData}
            isSubmitting={createMedicalPackage.isPending}
            services={medicalServices.data?.content || []}
            onClose={() => {
              setShowCreateModal(false);
              resetMedicalPackageForm();
            }}
            onSubmit={handleCreateMedicalPackage}
            onChange={handleMedicalPackageFormChange}
          />

          <MedicalPackageFormModal
            isOpen={showEditModal && !!selectedMedicalPackage}
            title="Chỉnh sửa gói khám"
            formData={medicalPackageFormData}
            isSubmitting={
              updateMedicalPackageInfo.isPending ||
              updateMedicalPackagePrice.isPending
            }
            services={medicalServices.data?.content || []}
            onClose={() => {
              setShowEditModal(false);
              setSelectedMedicalPackage(null);
              resetMedicalPackageForm();
            }}
            onSubmit={handleUpdateMedicalPackage}
            onChange={handleMedicalPackageFormChange}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal && !!selectedMedicalPackage}
            staffName={selectedMedicalPackage?.name || ""}
            isDeleting={deleteMedicalPackage.isPending}
            onConfirm={handleDeleteMedicalPackage}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedMedicalPackage(null);
            }}
          />
        </>
      )}

      {/* Modals for Medical Service */}
      {activeTab === "medical-service" && (
        <>
          <MedicalServiceFormModal
            isOpen={showCreateModal}
            title="Tạo dịch vụ mới"
            formData={medicalServiceFormData}
            isSubmitting={createMedicalService.isPending}
            onClose={() => {
              setShowCreateModal(false);
              resetMedicalServiceForm();
            }}
            onSubmit={handleCreateMedicalService}
            onChange={handleMedicalServiceFormChange}
          />

          <MedicalServiceFormModal
            isOpen={showEditModal && !!selectedMedicalService}
            title="Chỉnh sửa dịch vụ"
            formData={medicalServiceFormData}
            isSubmitting={updateMedicalService.isPending}
            onClose={() => {
              setShowEditModal(false);
              setSelectedMedicalService(null);
              resetMedicalServiceForm();
            }}
            onSubmit={handleUpdateMedicalService}
            onChange={handleMedicalServiceFormChange}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal && !!selectedMedicalService}
            staffName={selectedMedicalService?.name || ""}
            isDeleting={deleteMedicalService.isPending}
            onConfirm={handleDeleteMedicalService}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedMedicalService(null);
            }}
          />
        </>
      )}
    </div>
  );
}
