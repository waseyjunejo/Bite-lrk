import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Receipt,
  Check,
  Calendar,
  Layers,
  Hash,
  Coins,
  FileText,
  User,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
  Search,
} from 'lucide-react';
import { SlipEntry, ItemMaster, SectionCategory, UserProfile } from '../../types/inventory';
import { validateSlipInput, playHapticSound } from '../../services/dbService';

interface SlipEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSlip: (slipData: any, isEdit?: boolean) => Promise<{ success: boolean; error?: string }>;
  availableItems: ItemMaster[];
  currentUser: UserProfile;
  initialItemName?: string;
  editingSlip?: SlipEntry | null;
}

export const SlipEntryModal: React.FC<SlipEntryModalProps> = ({
  isOpen,
  onClose,
  onSaveSlip,
  availableItems,
  currentUser,
  initialItemName = '',
  editingSlip = null,
}) => {
  const [slipNumber, setSlipNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<SectionCategory>('BBQ Section');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('Kg');
  const [unitPriceRs, setUnitPriceRs] = useState<number>(0);
  const [totalPriceRs, setTotalPriceRs] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [searchItemFilter, setSearchItemFilter] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when opening or when editingSlip changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setIsSubmitting(false);

      if (editingSlip) {
        setSlipNumber(editingSlip.slipNumber);
        setDate(editingSlip.date);
        setItemName(editingSlip.itemName);
        setCategory(editingSlip.category);
        setQuantity(editingSlip.quantity);
        setUnit(editingSlip.unit);
        setUnitPriceRs(editingSlip.unitPriceRs || 0);
        setTotalPriceRs(editingSlip.priceRs || 0);
        setRemarks(editingSlip.remarks || '');
      } else {
        const randomSeq = Math.floor(100 + Math.random() * 900);
        setSlipNumber(`SLIP-LKN-${randomSeq}`);
        setDate(new Date().toISOString().slice(0, 10));
        setRemarks('');

        if (initialItemName) {
          const found = availableItems.find(
            (i) => i.name.toLowerCase() === initialItemName.toLowerCase()
          );
          if (found) {
            selectItem(found);
          } else {
            setItemName(initialItemName);
            setQuantity(1);
            setUnitPriceRs(0);
            setTotalPriceRs(0);
          }
        } else {
          setItemName('');
          setCategory('BBQ Section');
          setQuantity(1);
          setUnit('Kg');
          setUnitPriceRs(0);
          setTotalPriceRs(0);
        }
      }
    }
  }, [isOpen, initialItemName, editingSlip]);

  // Recalculate total price when quantity or unit price changes
  const handleQuantityChange = (newQty: number) => {
    const parsed = Number.isFinite(newQty) ? newQty : 0;
    const safeQty = Math.max(0.1, Math.min(1000000, Math.round(parsed * 10) / 10));
    setQuantity(safeQty);
    if (unitPriceRs > 0) {
      setTotalPriceRs(Math.round(safeQty * unitPriceRs));
    }
  };

  const handleUnitPriceChange = (val: number) => {
    const parsed = Number.isFinite(val) ? val : 0;
    const safePrice = Math.max(0, Math.min(10000000, parsed));
    setUnitPriceRs(safePrice);
    setTotalPriceRs(Math.round(quantity * safePrice));
  };

  const handleTotalPriceChange = (val: number) => {
    const parsed = Number.isFinite(val) ? val : 0;
    const safeTotal = Math.max(0, Math.min(100000000, parsed));
    setTotalPriceRs(safeTotal);
    if (quantity > 0) {
      setUnitPriceRs(Math.round((safeTotal / quantity) * 10) / 10);
    }
  };

  const selectItem = (item: ItemMaster) => {
    setItemName(item.name);
    setCategory(item.section);
    setUnit(item.unit);
    if (item.estimatedPriceRs > 0) {
      setUnitPriceRs(item.estimatedPriceRs);
      setTotalPriceRs(Math.round(quantity * item.estimatedPriceRs));
    }
    setShowItemDropdown(false);
    playHapticSound('tap');
  };

  const setPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().slice(0, 10));
    playHapticSound('tap');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Pre-flight validation
    const validation = validateSlipInput({
      itemName,
      category,
      quantity,
      priceRs: totalPriceRs,
      date,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please fill all required slip fields.');
      playHapticSound('warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const slipPayload = {
        id: editingSlip ? editingSlip.id : undefined,
        slipNumber: editingSlip ? editingSlip.slipNumber : slipNumber,
        date,
        itemName: itemName.trim(),
        category,
        quantity,
        unit,
        priceRs: totalPriceRs,
        unitPriceRs: unitPriceRs,
        remarks: remarks.trim() || 'Paper slip recorded into Larkana digital ledger',
        loggedBy: currentUser.name,
        status: editingSlip ? editingSlip.status : 'Verified',
      };

      const result = await onSaveSlip(slipPayload, Boolean(editingSlip));
      setIsSubmitting(false);

      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to save slip. Please try again.');
        playHapticSound('warning');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Unexpected database error occurred.');
      playHapticSound('warning');
    }
  };

  if (!isOpen) return null;

  const filteredItems = availableItems.filter(
    (i) =>
      i.name.toLowerCase().includes((searchItemFilter || itemName).toLowerCase()) ||
      i.section.toLowerCase().includes((searchItemFilter || itemName).toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingSlip ? 'Edit Recorded Slip' : 'Log Kitchen Paper Slip'}
              </h2>
              <p className="text-xs text-slate-400">
                Bite Restaurant Larkana • Digital Slip Voucher
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Slip ID & Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Slip Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  readOnly
                  value={slipNumber}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 focus:outline-none select-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Slip Date
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPresetDate(0)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Today
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setPresetDate(1)}
                    className="text-[10px] text-slate-400 hover:underline"
                  >
                    Yday
                  </button>
                </div>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Category Dropdown */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Restaurant Section
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as SectionCategory);
                  playHapticSound('tap');
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="BBQ Section">BBQ Section (19 items)</option>
                <option value="Roll Section">Roll Section (9 items)</option>
                <option value="Naan Section">Naan Section (16 items)</option>
                <option value="Karahi Section">Karahi Section (45 items)</option>
                <option value="Pizza & Fast Food">Pizza & Fast Food Section (25 items)</option>
                <option value="Disposal Demand">Disposal Demand (47 items)</option>
                <option value="Vegetables & Misc">Vegetables & Misc (12 items)</option>
                <option value="Department Trackers">Department Trackers</option>
              </select>
            </div>
          </div>

          {/* Item Name with Autocomplete dropdown from 160 items */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Item Name (Paper Slip Item)
              </label>
              <button
                type="button"
                onClick={() => setShowItemDropdown(!showItemDropdown)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <Search className="w-3 h-3" />
                <span>Browse 160+ Larkana Catalog</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Jeero, Meedo Atta, Ghee, Tikka Masala..."
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setShowItemDropdown(true);
              }}
              onFocus={() => setShowItemDropdown(true)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
              required
            />

            {/* Autocomplete list */}
            {showItemDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-50 p-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  Select Item from Section Catalog
                </div>
                {filteredItems.slice(0, 15).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(item)}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-200 group-hover:text-cyan-300">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.unit} • {item.section}
                    </span>
                  </button>
                ))}
                {filteredItems.length === 0 && (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching item. Type to add custom item.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity & Unit Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quantity (QTY)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded flex items-center justify-center text-xs"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 5)}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[10px]"
                  >
                    +5
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Unit of Measure
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="Kg">Kg</option>
                <option value="Tin">Tin (16 Kg / 16 Liter)</option>
                <option value="Bori">Bori (50 Kg)</option>
                <option value="Kato">Kato (50 Kg)</option>
                <option value="Bottle">Bottle</option>
                <option value="Packet">Packet</option>
                <option value="Box">Box</option>
                <option value="Carton">Carton</option>
                <option value="Roll">Roll</option>
                <option value="Dozen">Dozen</option>
                <option value="Gaddi">Gaddi</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>
          </div>

          {/* Pricing Row: Unit Rate (Rs.) & Total Price (Rs.) */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Unit Rate (Rs.)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Rate per unit"
                value={unitPriceRs || ''}
                onChange={(e) => handleUnitPriceChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Total Price (Rs.)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Total Rs. on slip"
                value={totalPriceRs || ''}
                onChange={(e) => handleTotalPriceChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-cyan-500/50 rounded-lg text-emerald-400 font-bold focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Remarks / Paper Slip Reference */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Remarks / Supplier Slip Note
            </label>
            <input
              type="text"
              placeholder="e.g. Imran Mamo wholesale / Sabzi Mandi / Evening emergency slip"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
            />
          </div>

          {/* Recorded by User Badge */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Logged by: <strong className="text-slate-200">{currentUser.name}</strong></span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Status: Verified
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Saving to Database...' : editingSlip ? 'Update Slip Record' : 'Record Slip & Save'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
