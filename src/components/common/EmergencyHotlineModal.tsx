import React from 'react';
import { Phone, X, AlertTriangle } from 'lucide-react';

interface HotlineItem {
  number: string;
  nameTh: string;
  agency: string;
  service: string;
  is24h: boolean;
  color: string;
}

const HOTLINES: HotlineItem[] = [
  {
    number: '1784',
    nameTh: 'สายด่วน ปภ.',
    agency: 'กรมป้องกันและบรรเทาสาธารณภัย',
    service: 'รับแจ้งเหตุและประสานงานช่วยเหลือสาธารณภัยทุกประเภท',
    is24h: true,
    color: 'from-rose-500 to-red-600',
  },
  {
    number: '1669',
    nameTh: 'ศูนย์กู้ชีพการแพทย์ฉุกเฉิน',
    agency: 'สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.)',
    service: 'เจ็บป่วยฉุกเฉิน อุบัติเหตุรุนแรง รถพยาบาลกู้ชีพ',
    is24h: true,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    number: '1182',
    nameTh: 'สายด่วน กรมอุตุนิยมวิทยา',
    agency: 'กรมอุตุนิยมวิทยา',
    service: 'สอบถามพยากรณ์อากาศ เส้นทางพายุ เรดาร์ฝน',
    is24h: true,
    color: 'from-sky-500 to-blue-600',
  },
  {
    number: '192',
    nameTh: 'ศูนย์เตือนภัยพิบัติแห่งชาติ',
    agency: 'กระทรวงมหาดไทย / ปภ.',
    service: 'รายงานเหตุแผ่นดินไหว สึนามิ และภัยธรรมชาติรุนแรง',
    is24h: true,
    color: 'from-amber-500 to-orange-600',
  },
  {
    number: '1586',
    nameTh: 'สายด่วน กรมทางหลวง',
    agency: 'กรมทางหลวง กระทรวงคมนาคม',
    service: 'รายงานถนนขาด น้ำท่วมทางหลวง ดินสไลด์ขวางทาง',
    is24h: true,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    number: '1362',
    nameTh: 'สายด่วน ดับไฟป่า',
    agency: 'กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช',
    service: 'แจ้งเบาะแสการเผาป่า และเหตุไฟป่าลุกลาม',
    is24h: true,
    color: 'from-orange-500 to-rose-600',
  },
  {
    number: '1460',
    nameTh: 'ศูนย์ปฏิบัติการน้ำอัจฉริยะ',
    agency: 'กรมชลประทาน',
    service: 'สอบถามสถานการณ์น้ำ ระดับน้ำในเขื่อน และการระบายน้ำ',
    is24h: true,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    number: '1129',
    nameTh: 'สายด่วน กฟภ. (PEA)',
    agency: 'การไฟฟ้าส่วนภูมิภาค',
    service: 'แจ้งไฟฟ้าดับ เสาไฟล้ม น้ำท่วมมิเตอร์ไฟฟ้า',
    is24h: true,
    color: 'from-violet-500 to-purple-700',
  },
];

interface EmergencyHotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyHotlineModal: React.FC<EmergencyHotlineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                สายด่วนแจ้งเหตุฉุกเฉิน
                <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  โทรฟรี 24 ชม.
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                เบอร์ติดต่อหน่วยงานรับมือภัยพิบัติและกู้ชีพประเทศไทย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOTLINES.map((hotline) => (
              <a
                key={hotline.number}
                href={`tel:${hotline.number}`}
                className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 transition-all shadow-xs hover:shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                        {hotline.number}
                      </span>
                      {hotline.is24h && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                          24 ชม.
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 mt-0.5">{hotline.nameTh}</h3>
                    <p className="text-[11px] text-slate-500">{hotline.agency}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-sky-600 group-hover:text-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 border-t border-slate-200/80 pt-2 mt-1">
                  {hotline.service}
                </p>
              </a>
            ))}
          </div>

          {/* Emergency reminder */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              ในกรณีเกิดเหตุฉุกเฉินวิกฤตที่มีผู้บาดเจ็บหรือติดค้างในพื้นที่เสี่ยง ให้โทรแจ้ง <strong>1784 (ปภ.)</strong> หรือ <strong>1669 (กู้ชีพ)</strong> เป็นอันดับแรก และแจ้งพิกัดสถานที่ให้ชัดเจนที่สุด
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
