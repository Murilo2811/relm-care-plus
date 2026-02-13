import React, { useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, ArrowRight, ArrowLeft, Info } from 'lucide-react';

const PublicWarrantyForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    productDescription: '',
    serialNumber: '',
    invoiceNumber: '',
    purchaseStoreName: '',
    purchaseStoreCity: '',
    purchaseDate: '',
    acceptedPolicy: false
  });
  const [protocol, setProtocol] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.claims.createPublic({
        ...formData,
        itemType: 'Bike'
      });
      setProtocol(res.protocolNumber);
      setStep(3);
    } catch (error) {
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-inter">
        <div className="max-w-xl w-full text-center">
          <CheckCircle className="w-12 h-12 text-black mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-4 italic">
            Registration Complete
          </h1>
          <p className="text-gray-500 font-light text-lg mb-10">
            Sua solicitação foi registrada com sucesso sob o protocolo abaixo.
          </p>

          <div className="border border-gray-100 p-8 mb-10 bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Protocol Reference</p>
            <p className="text-3xl font-bold tracking-tighter text-black">{protocol}</p>
          </div>

          <p className="text-sm text-gray-400 font-light mb-8">
            Um consultor entrará em contato em breve via e-mail ou WhatsApp.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter text-black antialiased">
      {/* Factor Style Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-black italic tracking-tighter hover:opacity-80 transition-opacity cursor-pointer">
              FACTOR
            </h1>
            <nav className="hidden lg:flex space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <span className="hover:text-black cursor-pointer">Bikes</span>
              <span className="hover:text-black cursor-pointer">Equipment</span>
              <span className="hover:text-black cursor-pointer">Emporium</span>
              <span className="hover:text-black cursor-pointer">Prisma Studio</span>
            </nav>
          </div>
          <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            <span className="hover:text-black cursor-pointer hidden sm:block">Find a Retailer</span>
            <span className="hover:text-black cursor-pointer">Region 🇺🇸</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left Side: Info & Guidelines */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none mb-8">
                Product <br /> Registration
              </h1>
              <p className="text-gray-500 font-light leading-relaxed text-lg">
                To qualify for Factor’s Limited Lifetime Warranty on bicycles and framesets, the original owner must register their product within 15 days of the purchase date.
              </p>
            </div>

            <div className="pt-12 border-t border-gray-100">
              <h2 className="text-2xl font-black uppercase italic tracking-tight mb-6 flex items-center">
                Finding Your Serial Code
              </h2>
              <div className="aspect-[4/3] bg-gray-50 mb-6 flex items-center justify-center relative overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1532298229144-0ee0c335109b?auto=format&fit=crop&q=80&w=800"
                  alt="Bike serial number location"
                  className="object-cover w-full h-full opacity-20 grayscale"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/40">
                  <div className="w-16 h-1 bg-black mb-4"></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black max-w-xs">
                    Look on the underside of the bottom bracket where you will find the barcode.
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Type that code into the space provided to register your frame with Factor. All product information will be verified to ensure authenticity.
              </p>
            </div>
          </div>

          {/* Right Side: The Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 p-8 lg:p-12 shadow-2xl shadow-gray-100/50">
              {/* Step Indicator */}
              <div className="flex items-center space-x-2 mb-12">
                <div className={`h-1 flex-1 ${step >= 1 ? 'bg-black' : 'bg-gray-100'}`}></div>
                <div className={`h-1 flex-1 ${step >= 2 ? 'bg-black' : 'bg-gray-100'}`}></div>
                <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Step 0{step} / 02
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-black uppercase italic tracking-widest border-b border-black pb-4 inline-block">
                      Personal Information
                    </h2>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">Nome Completo</label>
                        <input
                          name="customerName"
                          required
                          className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none"
                          value={formData.customerName}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">Telefone / WhatsApp</label>
                          <input
                            name="customerPhone"
                            required
                            placeholder="+55"
                            className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none"
                            value={formData.customerPhone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">E-mail</label>
                          <input
                            name="customerEmail"
                            type="email"
                            className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none"
                            value={formData.customerEmail}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="group flex items-center justify-between w-full bg-black text-white px-8 py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all rounded-none"
                      >
                        Product Details
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-8">
                      <h2 className="text-xl font-black uppercase italic tracking-widest border-b border-black pb-4 inline-block">
                        Technical Specs
                      </h2>

                      <div className="space-y-8">
                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">Modelo da Bike / Produto</label>
                          <input
                            name="productDescription"
                            required
                            placeholder="Ex: Factor Ostro VAM"
                            className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none"
                            value={formData.productDescription}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors flex items-center">
                              Número de Série
                              <Info className="w-3 h-3 ml-2 text-gray-300" />
                            </label>
                            <input
                              name="serialNumber"
                              required
                              className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none tracking-widest uppercase"
                              value={formData.serialNumber}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">Nota Fiscal (Invoice)</label>
                            <input
                              name="invoiceNumber"
                              required
                              className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none"
                              value={formData.invoiceNumber}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 pt-6">
                      <h2 className="text-xl font-black uppercase italic tracking-widest border-b border-black pb-4 inline-block">
                        Purchase Origin
                      </h2>

                      <div className="space-y-8">
                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">Nome da Loja Autorizada</label>
                          <input
                            name="purchaseStoreName"
                            required
                            className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none"
                            value={formData.purchaseStoreName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">Cidade</label>
                            <input
                              name="purchaseStoreCity"
                              className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-lg font-light transition-all rounded-none"
                              value={formData.purchaseStoreCity}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">Data da Compra</label>
                            <input
                              type="date"
                              name="purchaseDate"
                              required
                              className="w-full bg-white border-b border-gray-200 focus:border-black outline-none py-3 text-sm font-light transition-all rounded-none h-[46px]"
                              value={formData.purchaseDate}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 space-y-8">
                      <label className="flex items-start cursor-pointer group">
                        <div className="relative flex items-center h-5">
                          <input
                            id="policy"
                            type="checkbox"
                            required
                            checked={formData.acceptedPolicy}
                            onChange={e => setFormData(prev => ({ ...prev, acceptedPolicy: e.target.checked }))}
                            className="w-5 h-5 border-2 border-gray-200 rounded-none bg-white text-black focus:ring-black checked:bg-black transition-all cursor-pointer"
                          />
                        </div>
                        <div className="ml-4 text-[11px] text-gray-400 font-medium leading-relaxed group-hover:text-gray-600 transition-colors">
                          Li e concordo com a <span className="text-black font-bold underline underline-offset-4 decoration-1">Política de Privacidade</span> e autorizo o tratamento dos dados para fins de garantia conforme termos da Factor Bikes.
                        </div>
                      </label>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex items-center justify-center p-5 text-gray-400 hover:text-black transition-colors border border-gray-100"
                        >
                          <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-black text-white px-8 py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc- zinc-900 transition-all rounded-none disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Complete Registration'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
          © 2024 Relm Care+ × Factor Bikes
        </p>
        <div className="flex space-x-8 text-[10px] font-black uppercase tracking-widest text-gray-300">
          <span className="hover:text-black cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-black cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-black cursor-pointer transition-colors">Cookie Policy</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicWarrantyForm;