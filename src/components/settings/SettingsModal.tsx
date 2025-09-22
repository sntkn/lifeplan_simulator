import React, { useEffect } from 'react';
import type { SimulationParams } from '../../types/simulation';
import { SettingsManager } from './SettingsManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimulationParams;
  onLoadSetting: (params: SimulationParams) => void;
}

/**
 * 設定管理機能をモーダルポップアップで表示するコンポーネント
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  params,
  onLoadSetting,
}) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) {
    return null;
  }

  // 背景クリックでモーダルを閉じる
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* ヘッダー部分 - 閉じるボタン */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            設定管理
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer"
            aria-label="モーダルを閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ部分 */}
        <div className="p-6">
          <SettingsManager
            params={params}
            onLoadSetting={onLoadSetting}
          />
        </div>
      </div>
    </div>
  );
};