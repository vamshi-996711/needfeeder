import React, { useState, useEffect, useMemo } from 'react';
import { DonationItem, DonationStatus, User, NGO } from '../types';
import { getNgoById, getUserById } from '../services/mockApiService';
import { X, Check, Truck, Home, User as UserIcon, Building } from 'lucide-react';

interface DonationTrackerProps {
  donation: DonationItem;
  onClose: () => void;
}

const StatusStep: React.FC<{ status: string, isCompleted: boolean, isCurrent: boolean }> = ({ status, isCompleted, isCurrent }) => {
    return (
        <div className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-primary border-primary text-white' : isCurrent ? 'border-primary' : 'border-gray-300 bg-background'}`}>
                {isCompleted ? <Check size={20} /> : isCurrent ? <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div> : null}
            </div>
            <p className={`mt-2 text-xs text-center font-semibold ${isCompleted || isCurrent ? 'text-on-surface' : 'text-subtle-text'}`}>{status}</p>
        </div>
    )
}

const DonationTracker: React.FC<DonationTrackerProps> = ({ donation, onClose }) => {
    const [donor, setDonor] = useState<User | null>(null);
    const [ngo, setNgo] = useState<NGO | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setDonor(getUserById(donation.donorId) || null);
        if(donation.ngoId) {
            setNgo(getNgoById(donation.ngoId) || null);
        }
    }, [donation]);

    useEffect(() => {
        if (donation.status === DonationStatus.PickedUp) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 5; // Simulation speed
                });
            }, 500);
            return () => clearInterval(interval);
        } else if (donation.status === DonationStatus.Delivered) {
            setProgress(100);
        } else {
            setProgress(0);
        }
    }, [donation.status]);

    const statusSteps = [DonationStatus.Matched, DonationStatus.PickedUp, DonationStatus.Delivered];
    const currentStatusIndex = statusSteps.indexOf(donation.status);

    const mapDimensions = { width: 300, height: 150 };
    const donorPos = { x: 30, y: mapDimensions.height / 2 };
    const ngoPos = { x: mapDimensions.width - 30, y: mapDimensions.height / 2 };

    const truckPos = useMemo(() => {
        const x = donorPos.x + (ngoPos.x - donorPos.x) * (progress / 100);
        const y = donorPos.y + (ngoPos.y - donorPos.y) * (progress / 100);
        return { x, y };
    }, [progress, donorPos, ngoPos]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-on-surface">Donation Tracker</h2>
          <button onClick={onClose} className="text-subtle-text hover:text-on-surface">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
            <div>
                <h3 className="font-semibold text-on-surface mb-1">{donation.type} Donation</h3>
                <p className="text-sm text-subtle-text">{donation.description}</p>
            </div>

            <div className="relative pt-4">
                <div className="flex justify-between items-start">
                    {statusSteps.map((status, index) => (
                        <StatusStep 
                            key={status} 
                            // FIX: Compared status with the correct enum member instead of a string literal.
                            status={status === DonationStatus.PickedUp ? 'In Transit' : status}
                            isCompleted={index < currentStatusIndex} 
                            isCurrent={index === currentStatusIndex}
                        />
                    ))}
                </div>
                <div className="absolute top-[27px] left-0 w-full h-0.5 bg-gray-300 -z-10">
                    <div className="h-full bg-primary transition-all duration-500" style={{width: `${currentStatusIndex * 50}%`}}></div>
                </div>
            </div>

            <div className="bg-background rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-center text-on-surface">Live Tracking Simulation</h4>
                 <div style={{ width: mapDimensions.width, height: mapDimensions.height }} className="mx-auto relative">
                    {/* Route Line */}
                    <svg width="100%" height="100%" className="absolute inset-0">
                        <line 
                            x1={donorPos.x} y1={donorPos.y} 
                            x2={ngoPos.x} y2={ngoPos.y} 
                            stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4"
                        />
                         <line 
                            x1={donorPos.x} y1={donorPos.y} 
                            x2={truckPos.x} y2={truckPos.y} 
                            stroke="#0D9488" strokeWidth="3"
                        />
                    </svg>

                    {/* Donor Pin */}
                    <div className="absolute flex flex-col items-center" style={{ left: donorPos.x - 12, top: donorPos.y - 30 }}>
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><UserIcon size={16}/></div>
                        <p className="text-xs font-semibold mt-1">You</p>
                    </div>

                    {/* NGO Pin */}
                    <div className="absolute flex flex-col items-center" style={{ left: ngoPos.x - 12, top: ngoPos.y - 30 }}>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"><Building size={16}/></div>
                        <p className="text-xs font-semibold mt-1">{ngo?.name || 'NGO'}</p>
                    </div>

                    {/* Truck Icon */}
                     {donation.status === DonationStatus.PickedUp && (
                        <div className="absolute transition-all duration-500" style={{ left: truckPos.x - 12, top: truckPos.y - 12 }}>
                           <Truck size={24} className="text-primary"/>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DonationTracker;
