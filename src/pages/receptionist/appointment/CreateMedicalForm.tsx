import { useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { useExaminationFlowService } from "@/services/examinationFlowService";
import {
  usePatientService,
  CreatePatientRequest,
  Patient,
} from "@/services/patientService";
import useMedicalPackageService from "@/services/medicalPackageService";

interface CreateMedicalFormProps {
  onSuccess: () => void;
}

export default function CreateMedicalForm({
  onSuccess,
}: CreateMedicalFormProps) {
  // Create Form State
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState<CreatePatientRequest>({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { searchPatients, createPatient } = usePatientService();
  const { data: patientsFound, isLoading: isSearching } =
    searchPatients(patientSearch);

  const { medicalPackages } = useMedicalPackageService({
    medicalPackagesParams: { size: 100 },
  });
  const { createMedicalForm } = useExaminationFlowService();

  const handleCreateMedicalFormSubmit = async () => {
    try {
      let patientId = selectedPatient?.patientId;

      if (isNewPatient) {
        if (!newPatientData.name || !newPatientData.phone) {
          toast.error("Vui lòng điền tên và số điện thoại bệnh nhân");
          return;
        }
        const newPatientId = await createPatient.mutateAsync(newPatientData);
        patientId = newPatientId;
      }

      if (!patientId) {
        toast.error("Vui lòng chọn hoặc tạo bệnh nhân");
        return;
      }

      if (!selectedPackageId || !selectedDate) {
        toast.error("Vui lòng chọn đầy đủ thông tin khám");
        return;
      }

      // 1. Create Appointment
      //   await createAppointment.mutateAsync({
      //     patientId,
      //     slotId: selectedSlotId,
      //   });

      // 2. Create Medical Form
      await createMedicalForm.mutateAsync({
        patientId,
        medicalPackageIds: [selectedPackageId],
      });

      toast.success("Tạo phiếu khám thành công");
      onSuccess();

      // Reset form
      setSelectedPatient(null);
      setIsNewPatient(false);
      setNewPatientData({ name: "", email: "", phone: "" });
      setSelectedPackageId("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo phiếu khám");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Tạo phiếu khám mới</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Section */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-cyan-400">
              Thông tin bệnh nhân
            </h3>
            <button
              onClick={() => {
                setIsNewPatient(!isNewPatient);
                setSelectedPatient(null);
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline"
            >
              {isNewPatient ? "Tìm bệnh nhân có sẵn" : "Tạo bệnh nhân mới"}
            </button>
          </div>

          {isNewPatient ? (
            <div className="space-y-4">
              <input
                placeholder="Họ và tên"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                value={newPatientData.name}
                onChange={(e) =>
                  setNewPatientData({ ...newPatientData, name: e.target.value })
                }
              />
              <input
                placeholder="Số điện thoại"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                value={newPatientData.phone}
                onChange={(e) =>
                  setNewPatientData({
                    ...newPatientData,
                    phone: e.target.value,
                  })
                }
              />
              <input
                placeholder="Email"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                value={newPatientData.email}
                onChange={(e) =>
                  setNewPatientData({
                    ...newPatientData,
                    email: e.target.value,
                  })
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  placeholder="Tìm kiếm theo tên hoặc SĐT..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>

              {isSearching && (
                <div className="text-center text-slate-400 py-2">
                  Đang tìm kiếm...
                </div>
              )}

              {patientsFound && patientsFound.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {patientsFound.map((p) => (
                    <div
                      key={p.patientId}
                      onClick={() => setSelectedPatient(p)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedPatient?.patientId === p.patientId
                          ? "bg-cyan-500/20 border-cyan-500"
                          : "bg-white/5 border-transparent hover:bg-white/10"
                      }`}
                    >
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-slate-400">
                        {p.phone} - {p.email}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!isSearching &&
                patientSearch &&
                (!patientsFound || patientsFound.length === 0) && (
                  <div className="text-center text-slate-400 py-2">
                    Không tìm thấy bệnh nhân
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Exam Info Section */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4">
            Thông tin khám
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Gói khám
              </label>
              <select
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
              >
                <option value="" className="text-black">
                  Chọn gói khám
                </option>
                {medicalPackages?.data?.content?.map((pkg) => (
                  <option
                    key={pkg.medicalPackageId}
                    value={pkg.medicalPackageId}
                    className="text-black"
                  >
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Ngày khám
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleCreateMedicalFormSubmit}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all"
        >
          Tạo phiếu khám
        </button>
      </div>
    </div>
  );
}
