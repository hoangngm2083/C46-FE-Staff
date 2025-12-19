import useStaffService from "@/services/staffService";
import { X, Save, Layout } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface MedicalServiceFormModalProps {
  isOpen: boolean;
  title: string;
  formData: CreateMedicalServiceRequest | UpdateMedicalServiceRequest;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    data: Partial<CreateMedicalServiceRequest | UpdateMedicalServiceRequest>
  ) => void;
}

export default function MedicalServiceFormModal({
  isOpen,
  title,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}: MedicalServiceFormModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const { departments } = useStaffService({
    departmentsParams: { size: 1000 },
  });
  const getFormSchema = () => {
    try {
      return formData.formTemplate
        ? JSON.parse(formData.formTemplate)
        : { display: "form" };
    } catch (e) {
      console.error("Invalid JSON in formTemplate", e);
      return { display: "form" };
    }
  };

  const handleBuilderChange = (schema: any) => {
    onChange({ formTemplate: JSON.stringify(schema) });
  };

  // Listen for messages from iframe
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "formio-ready") {
        setIsIframeReady(true);
        // Send initial schema to iframe
        const schema = getFormSchema();
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "formio-init",
            schema: schema,
          },
          "*"
        );
      } else if (event.data.type === "formio-schema-change") {
        handleBuilderChange(event.data.schema);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, formData.formTemplate]);

  // Update iframe when formTemplate changes externally
  useEffect(() => {
    if (!isOpen) return;

    if (isIframeReady && iframeRef.current) {
      const schema = getFormSchema();
      iframeRef.current.contentWindow?.postMessage(
        {
          type: "formio-init",
          schema: schema,
        },
        "*"
      );
    }
  }, [isOpen, formData.formTemplate, isIframeReady]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Layout className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Đang lưu..." : "Lưu dịch vụ"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Basic Info */}
          <div className="w-80 bg-slate-800 border-r border-white/10 overflow-y-auto p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Thông tin cơ bản
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên dịch vụ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Nhập tên dịch vụ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mô tả <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                  placeholder="Mô tả dịch vụ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phòng ban <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => onChange({ departmentId: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option className="text-black" value="">
                    -- Chọn phòng ban --
                  </option>
                  {departments.data?.content.map((dept) => (
                    <option
                      key={dept.id}
                      className="text-black"
                      value={dept.id}
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Độ ưu tiên <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.processingPriority}
                  onChange={(e) =>
                    onChange({ processingPriority: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Main Area - Form Builder */}
          <div className="flex-1 bg-white overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">
                Thiết kế biểu mẫu khám
              </h3>
              <span className="text-xs text-slate-500">
                Kéo thả các trường từ bên phải vào form
              </span>
            </div>
            <div className="flex-1 h-full relative">
              <iframe
                ref={iframeRef}
                src="/formio-builder.html"
                className="w-full h-full border-0"
                title="Form Builder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
