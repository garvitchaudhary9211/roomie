import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  Search, 
  MessageSquare,
  X,
  Utensils
} from 'lucide-react';
import { AccommodationListing, UserProfile, INDIAN_CITIES } from '../types';

interface AccommodationDiscoveryProps {
  listings: AccommodationListing[];
  onContactHost: (hostName: string) => void;
  onAddNewListing: (listing: AccommodationListing) => void;
  currentUser: UserProfile;
}

export const AccommodationDiscovery: React.FC<AccommodationDiscoveryProps> = ({
  listings,
  onContactHost,
  onAddNewListing,
  currentUser,
}) => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [maxRent, setMaxRent] = useState(30000);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // New post modal state
  const [newTitle, setNewTitle] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newRent, setNewRent] = useState(16000);
  const [newTotalBeds, setNewTotalBeds] = useState(3);
  const [newAvailableBeds, setNewAvailableBeds] = useState(1);
  const [newDescription, setNewDescription] = useState('');
  const [newAccommodationType, setNewAccommodationType] = useState('shared_flat');

  const filteredListings = listings.filter((l) => {
    const matchesCity = selectedCity === 'all' || l.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesRent = l.rentPerPerson <= maxRent;
    const matchesQuery =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.locality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesRent && matchesQuery;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocality.trim()) return;

    const created: AccommodationListing = {
      id: `listing-${Date.now()}`,
      title: newTitle.trim(),
      locality: newLocality.trim(),
      city: newCity,
      rentPerPerson: Number(newRent),
      totalBedrooms: Number(newTotalBeds),
      availableBedrooms: Number(newAvailableBeds),
      bathrooms: 2,
      moveInDate: '01/09/2026',
      accommodationType: newAccommodationType as any,
      furnishing: 'furnished',
      foodIncluded: false,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      ],
      amenities: ['Power Backup', 'High-Speed Wi-Fi', 'Washing Machine', 'Gated Society'],
      tags: ['Peaceful Area', 'Tech Park Transit', 'Vegetarian Friendly'],
      hostName: currentUser?.name || 'Flatmate Host',
      hostAvatar: currentUser?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      hostOccupation: currentUser?.occupation || 'Working Professional',
      description: newDescription.trim() || 'Pre-leased flat looking for reliable flatmate to share rent and space.',
    };

    onAddNewListing(created);
    setShowPostModal(false);
    setNewTitle('');
    setNewLocality('');
    setNewDescription('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] text-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#263548]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7F36B]/15 text-[#C7F36B] text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>India Shared Flats & PGs</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F9FAFB]">
              Discover Shared Accommodations Looking for Flatmates
            </h1>
            <p className="text-xs text-[#F4F4EC]/60 mt-1">
              Find pre-leased flats, private rooms in society apartments, and verified PGs across major Indian metros.
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] font-display font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#C7F36B]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List an Open Room / Flat</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl bg-[#263548]/30 border border-[#263548] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#F4F4EC]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by locality (e.g. Koramangala, Powai)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
            />
          </div>

          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
            >
              <option value="all">All Indian Cities</option>
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#F4F4EC]/70 shrink-0">Max Rent:</span>
            <input
              type="range"
              min={8000}
              max={45000}
              step={1000}
              value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              className="w-full accent-[#C7F36B]"
            />
            <span className="text-xs font-bold text-[#C7F36B] shrink-0">₹{maxRent.toLocaleString('en-IN')}/mo</span>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-3xl overflow-hidden bg-[#263548]/30 border border-[#263548] hover:border-[#C7F36B]/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Photo & Rent Badge */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#111827]">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#111827]/90 border border-[#C7F36B] text-xs font-bold text-[#C7F36B]">
                    ₹{listing.rentPerPerson.toLocaleString('en-IN')} / mo
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-semibold text-[#F9FAFB]">
                    {listing.availableBedrooms} of {listing.totalBedrooms} beds open
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#F9FAFB] line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-[#F4F4EC]/70 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C7F36B]" />
                      <span>{listing.locality}, {listing.city}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#F4F4EC]/60 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {listing.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#263548] text-[10px] text-[#F9FAFB]/90"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Host info */}
                  <div className="p-3 rounded-xl bg-[#263548]/50 border border-[#263548] flex items-center gap-3">
                    <img
                      src={listing.hostAvatar}
                      alt={listing.hostName}
                      className="w-8 h-8 rounded-full object-cover border border-[#C7F36B]/40"
                    />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-semibold text-[#F9FAFB] truncate">
                        Host: {listing.hostName}
                      </p>
                      <p className="text-[10px] text-[#F4F4EC]/60 truncate">
                        {listing.hostOccupation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onContactHost(listing.hostName)}
                  className="w-full py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] text-xs font-display font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#C7F36B]/15"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Connect with Host</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* POST A ROOM MODAL */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg bg-[#111827] border border-[#263548] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#F9FAFB] space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#263548]">
                <h3 className="font-display font-bold text-xl text-[#F9FAFB]">List an Open Room / PG in India</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-1 rounded-lg text-[#F4F4EC]/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Apartment / Flat Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Spacious 2BHK Gated Society Room in HSR Layout"
                    className="w-full px-4 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                      Locality / Sector
                    </label>
                    <input
                      type="text"
                      required
                      value={newLocality}
                      onChange={(e) => setNewLocality(e.target.value)}
                      placeholder="e.g. HSR Sector 2, Indiranagar"
                      className="w-full px-4 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">City (India)</label>
                    <select
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                    >
                      {INDIAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                      Rent/Person (₹)
                    </label>
                    <input
                      type="number"
                      step={500}
                      required
                      value={newRent}
                      onChange={(e) => setNewRent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Total Beds</label>
                    <input
                      type="number"
                      value={newTotalBeds}
                      onChange={(e) => setNewTotalBeds(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Open Beds</label>
                    <input
                      type="number"
                      value={newAvailableBeds}
                      onChange={(e) => setNewAvailableBeds(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Flat Description & Roommate Expectations
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe amenities (cook, power backup, Wi-Fi), distance to tech parks, and house culture..."
                    className="w-full px-4 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
