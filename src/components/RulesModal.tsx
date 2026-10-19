import React from 'react';
import { HelpCircle, X, CheckCircle2, ShieldCheck, Flame, Coffee, Laptop, Users } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">사다리타기 룰 & 대학생 꿀팁</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs text-slate-300 overflow-y-auto max-h-[75vh]">
          {/* Fairness Guarantee */}
          <div className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>100% 수학적 공정성 보장 (일대일 대응)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              사다리타기는 수학적으로 치환(Permutation) 알고리즘입니다. 어떤 사다리 모양이라도 참가자 n명은 반드시 서로 다른 n개의 결과에 1:1로만 도달하므로 중복이나 누락이 일절 발생하지 않습니다.
            </p>
          </div>

          {/* College Situation Tips */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              대학생 실전 꿀팁
            </h4>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-amber-300">
                <Laptop className="w-3.5 h-3.5" />
                <span>조별과제(팀플) 역할 분담</span>
              </div>
              <p className="text-slate-400">
                발표자나 PPT 제작자 정할 때 눈치싸움 하지 마세요! 사다리로 결정하면 뒤끝 없이 깔끔하게 분담됩니다.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-rose-300">
                <Users className="w-3.5 h-3.5" />
                <span>술자리/엠티: "다리 직접 그리기" 모드</span>
              </div>
              <p className="text-slate-400">
                시작 전 친구들과 돌아가며 가로줄을 1개씩 추가해보세요. 서로에게 벌칙을 넘기려는 치열한 심리전이 펼쳐집니다!
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-emerald-300">
                <Coffee className="w-3.5 h-3.5" />
                <span>커피/밥약 내기: "블라인드 모드"</span>
              </div>
              <p className="text-slate-400">
                사다리 모양과 결과를 안 보이게 가려두고 한 명씩 타보세요. 목적지에 도착하기 직전까지 심장이 쫄깃해집니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            확인했습니다!
          </button>
        </div>
      </div>
    </div>
  );
};
