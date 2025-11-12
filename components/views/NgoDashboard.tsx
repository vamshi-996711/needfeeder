import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NGO, DonationItem, DonationStatus } from '../../types';
import { getDonations, updateDonationStatus as apiUpdateDonationStatus } from '../../services/mockApiService';
import { CheckCircle, Loader, Truck, Home, MapPin, BadgeCheck } from 'lucide-react';


interface NgoDashboardProps {
  ngo: NGO;
}

const statusConfig = {
    [DonationStatus.Pending]: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    [DonationStatus.Matched]: { color: 'bg-blue-100 text-blue-800', text: 'Matched with You' },
    [DonationStatus.PickedUp]: { color: 'bg-indigo-100 text-indigo-800', text: 'Picked Up' },
    [DonationStatus.Delivered]: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
};


const DonationCard: React.FC<{ item: DonationItem, onAccept: (id: string) => void, onUpdateStatus: (id: string, status: DonationStatus) => void, ngoId: string }> = 
({ item, onAccept, onUpdateStatus, ngoId }) => {
    const isAcceptedByMe = item.ngoId === ngoId;
    return (
        <div className="bg-surface p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4">
            <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.description} className="w-full sm:w-32 h-32 object-cover rounded-md" />
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-on-surface">{item.type}</h3>
                        <div className={`text-sm font-semibold px-3 py-1 rounded-full ${statusConfig[item.status].color}`}>
                            {statusConfig[item.status].text}
                        </div>
                    </div>
                    <p className="text-subtle-text text-sm mt-1">{item.description}</p>
                    <p className="text-subtle-text text-xs mt-2 flex items-center gap-1"><MapPin size={12}/> Donor: {item.donorName}</p>
                </div>
                <div className="flex gap-2 mt-4">
                    {item.status === DonationStatus.Pending && (
                        <button onClick={() => onAccept(item.id)} className="flex-1 text-sm bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-focus transition-colors flex items-center justify-center gap-2">
                            <CheckCircle size={16}/> Accept
                        </button>
                    )}
                    {isAcceptedByMe && item.status === DonationStatus.Matched && (
                         <button onClick={() => onUpdateStatus(item.id, DonationStatus.PickedUp)} className="flex-1 text-sm bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-focus transition-colors flex items-center justify-center gap-2">
                            <Truck size={16}/> Mark as Picked Up
                        </button>
                    )}
                    {isAcceptedByMe && item.status === DonationStatus.PickedUp && (
                         <button onClick={() => onUpdateStatus(item.id, DonationStatus.Delivered)} className="flex-1 text-sm bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                           <Home size={16}/> Mark as Delivered
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const NgoDashboard: React.FC<NgoDashboardProps> = ({ ngo }) => {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDonations = useCallback(() => {
    setIsLoading(true);
    setDonations(getDonations());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const handleAcceptDonation = (donationId: string) => {
    apiUpdateDonationStatus(donationId, DonationStatus.Matched, ngo.id);
    loadDonations();
  };

  const handleUpdateStatus = (donationId: string, status: DonationStatus) => {
    apiUpdateDonationStatus(donationId, status);
    loadDonations();
  };

  const { availableDonations, myDonations } = useMemo(() => {
    const available = donations.filter(d => 
        d.status === DonationStatus.Pending && ngo.specialties.includes(d.type)
    );
    const my = donations.filter(d => d.ngoId === ngo.id);
    return { availableDonations: available, myDonations: my };
  }, [donations, ngo.id, ngo.specialties]);

  return (
    <div className="space-y-8">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-on-surface">Welcome, {ngo.name}!</h1>
                <span className="flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <BadgeCheck className="w-4 h-4" />
                    Verified
                </span>
            </div>
            <p className="text-subtle-text mt-1">Here are the available donations and your active tasks.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-2xl font-bold text-on-surface mb-4">Available Donations</h2>
                {isLoading ? (
                    <div className="flex justify-center items-center p-8"><Loader className="animate-spin w-8 h-8 text-primary"/></div>
                ) : availableDonations.length === 0 ? (
                    <p className="text-subtle-text bg-surface p-4 rounded-lg">No available donations matching your NGO's needs at the moment.</p>
                ) : (
                    <div className="space-y-4">
                        {availableDonations.map(item => (
                            <DonationCard key={item.id} item={item} onAccept={handleAcceptDonation} onUpdateStatus={handleUpdateStatus} ngoId={ngo.id}/>
                        ))}
                    </div>
                )}
            </div>

             <div>
                <h2 className="text-2xl font-bold text-on-surface mb-4">Your Accepted Donations</h2>
                {isLoading ? (
                    <div className="flex justify-center items-center p-8"><Loader className="animate-spin w-8 h-8 text-primary"/></div>
                ) : myDonations.length === 0 ? (
                    <p className="text-subtle-text bg-surface p-4 rounded-lg">You have not accepted any donations yet.</p>
                ) : (
                    <div className="space-y-4">
                        {myDonations.map(item => (
                            <DonationCard key={item.id} item={item} onAccept={handleAcceptDonation} onUpdateStatus={handleUpdateStatus} ngoId={ngo.id}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default NgoDashboard;
