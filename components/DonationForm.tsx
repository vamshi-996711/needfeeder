import React, { useState, useEffect } from 'react';
import { DonationItem, DonationType, NGO, User, VerificationStatus } from '../types';
import { getNgos, findNearbyNgos } from '../services/mockApiService';
import { Globe, Target } from 'lucide-react';

interface DonationFormProps {
  user: User;
  onSubmit: (donation: Omit<DonationItem, 'id' | 'createdAt' | 'donorId' | 'donorName' | 'location'>) => void;
  onCancel: () => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ user, onSubmit, onCancel }) => {
  const [type, setType] = useState<DonationType>(DonationType.Food);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [assignmentMethod, setAssignmentMethod] = useState<'auto' | 'manual'>('auto');
  const [specificNgoId, setSpecificNgoId] = useState<string>('');
  const [verifiedNgos, setVerifiedNgos] = useState<NGO[]>([]);
  const [nearbyNgoCount, setNearbyNgoCount] = useState(0);

  useEffect(() => {
    const allNgos = getNgos();
    setVerifiedNgos(allNgos.filter(n => n.verificationStatus === VerificationStatus.Verified));
    
    const nearby = findNearbyNgos(user.location, 5);
    setNearbyNgoCount(nearby.length);
  }, [user.location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !quantity) {
      alert("Please fill in all description and quantity fields.");
      return;
    }
    if (assignmentMethod === 'manual' && !specificNgoId) {
      alert("Please select an NGO.");
      return;
    }

    onSubmit({
      type,
      description,
      quantity,
      imageUrl: image,
      ngoId: assignmentMethod === 'manual' ? specificNgoId : null,
      status: assignmentMethod === 'manual' ? 'Matched' : 'Pending',
    });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]){
          const reader = new FileReader();
          reader.onloadend = () => {
              setImage(reader.result as string);
          }
          reader.readAsDataURL(e.target.files[0])
      }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-on-surface mb-4">Create a New Donation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-subtle-text mb-1">Donation Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DonationType)}
            className="w-full bg-background border border-gray-300 text-on-surface p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {Object.values(DonationType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-subtle-text mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Leftover food from a party, good condition winter clothes"
            className="w-full bg-background border border-gray-300 text-on-surface p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-subtle-text mb-1">Quantity</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., Enough for 10 people, 3 large bags"
            className="w-full bg-background border border-gray-300 text-on-surface p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-subtle-text mb-1">Assign to NGO</label>
            <div className="flex gap-2">
                <label className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all ${assignmentMethod === 'auto' ? 'bg-primary/10 border-primary' : 'bg-background'}`}>
                    <input type="radio" name="assignment" value="auto" checked={assignmentMethod === 'auto'} onChange={() => setAssignmentMethod('auto')} className="sr-only"/>
                    <div className="flex items-center gap-2">
                      <Globe size={20} className={assignmentMethod === 'auto' ? 'text-primary' : 'text-subtle-text'} />
                      <div>
                        <p className="font-semibold">Find a nearby NGO</p>
                        <p className="text-xs text-subtle-text">{nearbyNgoCount} NGOs within 5km</p>
                      </div>
                    </div>
                </label>
                 <label className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all ${assignmentMethod === 'manual' ? 'bg-primary/10 border-primary' : 'bg-background'}`}>
                    <input type="radio" name="assignment" value="manual" checked={assignmentMethod === 'manual'} onChange={() => setAssignmentMethod('manual')} className="sr-only"/>
                     <div className="flex items-center gap-2">
                      <Target size={20} className={assignmentMethod === 'manual' ? 'text-primary' : 'text-subtle-text'} />
                      <div>
                        <p className="font-semibold">Select a specific NGO</p>
                        <p className="text-xs text-subtle-text">{verifiedNgos.length} verified NGOs</p>
                      </div>
                    </div>
                </label>
            </div>
        </div>

        {assignmentMethod === 'manual' && (
             <div>
                <label className="block text-sm font-medium text-subtle-text mb-1">Choose an NGO</label>
                <select
                    value={specificNgoId}
                    onChange={(e) => setSpecificNgoId(e.target.value)}
                    className="w-full bg-background border border-gray-300 text-on-surface p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                >
                    <option value="" disabled>-- Select an NGO --</option>
                    {verifiedNgos.map(ngo => (
                        <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                    ))}
                </select>
            </div>
        )}

        <div>
            <label className="block text-sm font-medium text-subtle-text mb-1">Upload an Image (Optional)</label>
            <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm text-subtle-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {image && <img src={image} alt="preview" className="mt-4 w-32 h-32 object-cover rounded-lg"/>}
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-focus"
          >
            Submit Donation
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;
