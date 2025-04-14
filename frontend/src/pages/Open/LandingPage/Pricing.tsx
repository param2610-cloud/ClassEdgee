import React, { useState } from 'react';
import { Check, HelpCircle, X } from 'lucide-react';

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const plans = [
    {
      name: "Basic",
      description: "Perfect for small educational institutions",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: [
        { name: "Smart Attendance System", included: true },
        { name: "Resource Management", included: true },
        { name: "Emergency Alerts", included: true },
        { name: "Basic Analytics", included: true },
        { name: "Up to 500 Students", included: true },
        { name: "Email Support", included: true },
        { name: "Advanced Analytics", included: false },
        { name: "API Access", included: false },
        { name: "White Labeling", included: false },
      ],
      ctaText: "Start Basic",
      accentColor: "blue",
      popular: false
    },
    {
      name: "Standard",
      description: "Ideal for growing colleges and universities",
      monthlyPrice: 399,
      yearlyPrice: 3990,
      features: [
        { name: "Smart Attendance System", included: true },
        { name: "Resource Management", included: true },
        { name: "Emergency Alerts", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Up to 2000 Students", included: true },
        { name: "Priority Support", included: true },
        { name: "API Access", included: true },
        { name: "White Labeling", included: false },
        { name: "Custom Integrations", included: false },
      ],
      ctaText: "Start Standard",
      accentColor: "blue",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large educational networks",
      monthlyPrice: 799,
      yearlyPrice: 7990,
      features: [
        { name: "Smart Attendance System", included: true },
        { name: "Resource Management", included: true },
        { name: "Emergency Alerts", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Unlimited Students", included: true },
        { name: "24/7 Dedicated Support", included: true },
        { name: "API Access", included: true },
        { name: "White Labeling", included: true },
        { name: "Custom Integrations", included: true },
      ],
      ctaText: "Contact Sales",
      accentColor: "blue",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan to transform your educational institution with our smart classroom technology.
          </p>
          
          {/* Billing cycle toggle */}
          <div className="flex justify-center mt-8">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex items-center">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly <span className="text-xs text-green-500 font-bold">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105 md:scale-110' : 'border border-gray-200 shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white py-2 px-4 text-center font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 mt-2">{plan.description}</p>
                
                <div className="mt-6 mb-8">
                  <div className="flex items-end">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-500 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-green-500 text-sm mt-1">
                      Save ${plan.monthlyPrice * 12 - plan.yearlyPrice}
                    </p>
                  )}
                </div>
                
                <button 
                  className={`w-full py-3 px-6 rounded-lg font-medium ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  } transition-colors duration-200`}
                >
                  {plan.ctaText}
                </button>
                
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 flex-shrink-0 mr-3" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            <span className="text-gray-600">Need a custom plan? <a href="#contact" className="text-blue-600 font-medium hover:underline">Contact us</a></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
