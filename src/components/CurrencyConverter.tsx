import React, { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

interface CurrencyConverterProps {
  className?: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ className = '' }) => {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(83.12);
  const [loading, setLoading] = useState<boolean>(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
  ];

  // Mock exchange rates (in a real app, you'd fetch from an API)
  const mockExchangeRates: { [key: string]: { [key: string]: number } } = {
    USD: { INR: 83.12, EUR: 0.85, GBP: 0.73, JPY: 110.25, AUD: 1.35, CAD: 1.25, CNY: 6.45, SGD: 1.35, AED: 3.67 },
    EUR: { INR: 97.79, USD: 1.18, GBP: 0.86, JPY: 129.89, AUD: 1.59, CAD: 1.47, CNY: 7.60, SGD: 1.59, AED: 4.33 },
    GBP: { INR: 113.84, USD: 1.37, EUR: 1.16, JPY: 151.14, AUD: 1.85, CAD: 1.71, CNY: 8.84, SGD: 1.85, AED: 5.04 },
    INR: { USD: 0.012, EUR: 0.010, GBP: 0.0088, JPY: 1.33, AUD: 0.016, CAD: 0.015, CNY: 0.078, SGD: 0.016, AED: 0.044 },
    JPY: { INR: 0.75, USD: 0.0091, EUR: 0.0077, GBP: 0.0066, AUD: 0.012, CAD: 0.011, CNY: 0.058, SGD: 0.012, AED: 0.033 },
    AUD: { INR: 61.57, USD: 0.74, EUR: 0.63, GBP: 0.54, JPY: 81.67, CAD: 0.93, CNY: 4.78, SGD: 1.00, AED: 2.72 },
    CAD: { INR: 66.50, USD: 0.80, EUR: 0.68, GBP: 0.58, JPY: 88.20, AUD: 1.08, CNY: 5.16, SGD: 1.08, AED: 2.94 },
    CNY: { INR: 12.89, USD: 0.16, EUR: 0.13, GBP: 0.11, JPY: 17.09, AUD: 0.21, CAD: 0.19, SGD: 0.21, AED: 0.57 },
    SGD: { INR: 61.57, USD: 0.74, EUR: 0.63, GBP: 0.54, JPY: 81.67, AUD: 1.00, CAD: 0.93, CNY: 4.78, AED: 2.72 },
    AED: { INR: 22.64, USD: 0.27, EUR: 0.23, GBP: 0.20, JPY: 30.07, AUD: 0.37, CAD: 0.34, CNY: 1.76, SGD: 0.37 }
  };

  const convertCurrency = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setConvertedAmount('');
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const rate = mockExchangeRates[fromCurrency]?.[toCurrency] || 1;
      const result = parseFloat(amount) * rate;
      setConvertedAmount(result.toFixed(2));
      setExchangeRate(rate);
      setLoading(false);
    }, 500);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount('');
  };

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const fromCurrencyInfo = currencies.find(c => c.code === fromCurrency);
  const toCurrencyInfo = currencies.find(c => c.code === toCurrency);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Currency Converter</h3>
      
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-2 text-gray-500 hover:text-orange-500 transition-colors duration-200"
            title="Swap currencies"
          >
            <ArrowsRightLeftIcon className="h-5 w-5" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Result */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
              </div>
            ) : convertedAmount ? (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {toCurrencyInfo?.symbol}{convertedAmount}
                </div>
                <div className="text-sm text-gray-600">
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </div>
              </>
            ) : (
              <div className="text-gray-500">Enter amount to convert</div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center">
          Exchange rates are approximate and for reference only. 
          Check with your bank for actual rates.
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
