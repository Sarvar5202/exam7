/**
 * NajotLoader — NAJOT CRM uchun global loading overlay komponenti
 *
 * Boshqarish API (global, istagan joydan chaqirish mumkin):
 *   NajotLoader.show()
 *   NajotLoader.hide()
 *   NajotLoader.setProgress(0-100)
 *   NajotLoader.setStatus("matn")
 *
 * Ishlatish:
 *   1. App.jsx yoki main.jsx ichida bitta marta: <NajotLoader />
 *   2. Istagan joyda import qilib: import NajotLoader from '.../NajotLoader';
 *      keyin: NajotLoader.show(); ... NajotLoader.hide();
 *
 * QOIDA: Mavjud Loader.jsx SAQLANADI — bu fayl uni almashtirmaydi.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import './najot-loader.css';

// ── Almashib turuvchi status matnlari ──────────────────────────────────────
const NAJOT_STATUS_MESSAGES = [
  "Ma'lumotlar yuklanmoqda...",
  "Iltimos kuting...",
  "Tizim tayyorlanmoqda...",
  "Deyarli tayyor...",
];

// ── Global boshqaruv obyekti (singleton pattern) ───────────────────────────
// NajotLoader.show() / NajotLoader.hide() / NajotLoader.setProgress() / NajotLoader.setStatus()
const _najotLoaderListeners = new Set();

const NajotLoader = {
  _visible: false,
  _progress: 0,
  _status: '',

  show() {
    this._visible = true;
    this._notify();
  },

  hide() {
    this._visible = false;
    this._progress = 0;
    this._status = '';
    this._notify();
  },

  setProgress(percent) {
    this._progress = Math.min(100, Math.max(0, Number(percent) || 0));
    this._notify();
  },

  setStatus(text) {
    this._status = String(text || '');
    this._notify();
  },

  _notify() {
    _najotLoaderListeners.forEach(fn => fn({
      visible: this._visible,
      progress: this._progress,
      status: this._status,
    }));
  },

  _subscribe(fn) {
    _najotLoaderListeners.add(fn);
    return () => _najotLoaderListeners.delete(fn);
  },
};

// ── React komponenti ───────────────────────────────────────────────────────
function NajotLoaderComponent() {
  const [njlState, setNjlState] = useState({
    visible: false,
    progress: 0,
    status: '',
  });

  // Auto-rotating status matnlari (faqat status bo'sh bo'lsa)
  const [njlAutoStatus, setNjlAutoStatus] = useState(NAJOT_STATUS_MESSAGES[0]);
  const njlAutoIdx = useRef(0);
  const njlIntervalRef = useRef(null);

  // Global listenerga ulanish
  useEffect(() => {
    const unsubscribe = NajotLoader._subscribe(setNjlState);
    return unsubscribe;
  }, []);

  // Auto-rotate status
  useEffect(() => {
    if (njlState.visible) {
      njlIntervalRef.current = setInterval(() => {
        njlAutoIdx.current = (njlAutoIdx.current + 1) % NAJOT_STATUS_MESSAGES.length;
        setNjlAutoStatus(NAJOT_STATUS_MESSAGES[njlAutoIdx.current]);
      }, 2200);
    } else {
      clearInterval(njlIntervalRef.current);
      njlAutoIdx.current = 0;
      setNjlAutoStatus(NAJOT_STATUS_MESSAGES[0]);
    }
    return () => clearInterval(njlIntervalRef.current);
  }, [njlState.visible]);

  const displayStatus = njlState.status || njlAutoStatus;

  return (
    <div
      className={`njl-overlay${njlState.visible ? '' : ' njl-hidden'}`}
      aria-live="polite"
      aria-busy={njlState.visible}
      role="status"
    >
      {/* Logo bloki */}
      <div className="njl-logo-wrap">
        <img
          src="/login.img.png"
          alt="Najot CRM"
          className="njl-logo-img"
          draggable={false}
        />
        <div className="njl-logo-title">
          Najot<span>CRM</span>
          <div className="njl-shimmer" aria-hidden="true" />
        </div>
      </div>

      {/* Subtitle */}
      <div className="njl-subtitle">Platform yuklanmoqda</div>

      {/* Equalizer */}
      <div className="njl-equalizer" aria-hidden="true">
        <div className="njl-bar" />
        <div className="njl-bar" />
        <div className="njl-bar" />
        <div className="njl-bar" />
        <div className="njl-bar" />
      </div>

      {/* Progress */}
      <div className="njl-progress-wrap">
        <div className="njl-progress-track">
          <div
            className="njl-progress-fill"
            style={{ width: `${njlState.progress}%` }}
          />
        </div>
        <div className="njl-percent">{njlState.progress}%</div>
      </div>

      {/* Status matni */}
      <div className="njl-status">{displayStatus}</div>
    </div>
  );
}

// ── Eksport ────────────────────────────────────────────────────────────────
// Default export — komponent (App.jsx ga qo'shish uchun)
// Named export - NajotLoader singleton (API chaqirish uchun)
export { NajotLoader };
export default NajotLoaderComponent;
