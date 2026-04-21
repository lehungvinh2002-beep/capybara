/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  Download, 
  Copy, 
  RefreshCw, 
  Check, 
  ChevronRight, 
  ChevronDown,
  Info,
  Sparkles,
  ChefHat,
  Leaf,
  Settings2,
  User,
  Volume2,
  Search,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInputs, GeneratedPrompts } from './types';
import { generateLalaPrompts, generateLalaImage } from './services/geminiService';
import { IMAGE_STYLE_OPTIONS } from './constants';

interface ComboboxProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  className?: string;
}

function Combobox({ label, name, value, options, onChange, placeholder, className }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = (isOpen && searchTerm !== value)
    ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(name, val);
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    onChange(name, opt);
    setSearchTerm(opt);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setSearchTerm(value); // Reset search term to current value to show all options initially
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`space-y-2 relative ${className}`} ref={containerRef}>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative group">
        <input 
          type="text" 
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white cursor-text"
        />
        <button 
          type="button"
          onClick={toggleOpen}
          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-orange-500 transition-colors"
        >
          <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-20 top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2 border border-slate-200"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between group ${
                    value === opt ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {opt}
                  {value === opt && <Check size={14} />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400 italic">
                Nhấn Enter để dùng giá trị mới: "{searchTerm}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (food: string) => void;
  suggestions: string[];
}

