import React from 'react';
import Header from '../components/Header';

const DigitalId: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-bg pb-10">
            <Header title="Digital ID" showBack showProfile={false} />

            <div className="p-4 mt-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-8 border-brand-green">
                    {/* ID Header */}
                    <div className="bg-brand-green p-3 text-center">
                        <h2 className="text-white font-bold text-lg uppercase tracking-wide">Pothuri Jithendra Varma</h2>
                    </div>

                    <div className="p-4 bg-brand-light-green/20 relative">
                        {/* Watermark Logo (Simulated) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-64 h-64 text-brand-green">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>


                        <div className="flex gap-4 relative z-10">
                            <div className="flex-1 space-y-3 pt-2">
                                <div>
                                    <p className="text-brand-green font-bold text-sm">VU22CSEN0100903</p>
                                    <p className="font-bold text-gray-800">VSP, CSE</p>
                                </div>

                                <p className="text-sm font-medium text-gray-600">Batch: 2022-2026</p>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                                        <span>Phone: 9491922226</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700 break-all">
                                        <span>Email: jpothuri@gitam.in</span>
                                    </div>
                                </div>
                            </div>

                            {/* Photo */}
                            <div className="w-28 h-36 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden border-2 border-white shadow-sm">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jithendra"
                                    alt="Student"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-white p-6 flex flex-col items-center justify-center">
                        <div className="bg-white p-2 border-2 border-gray-100 rounded-lg shadow-inner">
                            {/* Generating a static QR for visualization */}
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VU22CSEN0100903"
                                alt="ID QR Code"
                                className="w-48 h-48"
                            />
                        </div>
                        <p className="mt-4 text-xs font-bold text-gray-500 tracking-wider">30/12/2026 12:22:10 PM</p>
                    </div>

                    <div className="bg-brand-green/90 p-2 text-center">
                        <p className="text-white text-xs font-medium opacity-80">Powered by GITAM</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalId;
