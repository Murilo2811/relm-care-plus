import React, { useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, AlertCircle } from 'lucide-react';

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
        itemType: 'Bike' // Default for V1
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-green-50 p-8 rounded-2xl max-w-lg text-center border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold italic uppercase text-gray-900 mb-2">Solicitação Recebida!</h1>
          <p className="text-gray-600 mb-6">Sua garantia foi registrada com sucesso.</p>
          <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
            <p className="text-sm text-gray-500 uppercase mb-1">Seu Protocolo</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{protocol}</p>
          </div>
          <p className="text-sm text-gray-500">Você receberá atualizações via WhatsApp/Email.</p>
          <button onClick={() => window.location.reload()} className="mt-8 text-green-700 font-medium hover:underline">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold italic tracking-tighter text-red-600">RELM <span className="text-white not-italic font-normal">CARE+</span></h1>
            <span className="text-sm text-gray-400 hidden sm:block">Registro Oficial de Garantia</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>1</div>
               <div className={`h-1 flex-1 ${step === 2 ? 'bg-red-600' : 'bg-gray-100'}`}></div>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>2</div>
            </div>
            <h2 className="text-2xl font-bold italic uppercase text-gray-900">
                {step === 1 ? 'Seus Dados' : 'Dados do Produto'}
            </h2>
            <p className="text-gray-500 mt-1">Preencha corretamente para agilizar o processo.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input name="customerName" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.customerName} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp *</label>
                        <input name="customerPhone" required placeholder="(00) 00000-0000" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.customerPhone} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (Opcional)</label>
                        <input name="customerEmail" type="email" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.customerEmail} onChange={handleChange} />
                    </div>
                </div>
                
                <div className="pt-4">
                    <button type="button" onClick={() => setStep(2)} className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold italic uppercase hover:bg-gray-800 transition-colors">
                        Próximo Passo
                    </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo da Bike / Produto *</label>
                    <input name="productDescription" required placeholder="Ex: Relm MTB XC 900" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.productDescription} onChange={handleChange} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série *</label>
                        <input name="serialNumber" required placeholder="Localizado no quadro" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3 font-mono" value={formData.serialNumber} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número da Nota Fiscal *</label>
                        <input name="invoiceNumber" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.invoiceNumber} onChange={handleChange} />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase italic">Onde você comprou?</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja *</label>
                            <input name="purchaseStoreName" required placeholder="Digite o nome da loja exatamente como na nota" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.purchaseStoreName} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade (Loja)</label>
                                <input name="purchaseStoreCity" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.purchaseStoreCity} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Compra</label>
                                <input type="date" name="purchaseDate" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3" value={formData.purchaseDate} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start">
                    <input 
                        id="policy" 
                        type="checkbox" 
                        required 
                        checked={formData.acceptedPolicy}
                        onChange={e => setFormData(prev => ({...prev, acceptedPolicy: e.target.checked}))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1" 
                    />
                    <label htmlFor="policy" className="ml-2 block text-sm text-gray-600">
                        Li e concordo com a <a href="#" className="text-red-600 underline">Política de Privacidade</a> e autorizo o tratamento dos dados para fins de garantia.
                    </label>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-100 text-gray-700 py-4 rounded-lg font-bold italic uppercase hover:bg-gray-200 transition-colors">
                        Voltar
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white py-4 rounded-lg font-bold italic uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                        {loading ? 'Enviando...' : 'Registrar Garantia'}
                    </button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">© 2024 Relm Bikes. Todos os direitos reservados.</p>
      </main>
    </div>
  );
};

export default PublicWarrantyForm;