function FoodSuggestionModal({ isOpen, onClose, onSelect, suggestions }: FoodModalProps) {
  const [search, setSearch] = useState('');
  
  const filtered = suggestions.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <ChefHat className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold">Chọn món ăn hoặc thức uống</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <ChevronRight size={24} className="rotate-90" />
          </button>
        </div>
        
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((food, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(food);
                onClose();
              }}
              className="px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-100 rounded-xl hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all text-center shadow-sm"
            >
              {food}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              Không tìm thấy món nào phù hợp với "{search}"
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [charImageUrl, setCharImageUrl] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompts | null>(null);
  const [copiedType, setCopiedType] = useState<'char' | 'video' | 'image' | null>(null);

  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);

  const foodSuggestions = [
    "bánh xèo", "bánh chuối nướng", "chè bắp", "chè đậu xanh", "xôi xoài", "xôi lá dứa", 
    "sinh tố xoài", "sinh tố bơ", "nước mía", "trà đào", "trà chanh", "nước cam", 
    "mứt dâu", "mứt cam", "dưa hấu ép", "chuối nướng", "khoai nướng", "bánh khoai", 
    "sữa ngô", "chè sen", "bánh flan", "nước dừa", "xoài sấy", "mít sấy", "dứa sấy", 
    "nước ép ổi", "nước ép thơm", "trà sen", "bánh tằm", "bánh bò", "bánh da lợn", 
    "bánh ít", "bún gạo", "cháo bí đỏ", "súp bắp", "bí đỏ hấp", "khoai lang hấp", 
    "chè khoai dẻo", "mứt gừng", "mứt dừa", "nước chanh mật ong", "trà gừng", 
    "cacao nóng", "sữa đậu nành", "đậu hũ non", "rau câu dừa", "bánh đậu xanh", 
    "chè chuối", "bánh bắp"
  ];

  const [inputs, setInputs] = useState<UserInputs>({
    food: '',
    mainIngredient: '',
    environment: 'vườn quê',
    imageStyle: 'hoạt hình 3D điện ảnh',
    videoCount: 8,
    aspectRatio: '9:16',
    voiceLanguage: 'tiếng Việt',
    voiceTone: 'nam hiền hòa ấm áp',
    actionDetail: 'vừa',
    enableCharImage: true,
    bodyShape: 'tròn trịa',
    headAccessory: 'không đội gì',
    extraAccessory: 'không phụ kiện',
    expression: 'vui vẻ',
    pose: 'đứng thẳng',
    furColor: 'nâu ấm',
    charImageStyle: 'hoạt hình 3D điện ảnh'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleComboboxChange = (name: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Automatically clear results if food input changes
  useEffect(() => {
    if (prompts) {
      setPrompts(null);
      setCharImageUrl(null);
      setImageError(null);
      setCopiedType(null);
    }
  }, [inputs.food]);

  const handleGenerate = async () => {
    if (!inputs.food.trim()) {
      return;
    }
    
    // Reset all previous results before generating new ones
    setPrompts(null);
    setCharImageUrl(null);
    setImageError(null);
    setCopiedType(null);
    
    setLoading(true);
    
    try {
      const result = await generateLalaPrompts(inputs);
      setPrompts(result);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Step 2: Generate Image if enabled
      if (inputs.enableCharImage && result.characterPrompt) {
        await handleRegenerateImage(result.characterPrompt);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo câu lệnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateImage = async (prompt: string) => {
    setImageLoading(true);
    setImageError(null);
    try {
      const imageUrl = await generateLalaImage(prompt);
      setCharImageUrl(imageUrl);
    } catch (error) {
      console.error("Failed to generate image:", error);
      setImageError("Không thể tạo ảnh nhân vật. Vui lòng thử lại.");
    } finally {
      setImageLoading(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, type: 'char' | 'video' | 'image') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadTxt = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-slate-800 font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <img 
              src="https://yt3.googleusercontent.com/Gug5UDLjPMRBto68HqZvJCSryebEkqiI2_9qV_8y16ZKIVLgxYBFx_PyUYZStcTzSc3v7TLq=s900-c-k-c0x00ffffff-no-rj" 
              alt="Logo" 
              className="w-10 h-10 rounded-full border-2 border-orange-500 object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Học nấu ăn cùng <span className="text-orange-500">Capybara</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
          >
            Tạo câu lệnh món ăn cùng <span className="text-orange-500">Capybara</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-7 space-y-8">
            {/* Basic Info */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <ChefHat className="text-orange-500" size={24} />
                <h3 className="text-xl font-bold">Thông tin món ăn & Bối cảnh</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">Món ăn / Thức uống</label>
                    <button 
                      onClick={() => setShowFoodSuggestions(true)}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <RefreshCw size={12} />
                      Gợi ý món
                    </button>
                  </div>
                  <input 
                    type="text" 
                    name="food"
                    value={inputs.food}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Bánh xèo miền Tây"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Vui lòng nhập tên món ăn hoặc thức uống để bắt đầu.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nguyên liệu chính (Tùy chọn)</label>
                  <input 
                    type="text" 
                    name="mainIngredient"
                    value={inputs.mainIngredient}
                    onChange={handleInputChange}
                    placeholder="Để trống nếu muốn AI tự gợi ý"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <Combobox 
                  label="Môi trường"
                  name="environment"
                  value={inputs.environment}
                  onChange={handleComboboxChange}
                  placeholder="Chọn hoặc nhập môi trường..."
                  options={[
                    "vườn quê", "bếp gỗ ven sông", "ao sen", "nhà tranh đồng quê", 
                    "nông trại trái cây", "bến thuyền nhỏ", "sân vườn buổi sáng", 
                    "hiên nhà gỗ", "ruộng lúa quê", "vườn nhiệt đới", 
                    "vườn rau sau nhà", "quán quê mộc mạc"
                  ]}
                />

                <Combobox 
                  label="Phong cách hình ảnh"
                  name="imageStyle"
                  value={inputs.imageStyle}
                  onChange={handleComboboxChange}
                  placeholder="Chọn hoặc nhập phong cách..."
                  options={IMAGE_STYLE_OPTIONS}
                />
              </div>
            </section>

            {/* Video Settings */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Settings2 className="text-orange-500" size={24} />
                <h3 className="text-xl font-bold">Cấu hình Video</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Số lượng câu lệnh video</label>
                  <input 
                    type="number" 
                    name="videoCount"
                    min="3"
                    max="10"
                    value={inputs.videoCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tỷ lệ khung hình</label>
                  <select 
                    name="aspectRatio"
                    value={inputs.aspectRatio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="9:16">9:16 (TikTok/Reels)</option>
                    <option value="16:9">16:9 (YouTube)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Chi tiết hành động</label>
                  <select 
                    name="actionDetail"
                    value={inputs.actionDetail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="ngắn">Ngắn gọn</option>
                    <option value="vừa">Vừa đủ</option>
                    <option value="chi tiết">Rất chi tiết</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Volume2 size={16} className="text-slate-400" />
                    <label className="text-sm font-semibold text-slate-700">Ngôn ngữ Voice</label>
                  </div>
                  <select 
                    name="voiceLanguage"
                    value={inputs.voiceLanguage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="tiếng Việt">Tiếng Việt</option>
                    <option value="tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>
                
                <Combobox 
                  label="Giọng Voice"
                  name="voiceTone"
                  value={inputs.voiceTone}
                  onChange={handleComboboxChange}
                  placeholder="Chọn hoặc nhập giọng..."
                  options={[
                    "nữ miền Bắc nhẹ nhàng", "nữ trung tính ấm áp", "nữ trẻ dễ thương", 
                    "nam hiền hòa ấm áp", "nam trầm chậm rãi", "trẻ em vui vẻ", 
                    "giọng kể chuyện thư giãn", "không có thoại chỉ âm thanh nền"
                  ]}
                />
              </div>
            </section>
          </div>

          {/* Character Section */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <User className="text-orange-500" size={24} />
                  <h3 className="text-lg font-bold text-slate-800">Tạo ảnh nhân vật capybara tham chiếu</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="enableCharImage"
                    checked={inputs.enableCharImage}
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nên bật khi muốn có ảnh nhân vật tham chiếu đồng nhất. Có thể tắt nếu chỉ cần câu lệnh video.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {inputs.enableCharImage && (
                <motion.section 
                  key="char-config-box"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <Combobox 
                      label="Vóc dáng"
                      name="bodyShape"
                      value={inputs.bodyShape || ''}
                      onChange={handleComboboxChange}
                      options={["béo bĩnh", "tròn trịa", "nhỏ nhắn", "mũm mĩm đáng yêu"]}
                    />
                    <Combobox 
                      label="Phụ kiện đầu"
                      name="headAccessory"
                      value={inputs.headAccessory || ''}
                      onChange={handleComboboxChange}
                      options={["không đội gì", "đội nón rơm", "đội khăn", "đội mũ vải", "đội nón lá nhỏ"]}
                    />
                    <Combobox 
                      label="Phụ kiện thêm"
                      name="extraAccessory"
                      value={inputs.extraAccessory || ''}
                      onChange={handleComboboxChange}
                      options={["không phụ kiện", "giỏ mây nhỏ", "tạp dề", "khăn cổ"]}
                    />
                    <Combobox 
                      label="Biểu cảm"
                      name="expression"
                      value={inputs.expression || ''}
                      onChange={handleComboboxChange}
                      options={["vui vẻ", "hiền", "tò mò", "chăm chỉ", "hạnh phúc", "thư giãn"]}
                    />
                    <Combobox 
                      label="Tư thế"
                      name="pose"
                      value={inputs.pose || ''}
                      onChange={handleComboboxChange}
                      options={["đứng thẳng", "cầm giỏ", "cầm nguyên liệu", "chào tay"]}
                    />
                    <Combobox 
                      label="Màu lông"
                      name="furColor"
                      value={inputs.furColor || ''}
                      onChange={handleComboboxChange}
                      options={["nâu sáng", "nâu ấm", "vàng nâu tự nhiên"]}
                    />
                    <Combobox 
                      label="Phong cách ảnh nhân vật"
                      name="charImageStyle"
                      value={inputs.charImageStyle || ''}
                      onChange={handleComboboxChange}
                      options={IMAGE_STYLE_OPTIONS}
                    />
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={handleGenerate}
            disabled={loading || !inputs.food.trim()}
            className="group relative px-12 py-5 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:bg-slate-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed flex items-center gap-3 overflow-hidden"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={24} />
                Đang tạo câu lệnh...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Tạo bộ câu lệnh Capybara
              </>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
          </button>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {prompts && (
            <motion.div 
              id="results-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 space-y-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-slate-100"></div>
                <h3 className="text-2xl font-bold text-slate-900">Kết quả sinh ra</h3>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              {/* Character Prompt Result */}
              {inputs.enableCharImage && prompts.characterPrompt && (
                <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <User className="text-orange-500" size={20} />
                      <span className="font-bold text-slate-700">Thông tin nhân vật capybara</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => copyToClipboard(prompts.characterPrompt!, 'char')}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm ${
                          copiedType === 'char' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        {copiedType === 'char' ? <Check size={18} /> : <Copy size={18} />}
                        {copiedType === 'char' ? 'Đã chép' : 'Sao chép'}
                      </button>
                      <button 
                        onClick={() => downloadTxt(prompts.characterPrompt!, 'cau_lenh_anh_capybara_tham_chieu.txt')}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
                      >
                        <Download size={18} />
                        Tải .txt
                      </button>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      <div className="md:col-span-4 lg:col-span-3">
                        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative group flex items-center justify-center">
                          {imageLoading ? (
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              <RefreshCw className="animate-spin" size={32} />
                              <span className="text-xs font-medium">Đang tạo ảnh nhân vật capybara...</span>
                            </div>
                          ) : imageError ? (
                            <div className="flex flex-col items-center gap-3 text-center p-4">
                              <AlertCircle className="text-red-400" size={32} />
                              <p className="text-xs text-slate-500 font-medium">{imageError}</p>
                              <button 
                                onClick={() => handleRegenerateImage(prompts.characterPrompt!)}
                                className="mt-2 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                              >
                                <RefreshCw size={14} />
                                Tạo lại ảnh
                              </button>
                            </div>
                          ) : charImageUrl ? (
                            <>
                              <img 
                                src={charImageUrl} 
                                alt="Character Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => downloadImage(charImageUrl, 'lala_capybara_character.png')}
                                  className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/40 transition-all"
                                  title="Tải ảnh"
                                >
                                  <Download size={20} />
                                </button>
                                <button 
                                  onClick={() => handleRegenerateImage(prompts.characterPrompt!)}
                                  className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/40 transition-all"
                                  title="Tạo lại ảnh"
                                >
                                  <RefreshCw size={20} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-3 text-slate-300">
                              <ImageIcon size={48} />
                              <span className="text-xs font-medium">Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                        {charImageUrl && !imageLoading && (
                          <button 
                            onClick={() => downloadImage(charImageUrl, 'lala_capybara_character.png')}
                            className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                          >
                            <Download size={18} />
                            Tải ảnh nhân vật capybara
                          </button>
                        )}
                      </div>
                      <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between">
                        <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap flex-1">
                          {prompts.characterPrompt}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-slate-400">
                          <span className="text-sm font-semibold">Tên nhân vật:</span>
                          <span className="text-lg font-bold text-orange-500">Lala</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Image Prompts Result */}
              <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="text-orange-500" size={20} />
                    <span className="font-bold text-slate-700">Bộ câu lệnh Ảnh ({prompts.imagePrompts.length} cảnh)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => copyToClipboard(prompts.imagePrompts.join('\n\n'), 'image')}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm ${
                        copiedType === 'image' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {copiedType === 'image' ? <Check size={18} /> : <Copy size={18} />}
                      {copiedType === 'image' ? 'Đã chép tất cả' : 'Sao chép tất cả'}
                    </button>
                    <button 
                      onClick={() => downloadTxt(prompts.imagePrompts.join('\n\n'), 'cau_lenh_anh_cac_canh.txt')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
                    >
                      <Download size={18} />
                      Tải .txt
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  {prompts.imagePrompts.map((prompt, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-4 top-4 w-1 h-full bg-orange-100 rounded-full group-hover:bg-orange-500 transition-colors"></div>
                      <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {prompt}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Video Prompts Result */}
              <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Video className="text-orange-500" size={20} />
                    <span className="font-bold text-slate-700">Bộ câu lệnh Video ({prompts.videoPrompts.length} cảnh)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => copyToClipboard(prompts.videoPrompts.join('\n\n'), 'video')}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm ${
                        copiedType === 'video' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {copiedType === 'video' ? <Check size={18} /> : <Copy size={18} />}
                      {copiedType === 'video' ? 'Đã chép tất cả' : 'Sao chép tất cả'}
                    </button>
                    <button 
                      onClick={() => downloadTxt(prompts.videoPrompts.join('\n\n'), 'cau_lenh_video_cac_canh.txt')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
                    >
                      <Download size={18} />
                      Tải .txt
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  {prompts.videoPrompts.map((prompt, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-4 top-4 w-1 h-full bg-orange-100 rounded-full group-hover:bg-orange-500 transition-colors"></div>
                      <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {prompt}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
        </div>
      </footer>

      <AnimatePresence>
        {showFoodSuggestions && (
          <FoodSuggestionModal 
            isOpen={showFoodSuggestions}
            onClose={() => setShowFoodSuggestions(false)}
            onSelect={(food) => setInputs(prev => ({ ...prev, food }))}
            suggestions={foodSuggestions}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
