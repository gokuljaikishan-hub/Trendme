/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, ShoppingBag, Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { analyzeAndSuggestOutfits, generateTryOnPreview, OutfitSuggestion } from './services/geminiService';
import { cn } from './lib/utils';

type Step = 'upload' | 'occasion' | 'suggesting' | 'results' | 'preview';

const OCCASIONS = [
  { id: 'wedding', label: 'Wedding', icon: '💍' },
  { id: 'formal', label: 'Office / Formal', icon: '💼' },
  { id: 'party', label: 'Party / Night Out', icon: '🎉' },
  { id: 'casual', label: 'Casual / Everyday', icon: '☕' },
  { id: 'traditional', label: 'Traditional / Festive', icon: '🕌' },
  { id: 'date', label: 'Date Night', icon: '❤️' },
];

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitSuggestion | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep('occasion');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOccasionSelect = async (occ: string) => {
    setOccasion(occ);
    setStep('suggesting');
    setLoading(true);
    setLoadingText('Analyzing your photo...');
    
    try {
      if (image) {
        const results = await analyzeAndSuggestOutfits(image, occ);
        setSuggestions(results);
        setStep('results');
      }
    } catch (err) {
      alert('Error analyzing image. Please try again.');
      setStep('occasion');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTryOn = async (outfit: OutfitSuggestion) => {
    setSelectedOutfit(outfit);
    setStep('preview');
    setLoading(true);
    setLoadingText('Generating your look...');
    
    try {
      if (image) {
        const previewUrl = await generateTryOnPreview(image, outfit.description);
        setPreviewImage(previewUrl);
      }
    } catch (err) {
      alert('Error generating preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setImage(null);
    setOccasion(null);
    setSuggestions([]);
    setSelectedOutfit(null);
    setPreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-orange-500/30">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2" onClick={reset} style={{ cursor: 'pointer' }}>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TrendMe</h1>
          </div>
          {image && (
            <button 
              onClick={reset}
              className="p-2 bg-neutral-900 rounded-full text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 px-6 pb-24 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Upload */}
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col justify-center gap-8 py-12"
              >
                <div className="space-y-4">
                  <h2 className="text-4xl font-light leading-tight">
                    Your Personal <br />
                    <span className="font-semibold text-orange-500">AI Stylist</span>
                  </h2>
                  <p className="text-neutral-400">
                    Upload a photo to see yourself in the perfect outfit for any occasion.
                  </p>
                </div>

                <label className="relative group cursor-pointer">
                  <div className="w-full aspect-[4/5] bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover:border-orange-500/50 transition-all">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-neutral-400 group-hover:text-orange-500" />
                    </div>
                    <span className="text-neutral-500 group-hover:text-neutral-300">Tap to upload full photo</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                <button 
                  onClick={() => {
                    setImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000');
                    setStep('occasion');
                  }}
                  className="py-4 text-neutral-500 hover:text-neutral-300 transition-colors text-sm font-medium"
                >
                  Or try with a sample photo
                </button>
              </motion.div>
            )}

            {/* Step 2: Occasion */}
            {step === 'occasion' && (
              <motion.div
                key="occasion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 py-4"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">What's the occasion?</h2>
                  <p className="text-neutral-400">Select where you're headed</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => handleOccasionSelect(occ.label)}
                      className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col gap-4 items-start active:scale-95 transition-all text-left"
                    >
                      <span className="text-3xl">{occ.icon}</span>
                      <span className="font-medium">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Suggesting / Loading */}
            {loading && (
              <motion.div
                key="loading"
                className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              >
                <div className="text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
                    <motion.div
                      className="absolute inset-0 border-4 border-t-orange-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{loadingText}</h3>
                    <p className="text-neutral-400 text-sm">Magic is happening...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Results */}
            {step === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 pb-12"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">Top Picks for You</h2>
                  <p className="text-neutral-400">Curated suggestions for {occasion}</p>
                </div>

                <div className="space-y-4">
                  {suggestions.map((outfit, index) => (
                    <motion.div
                      key={outfit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-orange-500">{outfit.name}</h3>
                          <div className="flex gap-1">
                            {outfit.colors.map(color => (
                              <div 
                                key={color}
                                className="w-3 h-3 rounded-full border border-neutral-700" 
                                style={{ backgroundColor: color.toLowerCase() }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-neutral-400 text-sm line-clamp-2">{outfit.description}</p>
                        
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handlePreviewTryOn(outfit)}
                            className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                            <Sparkles className="w-4 h-4" />
                            Virtual Try-On
                          </button>
                          <div className="flex gap-2">
                            {outfit.shoppingSearchTerms.slice(0, 2).map((link, i) => (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-full bg-neutral-800 rounded-xl flex items-center justify-center hover:bg-neutral-700 transition-colors"
                                title={`Shop on ${link.site}`}
                              >
                                <ShoppingBag className="w-5 h-5 text-neutral-300" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Preview */}
            {step === 'preview' && selectedOutfit && previewImage && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 pb-12"
              >
                <div className="relative aspect-[3/4] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={previewImage} 
                    alt="AI Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-orange-500/90 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                      AI Generated
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-900 p-6 rounded-3xl space-y-6 border border-neutral-800">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{selectedOutfit.name}</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      {selectedOutfit.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Buy this look (India)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedOutfit.shoppingSearchTerms.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-neutral-800 rounded-2xl hover:bg-neutral-700 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-300">{link.site}</span>
                            <span className="text-[10px] text-neutral-500 truncate max-w-[80px]">View Item</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('results')}
                    className="w-full py-4 text-neutral-400 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    Back to suggestions
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer Navigation (Mock) */}
        {step !== 'upload' && !loading && (
          <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 flex justify-between items-center bg-gradient-to-t from-neutral-950 to-transparent pt-12 z-20 pointer-events-none">
            <div className="flex items-center gap-4 w-full justify-center pointer-events-auto">
              <button 
                onClick={reset}
                className="px-6 py-4 bg-neutral-900 border border-neutral-800 rounded-full text-sm font-bold active:scale-95 transition-all shadow-xl"
              >
                Start Over
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
