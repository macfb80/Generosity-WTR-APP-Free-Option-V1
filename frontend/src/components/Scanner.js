import React, { useState, useRef } from 'react';
import { X, Camera, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

const Scanner = ({ onClose, onScan }) => {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // Enhanced configuration for immediate and high-probability barcode scanning
      const config = {
        fps: 30, // Increased from 10 to 30 for faster scanning
        qrbox: { width: 320, height: 160 }, // Larger scan area for easier targeting
        aspectRatio: 1.777778, // 16:9 aspect ratio
        formatsToSupport: [
          8,  // CODE_128 (priority for water bottles)
          13, // EAN_13 (most common for water bottles)
          14, // EAN_8
          16, // UPC_A
          17, // UPC_E
          0,  // QR_CODE (lower priority but still supported)
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true // Use native detector for faster scanning
        }
      };

      await html5QrCode.start(
        { 
          facingMode: "environment", // Use back camera on mobile
          advanced: [
            { focusMode: "continuous" }, // Continuous autofocus
            { zoom: 1.5 } // Slight zoom for better barcode reading
          ]
        },
        config,
        (decodedText) => {
          console.log("Scanned barcode:", decodedText);
          html5QrCode.stop().then(() => {
            toast.success("✅ Barcode detected!");
            onScan(decodedText);
          }).catch(console.error);
        },
        (error) => {
          // Scanning errors are normal - suppress console spam
        }
      );
      
      toast.success("📷 Camera ready - Scanning...", { duration: 2000 });
    } catch (err) {
      console.error("Camera error:", err);
      const errorMsg = err.message || err.toString();
      
      if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission denied')) {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
        toast.error("Camera permission needed");
      } else if (errorMsg.includes('NotFoundError')) {
        setCameraError("No camera found on this device.");
        toast.error("No camera detected");
      } else {
        setCameraError("Unable to access camera. Please try manual entry.");
        toast.error("Camera error");
      }
      
      setScanMode('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().catch(console.error);
      setIsScanning(false);
    }
  };

  React.useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col" data-testid="scanner-overlay">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary/20 bg-white">
        <div className="flex-1"></div>
        
        {/* Centered Logo */}
        <img 
          src="https://customer-assets.emergentagent.com/job_waterfax-check/artifacts/hq3g7o5u_image.png" 
          alt="Generosity Water Intelligence" 
          className="w-full"
          data-testid="scanner-logo"
          style={{ maxWidth: '280px', height: 'auto' }}
        />
        
        <div className="flex-1 flex justify-end">
          <button
            data-testid="close-scanner-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
          >
            <X className="w-6 h-6 text-text-primary" />
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-4">
        <button
          data-testid="camera-mode-btn"
          onClick={() => setScanMode('camera')}
          className={`flex-1 py-3 rounded-xl font-body font-medium transition-all ${
            scanMode === 'camera'
              ? 'bg-primary text-white'
              : 'bg-background-subtle text-text-secondary hover:bg-secondary/10'
          }`}
        >
          <Camera className="w-5 h-5 inline-block mr-2" />
          Camera Scan
        </button>
        <button
          data-testid="manual-mode-btn"
          onClick={() => {
            stopCamera();
            setScanMode('manual');
          }}
          className={`flex-1 py-3 rounded-xl font-body font-medium transition-all ${
            scanMode === 'manual'
              ? 'bg-primary text-white'
              : 'bg-background-subtle text-text-secondary hover:bg-secondary/10'
          }`}
        >
          <Keyboard className="w-5 h-5 inline-block mr-2" />
          Manual Entry
        </button>
      </div>

      {/* Scanner Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {scanMode === 'camera' ? (
          <div className="relative w-full max-w-lg mx-auto">
            <div
              id="qr-reader"
              data-testid="camera-view"
              className="rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl mx-auto"
              style={{ maxWidth: '90vw', aspectRatio: '16/9' }}
            ></div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-3/4 h-0.5 bg-primary scan-line"></div>
            </div>
            <div className="mt-6 space-y-3 px-4">
              <p className="text-center text-text-primary font-body font-semibold text-lg">
                📱 Point camera at barcode
              </p>
              <p className="text-center text-text-secondary font-body text-sm max-w-md mx-auto">
                Hold steady and align barcode within the frame.<br/>
                Works with UPC, EAN, and CODE-128 barcodes.
              </p>
              {isScanning && (
                <p className="text-center text-primary font-body text-sm animate-pulse">
                  🔍 Scanning...
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto px-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-text-secondary font-body text-sm mb-2">
                  Enter Barcode Number
                </label>
                <input
                  data-testid="manual-barcode-input"
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="012345678901"
                  className="w-full px-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-primary font-mono text-lg focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
              <button
                data-testid="manual-scan-submit-btn"
                type="submit"
                disabled={!manualBarcode.trim()}
                className="w-full py-3 bg-primary text-white rounded-xl font-body font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Scan Water
              </button>
            </form>
            <div className="mt-8 p-4 glass-card rounded-xl">
              <p className="text-text-secondary font-body text-sm">
                <strong className="text-text-primary">Sample Barcodes:</strong>
              </p>
              <ul className="mt-2 space-y-1 font-mono text-xs text-text-muted">
                <li onClick={() => setManualBarcode('012345678901')} className="cursor-pointer hover:text-primary">012345678901 - Fiji</li>
                <li onClick={() => setManualBarcode('012345678902')} className="cursor-pointer hover:text-primary">012345678902 - Evian</li>
                <li onClick={() => setManualBarcode('012345678903')} className="cursor-pointer hover:text-primary">012345678903 - Dasani</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;