import React, { useState, useEffect, useCallback } from 'react';
import { User, DonationItem, DonationStatus } from '../../types';
import { getDonations, addDonation as apiAddDonation, findNearbyNgos } from '../../services/mockApiService';
import DonationForm from '../DonationForm';
import DonationTracker from '../DonationTracker';
import { PlusCircle, Loader, AlertTriangle, Sparkles, MapPin } from 'lucide-react';
import { getDonationSuggestions, DonationSuggestion } from '../../services/geminiService';

interface DonorDashboardProps {
  user: User;
}

const statusConfig = {
    [DonationStatus.Pending]: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    [DonationStatus.Matched]: { color: 'bg-blue-100 text-blue-800', text: 'Matched' },
    [DonationStatus.PickedUp]: { color: 'bg-indigo-100 text-indigo-800', text: 'In Transit' },
    [DonationStatus.Delivered]: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
};

const UrgentNeedCard: React.FC<{ item: DonationItem; reason: string }> = ({ item, reason }) => (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-amber-800">Urgent Need: {item.type}</h4>
        </div>
        <p className="text-sm text-amber-700 italic">"{reason}"</p>
        <p className="text-sm text-on-surface font-medium">{item.description}</p>
        <p className="text-xs text-subtle-text">{new Date(item.createdAt).toLocaleDateString()}</p>
    </div>
);


const DonorDashboard: React.FC<DonorDashboardProps> = ({ user }) => {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<{item: DonationItem, reason: string}[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [trackingDonation, setTrackingDonation] = useState<DonationItem | null>(null);

  const loadDonations = useCallback(() => {
    setIsLoading(true);
    const allDonations = getDonations();
    setDonations(allDonations.filter(d => d.donorId === user.id));
    setIsLoading(false);
  }, [user.id]);

  const loadSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    const allDonations = getDonations();
    const pendingDonations = allDonations.filter(d => d.status === DonationStatus.Pending);
    
    if (pendingDonations.length > 0) {
        const suggestionData = await getDonationSuggestions(pendingDonations);
        const enrichedSuggestions = suggestionData
            .map(s => {
                const item = allDonations.find(d => d.id === s.id);
                return item ? { item, reason: s.reason } : null;
            })
            .filter(Boolean) as { item: DonationItem, reason: string }[];
        setSuggestions(enrichedSuggestions);
    } else {
        setSuggestions([]);
    }
    setIsLoadingSuggestions(false);
  }, []);

  useEffect(() => {
    loadDonations();
    loadSuggestions();
  }, [loadDonations, loadSuggestions]);

  const handleAddDonation = (newDonationData: Omit<DonationItem, 'id' | 'createdAt' | 'donorId' | 'donorName' | 'location'>) => {
    const donationPayload = { 
        ...newDonationData, 
        donorId: user.id, 
        donorName: user.name, 
        location: user.location,
    };

    if (!donationPayload.ngoId) {
        const nearby = findNearbyNgos(user.location, 5);
        if (nearby.length > 0) {
           // In a real app, you might have more complex logic to assign this.
           // For now, let's keep it pending for any NGO to grab.
           donationPayload.status = DonationStatus.Pending;
        } else {
            alert("No NGOs found within a 5km radius. Your donation is pending, and we will notify you.");
            donationPayload.status = DonationStatus.Pending;
        }
    } else {
        donationPayload.status = DonationStatus.Matched;
    }

    apiAddDonation(donationPayload);
    loadDonations();
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      {trackingDonation && (
        <DonationTracker 
            donation={trackingDonation}
            onClose={() => setTrackingDonation(null)}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold text-on-surface">Welcome, {user.name}!</h1>
        <p className="text-subtle-text mt-1">Thank you for making a difference.</p>
      </div>

      {isFormOpen ? (
        <DonationForm user={user} onSubmit={handleAddDonation} onCancel={() => setIsFormOpen(false)} />
      ) : (
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-focus transition-transform transform hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          Make a New Donation
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-on-surface mb-4">Your Donation History</h2>
            {isLoading ? (
                <div className="flex justify-center items-center p-8"><Loader className="animate-spin w-8 h-8 text-primary"/></div>
            ) : donations.length === 0 ? (
                <p className="text-subtle-text">You haven't made any donations yet.</p>
            ) : (
                <div className="space-y-4">
                {donations.map(item => (
                    <div key={item.id} className="bg-surface p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.description} className="w-full sm:w-24 h-24 object-cover rounded-md" />
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-on-surface">{item.type}</h3>
                            <p className="text-subtle-text text-sm">{item.description}</p>
                            <p className="text-subtle-text text-xs mt-1">Donated on: {new Date(item.createdAt).toLocaleDateString()}</p>
                             {(item.status === DonationStatus.Matched || item.status === DonationStatus.PickedUp) && item.ngoId && (
                                <button onClick={() => setTrackingDonation(item)} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                                    <MapPin size={14}/> Track Donation
                                </button>
                            )}
                        </div>
                        <div className={`text-sm font-semibold px-3 py-1 rounded-full ${statusConfig[item.status].color}`}>
                            {statusConfig[item.status].text}
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
        <div>
            <h2 className="text-2xl font-bold text-on-surface mb-4">Priority Needs</h2>
            {isLoadingSuggestions ? (
                <div className="flex justify-center items-center p-8"><Loader className="animate-spin w-8 h-8 text-primary"/></div>
            ) : suggestions.length === 0 ? (
                <p className="text-subtle-text">No urgent needs identified right now. Thank you for checking!</p>
            ) : (
                 <div className="space-y-4">
                    {suggestions.map(({ item, reason }) => (
                       <UrgentNeedCard key={item.id} item={item} reason={reason} />
                    ))}
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
