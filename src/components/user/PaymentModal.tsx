import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { uploadPaymentScreenshot, validateFile } from '../../api/storage';
import { PaymentSettings, PackageOffer } from '../../types';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Zap,
  Crown,
  ShieldCheck,
  Clock,
  Camera,
  FileCheck,
  ExternalLink,
  HelpCircle,
  QrCode,
  Download,
  Maximize2,
} from 'lucide-react';

interface PaymentModalProps {
  packageOffer: PackageOffer;
  onClose: () => void;
  onSuccess: (openPage2?: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ packageOffer, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'JazzCash' | 'Easypaisa'>('JazzCash');
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);
  const [senderName, setSenderName] = useState(user?.name || '');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [payMode, setPayMode] = useState<'qr' | 'manual'>('qr');
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  useEffect(() => {
    api
      .getPaymentDetails()
      .then((settings) => setPaymentSettings(settings))
      .catch((err) => console.error('Failed to load payment details:', err));
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file format or size');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotData(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep1 = () => {
    setError(null);
    setModalStep(2);
  };

  const handleNextStep2 = () => {
    if (!senderName.trim()) {
      setError('Please provide your sender account title');
      return;
    }
    if (!senderPhone.trim()) {
      setError('Please provide your sender phone number');
      return;
    }
    setError(null);
    setModalStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!senderName.trim()) {
      setError('Please provide your sender account title');
      return;
    }
    if (!senderPhone.trim()) {
      setError('Please provide your sender phone number');
      return;
    }
    if (!screenshotData) {
      setError('Please upload your payment transfer receipt screenshot');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let finalProofUrl = screenshotData;

      try {
        if (selectedFile) {
          finalProofUrl = await uploadPaymentScreenshot(
            selectedFile,
            user?.id || 'guest',
            (percent) => setUploadProgress(percent)
          );
        } else if (screenshotData) {
          finalProofUrl = await uploadPaymentScreenshot(
            screenshotData,
            user?.id || 'guest',
            (percent) => setUploadProgress(percent)
          );
        }
      } catch (storageErr: any) {
        console.warn('Backend storage upload notice:', storageErr);
        finalProofUrl = screenshotData;
      }

      const fullSenderDetails = transactionId.trim()
        ? `${senderName.trim()} (TID: ${transactionId.trim()})`
        : senderName.trim();

      await api.purchasePackage({
        packageId: packageOffer.id,
        paymentMethod: selectedMethod,
        senderAccountName: fullSenderDetails,
        senderPhone: senderPhone.trim(),
        transactionProofUrl: finalProofUrl,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Payment submission failed');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const currentMethodDetails =
    selectedMethod === 'JazzCash' ? paymentSettings?.jazzCash : paymentSettings?.easypaisa;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/60 relative my-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Official Payment Process
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] text-slate-400 font-mono">Step {modalStep} of 3</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{packageOffer.name} Package</span>
            <span className="text-emerald-400 font-mono font-extrabold text-lg">
              (Rs. {packageOffer.price.toLocaleString()})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow the 3-step verification flow to transfer and activate your earning package.
          </p>
        </div>

        {/* Interactive Step Bar */}
        {!isSuccess && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                modalStep === 1
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                  : modalStep > 1
                  ? 'bg-slate-950 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono font-bold flex items-center justify-center gap-1">
                <span>1.</span>
                <span>Copy Account</span>
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                modalStep === 2
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                  : modalStep > 2
                  ? 'bg-slate-950 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono font-bold flex items-center justify-center gap-1">
                <span>2.</span>
                <span>Sender Details</span>
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                modalStep === 3
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono font-bold flex items-center justify-center gap-1">
                <span>3.</span>
                <span>Upload Proof</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 sm:p-7 text-center bg-slate-950 rounded-3xl border border-emerald-500/30 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-950/60">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                Submission Logged
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5">Verification Under Fast-Track Review</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Your payment screenshot and sender credentials have been dispatched to our financial desk.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Status: Awaiting Acceptance</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">~5-15 mins</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Your receipt will be verified against the official {selectedMethod} ledger. Once approved, your daily attendance check-in and referral commission links will unlock automatically!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                onClick={() => {
                  onSuccess(false);
                  onClose();
                }}
                className="py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>Done & Return to App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* STEP 1: Select Channel & QR Code / Account Info */}
            {modalStep === 1 && (
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    1. Choose Official Deposit Channel
                  </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('JazzCash')}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                          selectedMethod === 'JazzCash'
                            ? 'bg-gradient-to-r from-red-950/60 to-rose-950/40 border-2 border-red-500 text-white ring-2 ring-red-500/30 shadow-lg shadow-red-950/50'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-left">
                          <span className="text-xs font-bold block text-white">JazzCash</span>
                          <span className="text-[10px] text-rose-300/80">Scan QR / Transfer</span>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedMethod === 'JazzCash' ? 'border-red-400 bg-red-500' : 'border-slate-600'}`}>
                          {selectedMethod === 'JazzCash' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('Easypaisa')}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                          selectedMethod === 'Easypaisa'
                            ? 'bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border-2 border-emerald-500 text-white ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-left">
                          <span className="text-xs font-bold block text-white">Easypaisa</span>
                          <span className="text-[10px] text-emerald-300/80">Scan QR / Transfer</span>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedMethod === 'Easypaisa' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'}`}>
                          {selectedMethod === 'Easypaisa' && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                        </div>
                      </button>
                    </div>
                </div>

                {/* Transfer Mode Switcher: Scan QR Code vs Account Number */}
                <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPayMode('qr')}
                    className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payMode === 'qr'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan QR Code (Instant)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMode('manual')}
                    className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payMode === 'manual'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Account Number</span>
                  </button>
                </div>

                {/* QR Code Scan View */}
                {payMode === 'qr' && (
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 text-center space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>Official {selectedMethod} QR Code</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                        Rs. {packageOffer.price.toLocaleString()} PKR
                      </span>
                    </div>

                    {/* QR Code Container */}
                    <div className="relative inline-block mx-auto group">
                      <div
                        onClick={() => setIsQrZoomed(true)}
                        className="p-3 bg-white rounded-2xl shadow-xl shadow-emerald-950/40 border-2 border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer relative"
                        title="Click to enlarge QR Code"
                      >
                        {currentMethodDetails?.qrCode ? (
                          <img
                            src={currentMethodDetails.qrCode}
                            alt={`${selectedMethod} QR Code`}
                            className="w-36 h-36 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs font-mono">
                            Loading QR...
                          </div>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 p-1 bg-slate-900/80 rounded-md text-white opacity-75 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3 h-3 text-emerald-400" />
                        </span>
                      </div>
                    </div>

                    {/* QR Action Buttons */}
                    <div className="flex items-center justify-center gap-2 pt-0.5">
                      {currentMethodDetails?.qrCode && (
                        <a
                          href={currentMethodDetails.qrCode}
                          download={`MS_OFFICIAL_${selectedMethod}_QR.png`}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Save QR to Gallery</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsQrZoomed(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enlarge QR</span>
                      </button>
                    </div>

                    {/* Quick Account Details Bar under QR */}
                    <div className="pt-2.5 border-t border-slate-900 grid grid-cols-2 gap-2 text-left text-xs">
                      <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Title</span>
                        <span className="font-bold text-white block truncate text-xs">
                          {currentMethodDetails?.accountName || 'Loading...'}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Number</span>
                          <span className="font-bold text-emerald-400 font-mono block truncate text-xs">
                            {currentMethodDetails?.accountNumber || 'Loading...'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentMethodDetails?.accountNumber || '', 'number')}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                          title="Copy Number"
                        >
                          {copiedField === 'number' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 pt-0.5">
                      Open <strong>{selectedMethod}</strong> &gt; Tap <strong>Scan QR</strong> &gt; Scan above or select saved image from gallery.
                    </p>
                  </div>
                )}

                {/* Manual Account Number Box View */}
                {payMode === 'manual' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2.5">
                      <span className="text-slate-400">Required Amount:</span>
                      <span className="font-mono text-emerald-400 font-extrabold text-sm">
                        Rs. {packageOffer.price.toLocaleString()} PKR
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official Account Title</span>
                        <span className="text-sm font-bold text-white">
                          {currentMethodDetails?.accountName || 'Loading...'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentMethodDetails?.accountName || '', 'title')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'title' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official Account Number</span>
                        <span className="text-base font-bold text-emerald-400 font-mono tracking-wider">
                          {currentMethodDetails?.accountNumber || 'Loading...'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentMethodDetails?.accountNumber || '', 'number')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedField === 'number' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'number' ? 'Copied Number!' : 'Copy Number'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-1">
                      Send exact transfer to this {selectedMethod} mobile account and save receipt screenshot.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
                >
                  <span>I Have Transferred — Next: Sender Details</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}

            {/* STEP 2: Sender Details & Transaction ID */}
            {modalStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Your Sender Account Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ali Husnain"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      The exact name shown on your {selectedMethod} sending account.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Your Sender Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Mobile number from which payment was dispatched.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Transaction ID / Trx ID <span className="text-slate-500 font-normal">(Recommended for Instant Verification)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TID-9823419082"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
                  >
                    <span>Next: Upload Receipt Proof</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Screenshot Upload & Final Submit */}
            {modalStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Payment Transfer Receipt Screenshot *
                  </label>

                  {screenshotData ? (
                    <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={screenshotData}
                          alt="Proof preview"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-white block truncate">
                            {selectedFile?.name || 'receipt_screenshot.png'}
                          </span>
                          <span className="text-[10px] text-emerald-400 block font-mono">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Verified Image'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotData(null);
                            setSelectedFile(null);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors block bg-slate-950/60">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <span className="text-xs font-semibold text-white block">
                        Tap to select receipt screenshot
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        JPG, PNG, WEBP (Max 15MB)
                      </span>
                    </label>
                  )}
                </div>

                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                      <span>Uploading to Backend Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Sender Account: <strong className="text-white">{senderName}</strong></span>
                  <span className="font-mono text-emerald-400 font-bold">Rs. {packageOffer.price.toLocaleString()}</span>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setModalStep(2)}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !screenshotData}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Dispatching Proof...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Full Screen QR Lightbox Modal */}
        {isQrZoomed && currentMethodDetails?.qrCode && (
          <div
            onClick={() => setIsQrZoomed(false)}
            className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setIsQrZoomed(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Official Scan & Pay QR
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedMethod} QR Code</h3>
                <p className="text-xs text-slate-400">
                  Scan to transfer Rs. {packageOffer.price.toLocaleString()} PKR
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border-4 border-emerald-500/40 shadow-2xl inline-block mx-auto">
                <img
                  src={currentMethodDetails.qrCode}
                  alt={`${selectedMethod} QR Large`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono text-left">
                <div className="text-slate-400 text-[10px] uppercase">Account Title</div>
                <div className="text-white font-bold">{currentMethodDetails.accountName}</div>
                <div className="text-slate-400 text-[10px] uppercase mt-1">Account Number</div>
                <div className="text-emerald-400 font-bold">{currentMethodDetails.accountNumber}</div>
              </div>

              <div className="flex gap-2">
                <a
                  href={currentMethodDetails.qrCode}
                  download={`MS_OFFICIAL_${selectedMethod}_QR.png`}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save QR</span>
                </a>
                <button
                  onClick={() => setIsQrZoomed(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
