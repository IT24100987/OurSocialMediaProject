import { MdCardGiftcard } from 'react-icons/md';

const PACKAGES = [
  {
    name: 'Silver',
    color: 'from-slate-400 to-slate-500',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    features: [
      '1 Social Media Platform',
      'Basic Monthly Report',
      'Email Support',
      '5 Campaign Posts / Month',
      '500 Reach Target',
    ],
    description: 'Ideal for startups and small businesses looking to establish their online presence.'
  },
  {
    name: 'Gold',
    color: 'from-yellow-400 to-amber-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    features: [
      'Up to 3 Social Media Platforms',
      'Bi-Weekly Performance Reports',
      'Priority Email & Chat Support',
      '15 Campaign Posts / Month',
      '2,500 Reach Target',
      'Competitor Analysis',
    ],
    description: 'For growing businesses needing a broader social presence with detailed analytics.'
  },
  {
    name: 'Platinum',
    color: 'from-indigo-400 to-violet-500',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    features: [
      'Up to 5 Platforms + Google Ads',
      'Weekly Detailed Reports',
      'Dedicated Account Manager',
      '30 Campaign Posts / Month',
      '10,000 Reach Target',
      'A/B Testing',
      'AI Sentiment Feedback Analysis',
    ],
    description: 'For established businesses seeking managed campaigns and deep performance insights.'
  },
  {
    name: 'Diamond',
    color: 'from-cyan-400 to-sky-500',
    textColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    features: [
      'Unlimited Platforms + Paid Ads',
      'Real-time Analytics Dashboard',
      '24/7 Dedicated Support Team',
      'Unlimited Monthly Content',
      'Unlimited Reach & Impressions',
      'AI Trend Detection & Forecasting',
      'Custom Branding & Strategy',
      'Monthly Video Production',
    ],
    description: 'Enterprise-grade solution for maximum visibility, reach, and AI-powered strategy.'
  },
];

const PackageManagement = () => {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdCardGiftcard size={36} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Service Packages</h1>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto">
          A complete breakdown of all four subscription tiers and their service offerings. Assign packages to clients via the Client Management page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {PACKAGES.map((pkg, idx) => (
          <div
            key={pkg.name}
            className={`rounded-3xl border-2 ${pkg.borderColor} ${pkg.bgColor} overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col hover:-translate-y-2 duration-300`}
          >
            {/* Package Header */}
            <div className={`bg-gradient-to-br ${pkg.color} text-white p-7 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10">
                <MdCardGiftcard size={180} className="absolute -right-10 -bottom-10" />
              </div>
              <div className="relative z-10">
                <div className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">
                  Tier {idx + 1}
                </div>
                <h2 className="text-3xl font-black">{pkg.name}</h2>
              </div>
            </div>

            {/* Description */}
            <div className="px-6 pt-6 pb-2">
              <p className={`text-sm font-medium leading-relaxed ${pkg.textColor}`}>
                {pkg.description}
              </p>
            </div>

            {/* Features List */}
            <div className="p-6 flex-1">
              <ul className="space-y-3">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-start space-x-2 text-slate-700 text-sm">
                    <span className={`font-black mt-0.5 shrink-0 ${pkg.textColor}`}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="p-6 pt-0">
              <div className={`w-full text-center py-3 rounded-xl font-bold text-sm border-2 ${pkg.borderColor} ${pkg.textColor} bg-white`}>
                {pkg.name} Package
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-10 bg-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm font-medium border border-slate-200 max-w-2xl mx-auto">
        <strong className="text-slate-700">Note for Admins:</strong> Packages are assigned to clients during registration or via the Client Management section. Pricing for each tier is set by management and configured in the CRM system.
      </div>
    </div>
  );
};

export default PackageManagement;
